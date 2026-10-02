const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const cheerio = require('cheerio');
const { PDFDocument } = require('pdf-lib');

const ROOT = path.resolve(__dirname, '..');
const BLOG = 'https://revistasgratisdemanualidades.blogspot.com';
const OUT = path.join(ROOT, 'out');
const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function folderName(title) {
    const safe = title.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').replace(/\s+/g, ' ').trim().replace(/[. ]+$/g, '').slice(0, 110);
    if (!safe) throw new Error('La publicación no tiene un título válido.');
    return /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(safe) ? `Libro ${safe}` : safe;
}

async function request(url, binary = false) {
    for (let attempt = 0; attempt < 4; attempt++) {
        try {
            const response = await fetch(url, {
                signal: AbortSignal.timeout(45000),
                headers: { 'User-Agent': 'PatternBooks/1.0 (personal cross-stitch archive)', Referer: BLOG },
            });
            if (!response.ok) {
                const error = new Error(`HTTP ${response.status}: ${url}`);
                error.retryable = response.status === 429 || response.status >= 500;
                throw error;
            }
            return binary ? Buffer.from(await response.arrayBuffer()) : await response.text();
        } catch (error) {
            if (attempt === 3 || error.retryable === false) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt));
        }
    }
}

function imageUrls(html, postUrl) {
    const $ = cheerio.load(html);
    const body = $('.post-body').first();
    // The template repeats the cover outside the article itself.
    body.find('.post-header, .post-thumbb, script, ins, noscript').remove();
    return body.find('img').toArray().flatMap(img => {
        const element = $(img);
        const src = element.attr('data-src') || element.attr('src');
        const href = element.closest('a').attr('href');
        const original = href && /\.(jpe?g|png)(?:[?#]|$)/i.test(href) ? href : src;
        if (!original) {
            console.warn(`Etiqueta img vacía omitida en ${postUrl}`);
            return [];
        }
        const url = new URL(original, postUrl);
        if (!['https:', 'http:'].includes(url.protocol)) throw new Error(`URL de imagen no compatible: ${url}`);
        // Blogger's s0 URL preserves the original scan resolution.
        if (/(^|\.)(googleusercontent\.com|bp\.blogspot\.com)$/.test(url.hostname)) {
            url.pathname = url.pathname.replace(/\/(?:s\d+(?:-[\w-]+)?|w\d+-h\d+(?:-[\w-]+)?)\//g, '/s0/');
        }
        return [url.href];
    });
}

async function discoverBooks(limit) {
    let url = `${BLOG}/search?q=punto+de+cruz&max-results=10`;
    const visited = new Set();
    const posts = new Map();
    while (url && posts.size < limit) {
        if (visited.has(url) || visited.size >= 100) throw new Error('La paginación no permite encontrar más publicaciones.');
        visited.add(url);
        console.log(`Buscando publicaciones (encontradas: ${posts.size}/${limit})`);
        const $ = cheerio.load(await request(url));
        $('.post-title a').each((_, anchor) => {
            const title = $(anchor).text().replace(/\s+/g, ' ').trim();
            const labels = $(anchor).closest('.post').find('.post-labels').text();
            if (!/punto\s*(?:de\s*)?cruz/.test(normalize(`${title} ${labels}`))) return;
            const postUrl = new URL($(anchor).attr('href'), BLOG).href;
            if (new URL(postUrl).origin === BLOG && posts.size < limit) posts.set(postUrl, { title, sourceUrl: postUrl });
        });
        const next = $('a.blog-pager-older-link').attr('href');
        url = next ? new URL(next, BLOG).href : null;
        if (url && new URL(url).origin !== BLOG) throw new Error('Paginación fuera del blog.');
    }
    if (posts.size !== limit) throw new Error(`Solo se encontraron ${posts.size} de ${limit} publicaciones de punto de cruz.`);
    return [...posts.values()];
}

async function mapConcurrent(items, task, concurrency = 4) {
    const results = new Array(items.length);
    let cursor = 0;
    const workers = await Promise.allSettled(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
        while (cursor < items.length) {
            const index = cursor++;
            results[index] = await task(items[index], index);
        }
    }));
    const failure = workers.find(result => result.status === 'rejected');
    if (failure) throw failure.reason;
    return results;
}

async function archiveBook(post, folder) {
    const urls = imageUrls(await request(post.sourceUrl), post.sourceUrl);
    if (!urls.length) throw new Error(`No hay imágenes en ${post.sourceUrl}`);
    const directory = path.join(OUT, folder);
    await fs.mkdir(directory, { recursive: true });
    console.log(`${post.title}: ${urls.length} imágenes`);
    const pdf = await PDFDocument.create();
    pdf.setTitle(post.title);
    pdf.setSubject(`Imágenes en el orden de la publicación: ${post.sourceUrl}`);
    pdf.setCreator('Libros de patrones');
    const images = await mapConcurrent(urls, async (sourceUrl, index) => {
        let bytes;
        let filename;
        let cache;
        // Reuse only bytes whose manifest matches this exact image URL and checksum.
        try {
            cache = JSON.parse(await fs.readFile(path.join(directory, 'metadata.json'), 'utf8')).images[index];
            if (cache?.sourceUrl === sourceUrl && /^\d+\.(jpg|png)$/.test(cache.filename)) {
                bytes = await fs.readFile(path.join(directory, cache.filename));
                if (createHash('sha256').update(bytes).digest('hex') !== cache.sha256) bytes = null;
            }
        } catch { /* A first run has no cache. */ }
        if (!bytes) bytes = await request(sourceUrl, true);
        const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
        const isPng = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
        if (!isJpeg && !isPng) throw new Error(`La imagen ${index + 1} no es JPEG ni PNG: ${sourceUrl}`);
        filename = `${index + 1}.${isJpeg ? 'jpg' : 'png'}`;
        await fs.writeFile(path.join(directory, filename), bytes);
        return { bytes, filename, sourceUrl, sha256: createHash('sha256').update(bytes).digest('hex'), isJpeg };
    });
    const metadataImages = [];
    // Embed sequentially, independent of the order in which downloads finished.
    for (const [index, image] of images.entries()) {
        const embedded = await (image.isJpeg ? pdf.embedJpg(image.bytes) : pdf.embedPng(image.bytes));
        const { width, height } = embedded;
        const page = pdf.addPage([width, height]);
        page.drawImage(embedded, { x: 0, y: 0, width, height });
        metadataImages.push({ order: index + 1, filename: image.filename, sourceUrl: image.sourceUrl, sha256: image.sha256, width, height });
    }
    const pdfFilename = `${folder}.pdf`;
    const temporaryPdf = path.join(directory, `${pdfFilename}.part`);
    await fs.writeFile(temporaryPdf, await pdf.save());
    await fs.rename(temporaryPdf, path.join(directory, pdfFilename));
    const metadata = { ...post, folder, pdfFilename, pageCount: images.length, images: metadataImages };
    await fs.writeFile(path.join(directory, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`);
    console.log(`PDF creado (${images.length} páginas): ${folder}`);
    return metadata;
}

async function writeCatalog(books) {
    const catalog = { sourceUrl: BLOG, generatedAt: new Date().toISOString(), books };
    await fs.writeFile(path.join(OUT, 'catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`);
    // Scraping creates local archives only. The app reads the published WordPress
    // catalog; never generate static require() calls for these large files.
}

async function main() {
    const args = process.argv.slice(2);
    if (args.length && (args.length !== 2 || args[0] !== '--limit')) throw new Error('Uso: npm run scrape:pattern-books -- [--limit 10]');
    const limit = args.length ? Number(args[1]) : 10;
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error('El límite debe estar entre 1 y 100.');
    const posts = await discoverBooks(limit);
    await fs.mkdir(OUT, { recursive: true });
    const folders = new Set();
    const books = [];
    for (const post of posts) {
        let folder = folderName(post.title);
        if (folders.has(folder.toLowerCase())) folder += ` - ${createHash('sha256').update(post.sourceUrl).digest('hex').slice(0, 8)}`;
        folders.add(folder.toLowerCase());
        books.push(await archiveBook(post, folder));
    }
    await writeCatalog(books);
    console.log(`Terminado: ${books.length} carpetas, ${books.reduce((count, book) => count + book.pageCount, 0)} imágenes y ${books.length} PDF.`);
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { folderName, imageUrls, mapConcurrent };
