const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { PDFDocument, PDFArray, PDFDict, PDFName, PDFRawStream } = require('pdf-lib');

const ROOT = path.resolve(__dirname, '..');
const WORK = path.join(ROOT, 'tmp', 'pattern-book-volumes');
const PLAN = path.join(WORK, 'plan.json');
const STATE = path.join(WORK, 'state.json');
const MAX_PAGES = 25;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const decodeTitle = title => title.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code))).replace(/&amp;/g, '&');

async function fetchBytes(url) {
    const response = await fetch(url, { signal: AbortSignal.timeout(300000), redirect: 'error' });
    if (!response.ok) throw new Error(`HTTP ${response.status} downloading PDF`);
    return Buffer.from(await response.arrayBuffer());
}

function pageFingerprint(doc, page) {
    const digest = createHash('sha256');
    digest.update(JSON.stringify({ size: page.getSize(), rotation: page.getRotation(), box: page.getCropBox() }));
    const raw = page.node.Contents();
    const contents = raw ? doc.context.lookup(raw) : null;
    const streams = contents instanceof PDFArray ? contents.asArray().map(ref => doc.context.lookup(ref)) : [contents];
    for (const stream of streams) if (stream instanceof PDFRawStream) digest.update(stream.getContents());
    const resources = page.node.Resources();
    const images = resources?.lookup(PDFName.of('XObject'), PDFDict);
    if (images) {
        for (const key of images.keys().sort((a, b) => a.toString().localeCompare(b.toString()))) {
            digest.update(key.toString());
            const image = images.lookup(key);
            if (image instanceof PDFRawStream) digest.update(image.getContents());
        }
    }
    return digest.digest('hex');
}

async function prepare(base) {
    await fs.mkdir(WORK, { recursive: true });
    let originals;
    try {
        originals = JSON.parse(await fs.readFile(path.join(WORK, 'original-catalog.json'), 'utf8')).books;
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        const response = await fetch(`${base}/wp-json/pattern-books/v1/books`, { signal: AbortSignal.timeout(45000) });
        if (!response.ok) throw new Error(`Catalog HTTP ${response.status}`);
        const catalog = await response.json();
        originals = catalog.books;
        await fs.writeFile(path.join(WORK, 'original-catalog.json'), JSON.stringify(catalog, null, 2));
    }
    const plan = { site: base, maxPages: MAX_PAGES, originalPages: originals.reduce((sum, book) => sum + book.pageCount, 0), books: [], splitSources: [] };
    for (const [order, book] of originals.entries()) {
        if (book.pageCount <= MAX_PAGES) {
            plan.books.push({ ...book, originalId: book.id, menuOrder: order * 10, volume: 0 });
            continue;
        }
        const sourcePath = path.join(WORK, `${book.importId}-original.pdf`);
        let source;
        try { source = await fs.readFile(sourcePath); }
        catch (error) {
            if (error.code !== 'ENOENT') throw error;
            source = await fetchBytes(book.pdfUrl);
            await fs.writeFile(sourcePath, source);
        }
        const original = await PDFDocument.load(source);
        if (original.getPageCount() !== book.pageCount) throw new Error(`Page count mismatch: ${book.title}`);
        const fingerprints = original.getPages().map(page => pageFingerprint(original, page));
        plan.splitSources.push({ importId: book.importId, originalPath: sourcePath, pageCount: book.pageCount });
        for (let start = 0, volume = 1; start < book.pageCount; start += MAX_PAGES, volume += 1) {
            const images = book.images.slice(start, start + MAX_PAGES).map((image, index) => ({ ...image, order: index + 1 }));
            const title = `${decodeTitle(book.title)} - Volumen ${volume}`;
            const importId = volume === 1 ? book.importId : `${book.importId}-vol-${volume}`;
            const doc = await PDFDocument.create();
            const pages = await doc.copyPages(original, Array.from({ length: images.length }, (_, index) => start + index));
            pages.forEach(page => doc.addPage(page));
            doc.setTitle(title);
            const bytes = Buffer.from(await doc.save());
            const check = await PDFDocument.load(bytes);
            assertEqual(check.getPages().map(page => pageFingerprint(check, page)), fingerprints.slice(start, start + images.length), `PDF page content/order: ${title}`);
            const filename = `${importId}.pdf`;
            await fs.writeFile(path.join(WORK, filename), bytes);
            plan.books.push({
                ...book, title, importId, images, pageCount: images.length, volume, start,
                originalId: book.id, pdfFile: filename, sha256: hash(bytes),
                menuOrder: order * 10 + volume - 1, coverId: book.images[0].id,
            });
            console.log(`Prepared ${title}: ${images.length} pages (${start + 1}-${start + images.length})`);
        }
    }
    if (plan.books.some(book => book.pageCount > MAX_PAGES)) throw new Error('A volume exceeds 25 pages');
    if (plan.books.reduce((sum, book) => sum + book.pageCount, 0) !== plan.originalPages) throw new Error('Lost pages');
    await fs.writeFile(PLAN, JSON.stringify(plan, null, 2));
    console.log(`Prepared ${plan.books.length} books/volumes, ${plan.originalPages} pages. Nothing published yet.`);
}

function assertEqual(actual, expected, label) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`Verification failed: ${label}`);
}

async function apply(base) {
    const plan = JSON.parse(await fs.readFile(PLAN, 'utf8'));
    if (plan.site !== base) throw new Error('Plan belongs to another site');
    const username = process.env.WP_USERNAME;
    const password = process.env.WP_APP_PASSWORD?.replace(/\s/g, '');
    if (!username || !password) throw new Error('Set WP_USERNAME and WP_APP_PASSWORD');
    const authorization = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
    async function request(route, options = {}) {
        const response = await fetch(`${base}/wp-json/${route}`, {
            ...options, signal: AbortSignal.timeout(300000), redirect: 'error',
            headers: { Authorization: authorization, ...options.headers },
        });
        const result = await response.json();
        if (!response.ok) throw new Error(`WordPress ${response.status}: ${result.code || 'request_failed'}`);
        return result;
    }
    const post = (route, body) => request(route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const user = await request('wp/v2/users/me?context=edit');
    if (!user.capabilities?.upload_files || !user.capabilities?.publish_posts) throw new Error('Insufficient WordPress permissions');
    let state = { site: base, books: {}, pdfs: {} };
    try { state = JSON.parse(await fs.readFile(STATE, 'utf8')); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (state.site !== base) throw new Error('Checkpoint belongs to another site');
    const checkpoint = async () => {
        await fs.writeFile(`${STATE}.part`, JSON.stringify(state, null, 2));
        await fs.rename(`${STATE}.part`, STATE);
    };

    // Stage every new record and PDF before modifying the original published books.
    for (const book of plan.books.filter(book => book.volume)) {
        let bookId = book.volume === 1 ? Number(book.originalId) : state.books[book.importId];
        if (!bookId) {
            const slug = `pb-${book.importId}`;
            const existing = await request(`wp/v2/pattern-books?context=edit&status=publish,draft,pending,private&slug=${slug}`);
            const created = existing[0] || await post('wp/v2/pattern-books', {
                title: book.title, slug, status: 'draft',
                meta: { pdcr_import_id: book.importId, pdcr_image_ids: book.images.map(image => image.id), pdcr_source_url: '', pdcr_pdf_id: 0 },
            });
            bookId = created.id;
            state.books[book.importId] = bookId;
            await checkpoint();
        }
        if (!state.pdfs[book.importId] || state.pdfs[book.importId].sha256 !== book.sha256) {
            const slug = `pb-${book.importId}-volume-pdf-${book.sha256.slice(0, 12)}`;
            const existing = await request(`wp/v2/media?slug=${slug}&context=edit`);
            let media = existing[0];
            if (!media) {
                const bytes = await fs.readFile(path.join(WORK, book.pdfFile));
                if (hash(bytes) !== book.sha256) throw new Error('Prepared PDF changed');
                media = await request('wp/v2/media', {
                    method: 'POST', body: bytes,
                    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${slug}.pdf"` },
                });
            }
            await post(`wp/v2/media/${media.id}`, { title: `${book.title} - PDF`, slug, post: bookId, description: `${book.title}. ${book.pageCount} páginas.` });
            state.pdfs[book.importId] = { id: media.id, url: media.source_url, sha256: book.sha256 };
            await checkpoint();
        }
        console.log(`Staged ${book.title}`);
    }

    for (const book of plan.books) {
        const id = book.volume > 1 ? state.books[book.importId] : Number(book.originalId);
        const meta = { pdcr_source_url: '' };
        if (book.volume) Object.assign(meta, {
            pdcr_import_id: book.importId,
            pdcr_image_ids: book.images.map(image => image.id),
            pdcr_pdf_id: state.pdfs[book.importId].id,
        });
        await post(`wp/v2/pattern-books/${id}`, {
            title: decodeTitle(book.title), status: 'publish', menu_order: book.menuOrder,
            featured_media: book.coverId || book.images[0].id, meta,
        });
        console.log(`Published ${book.title}`);
    }
    const catalog = await request('pattern-books/v1/books');
    assertEqual(catalog.books.length, plan.books.length, 'catalog count');
    assertEqual(catalog.books.reduce((sum, book) => sum + book.pageCount, 0), plan.originalPages, 'total pages');
    for (const [index, expected] of plan.books.entries()) {
        const actual = catalog.books[index];
        assertEqual(actual.importId, expected.importId, 'volume identity/order');
        assertEqual(actual.images.map(image => image.id), expected.images.map(image => image.id), 'image identity/order');
        assertEqual(actual.images.map(image => image.order), expected.images.map((_, index) => index + 1), 'page numbering');
        if (actual.pageCount > MAX_PAGES || actual.sourceUrl) throw new Error('Unsplit book or original source link');
        if (expected.volume) {
            const bytes = await fetchBytes(actual.pdfUrl);
            assertEqual(hash(bytes), expected.sha256, 'published PDF bytes');
            const doc = await PDFDocument.load(bytes);
            assertEqual(doc.getPageCount(), expected.pageCount, 'published PDF pages');
            const record = await request(`wp/v2/pattern-books/${actual.id}?context=edit`);
            assertEqual(record.featured_media, expected.coverId, 'shared cover');
        }
    }
    await fs.writeFile(path.join(WORK, 'verified-catalog.json'), JSON.stringify(catalog, null, 2));
    console.log(`VERIFIED ${catalog.books.length} books/volumes, ${plan.originalPages} images in order, all PDFs verified. No original links.`);
}

async function main() {
    const url = new URL(process.env.WP_URL || 'https://mollydigital.manu-scholz.com');
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('WP_URL must be a plain HTTPS URL');
    const base = url.href.replace(/\/$/, '');
    if (process.argv.includes('--prepare')) await prepare(base);
    else if (process.argv.includes('--apply')) await apply(base);
    else throw new Error('Use --prepare to build and verify PDFs, then --apply to publish the prepared plan.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
