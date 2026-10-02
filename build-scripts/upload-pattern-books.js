const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'out');
const statePath = path.join(OUT, 'wordpress-upload-state.json');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

async function mapConcurrent(items, task, concurrency = 3) {
    const results = new Array(items.length);
    let cursor = 0;
    let failed = false;
    const workers = await Promise.allSettled(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
        while (!failed && cursor < items.length) {
            const index = cursor++;
            try { results[index] = await task(items[index], index); }
            catch (error) { failed = true; throw error; }
        }
    }));
    const failure = workers.find(worker => worker.status === 'rejected');
    if (failure) throw failure.reason;
    return results;
}

async function main() {
    const url = new URL(process.env.WP_URL || 'https://invalid.local');
    if (!process.env.WP_URL || url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('WP_URL debe ser la URL HTTPS de WordPress.');
    const base = url.href.replace(/\/$/, '');
    const username = process.env.WP_USERNAME;
    const password = process.env.WP_APP_PASSWORD?.replace(/\s/g, '');
    if (!username || !password) throw new Error('Define WP_USERNAME y WP_APP_PASSWORD en el entorno.');
    const authorization = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

    async function request(route, options = {}) {
        const response = await fetch(`${base}/wp-json/${route}`, {
            ...options,
            redirect: 'error',
            signal: AbortSignal.timeout(options.body instanceof Buffer ? 300000 : 45000),
            headers: { Authorization: authorization, ...(options.headers || {}) },
        });
        const text = await response.text();
        let result;
        try { result = JSON.parse(text); } catch { throw new Error(`WordPress devolvió HTTP ${response.status} sin JSON (${route.split('?')[0]}).`); }
        if (!response.ok) throw new Error(`WordPress HTTP ${response.status}: ${result.code || 'request_failed'} (${route.split('?')[0]}).`);
        return result;
    }
    const jsonRequest = (route, body) => request(route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const catalog = JSON.parse(await fs.readFile(path.join(OUT, 'catalog.json'), 'utf8'));
    if (catalog.books.length !== 10) throw new Error('Esta importación requiere los diez libros preparados.');
    const user = await request('wp/v2/users/me?context=edit');
    if (!user.capabilities?.upload_files || !user.capabilities?.edit_posts || !user.capabilities?.publish_posts) throw new Error('La cuenta necesita permisos para subir archivos, editar y publicar libros.');
    const index = await request('');
    if (!index.routes?.['/wp/v2/pattern-books'] || !index.routes?.['/pattern-books/v1/books']) throw new Error('Instala y activa el plugin wordpress/pattern-books.zip antes de importar los libros.');
    let state = { site: base, books: {}, media: {} };
    try {
        const previous = JSON.parse(await fs.readFile(statePath, 'utf8'));
        if (previous.site !== base) throw new Error('El registro de subida pertenece a otro WordPress.');
        state = previous;
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }
    let pendingCheckpoint = Promise.resolve();
    async function checkpoint() {
        pendingCheckpoint = pendingCheckpoint.then(async () => {
            await fs.writeFile(`${statePath}.part`, `${JSON.stringify(state, null, 2)}\n`);
            await fs.rename(`${statePath}.part`, statePath);
        });
        await pendingCheckpoint;
    }

    async function uploadFile(book, bookId, importId, filename, order) {
        const bytes = await fs.readFile(path.join(OUT, book.folder, filename));
        const checksum = hash(bytes);
        const type = filename.endsWith('.pdf') ? 'application/pdf' : filename.endsWith('.png') ? 'image/png' : 'image/jpeg';
        const suffix = type === 'application/pdf' ? 'pdf' : `pagina-${String(order).padStart(3, '0')}`;
        const slug = `pb-${importId}-${suffix}-${checksum.slice(0, 12)}`;
        const key = `${importId}/${filename}`;
        let media;
        let created = false;
        const metadata = {
            post: bookId,
            title: type === 'application/pdf' ? `${book.title} — PDF` : `${book.title} — página ${String(order).padStart(3, '0')}`,
            ...(type.startsWith('image/') ? { alt_text: `${book.title}, página ${order}` } : {}),
            description: `Libro: ${book.title}. ${type === 'application/pdf' ? 'PDF completo.' : `Página ${order} de ${book.pageCount}.`} Origen: ${book.sourceUrl}`,
        };
        const saved = state.media[key];
        if (saved?.sha256 === checksum) {
            try { media = await request(`wp/v2/media/${saved.id}?context=edit`); }
            catch { /* Reconcile using the deterministic slug if the saved item disappeared. */ }
        }
        if (!media) media = (await request(`wp/v2/media?slug=${slug}&context=edit`))[0];
        if (!media) {
            const extension = type === 'application/pdf' ? 'pdf' : type === 'image/png' ? 'png' : 'jpg';
            const params = new URLSearchParams({ slug, ...metadata });
            try {
                media = await request(`wp/v2/media?${params}`, {
                    method: 'POST', body: bytes,
                    headers: { 'Content-Type': type, 'Content-Disposition': `attachment; filename="${slug}.${extension}"` },
                });
                created = true;
            } catch (error) {
                // A timeout may occur after WordPress has saved the file. Recover
                // by slug; never blindly retry a media POST and create duplicates.
                media = (await request(`wp/v2/media?slug=${slug}&context=edit`))[0];
                if (!media) throw error;
            }
        }
        if (media.slug !== slug || media.mime_type !== type) throw new Error(`El adjunto ${filename} no coincide con la importación.`);
        if (!created && (!saved || media.post !== bookId || media.title?.raw !== metadata.title)) await jsonRequest(`wp/v2/media/${media.id}`, metadata);
        state.media[key] = { id: media.id, slug, sha256: checksum, url: media.source_url };
        await checkpoint();
        return media.id;
    }

    for (const [index, book] of catalog.books.entries()) {
        const importId = createHash('sha256').update(book.sourceUrl).digest('hex').slice(0, 16);
        const slug = `libro-${importId}`;
        let post = (await request(`wp/v2/pattern-books?slug=${slug}&status=any&context=edit`))[0];
        if (!post) post = await jsonRequest('wp/v2/pattern-books', {
            title: book.title, slug, status: 'draft', menu_order: index + 1,
            meta: { pdcr_import_id: importId, pdcr_source_url: book.sourceUrl, pdcr_image_ids: [], pdcr_pdf_id: 0 },
        });
        if (post.meta?.pdcr_import_id !== importId) throw new Error(`El libro ${book.title} ya existe con otra identidad.`);
        state.books[importId] = { id: post.id, slug };
        await checkpoint();
        console.log(`Libro ${index + 1}/10: ${book.title}`);
        const ids = await mapConcurrent(book.images, async image => {
            const id = await uploadFile(book, post.id, importId, image.filename, image.order);
            console.log(`  Imagen ${image.order}/${book.pageCount} guardada`);
            return id;
        });
        const pdfId = await uploadFile(book, post.id, importId, book.pdfFilename, 0);
        await jsonRequest(`wp/v2/pattern-books/${post.id}`, {
            title: book.title, status: 'publish', menu_order: index + 1, featured_media: ids[0],
            meta: { pdcr_import_id: importId, pdcr_source_url: book.sourceUrl, pdcr_pdf_id: pdfId, pdcr_image_ids: ids },
        });
        console.log(`  Publicado con ${ids.length} páginas y PDF`);
    }

    const endpoint = `${base}/wp-json/pattern-books/v1/books`;
    const publicResponse = await fetch(endpoint, { redirect: 'error', signal: AbortSignal.timeout(45000) });
    if (!publicResponse.ok) throw new Error('El catálogo debe ser accesible sin credenciales para que funcione la app.');
    const published = await publicResponse.json();
    for (const book of catalog.books) {
        console.log(`Verificando URLs públicas: ${book.title}`);
        const importId = createHash('sha256').update(book.sourceUrl).digest('hex').slice(0, 16);
        const remote = published.books.find(item => item.importId === importId);
        if (!remote || remote.pageCount !== book.pageCount || remote.images.length !== book.images.length) throw new Error(`Catálogo incompleto: ${book.title}`);
        for (const [index, image] of book.images.entries()) {
            const page = remote.images[index];
            if (page.order !== index + 1 || page.id !== state.media[`${importId}/${image.filename}`].id || page.width !== image.width || page.height !== image.height) throw new Error(`Orden o dimensiones incorrectos: ${book.title}, página ${index + 1}`);
        }
        await mapConcurrent([remote.pdfUrl, ...remote.images.map(image => image.url)], async mediaUrl => {
            if (!mediaUrl.startsWith('https://')) throw new Error('WordPress debe servir los archivos por HTTPS.');
            const response = await fetch(mediaUrl, { method: 'HEAD', signal: AbortSignal.timeout(45000) });
            if (!response.ok) throw new Error(`Archivo no accesible públicamente: ${book.title}`);
        }, 8);
    }
    // Credentials are deliberately never written to disk or into app code.
    await fs.writeFile(path.join(OUT, 'wordpress-catalog.json'), `${JSON.stringify(published, null, 2)}\n`);
    await fs.writeFile(path.join(ROOT, 'src/utils/pattern-books-config.js'), `// Public catalog URL only. WordPress credentials never belong in the app.\nexport const patternBooksEndpoint = process.env.EXPO_PUBLIC_PATTERN_BOOKS_URL || ${JSON.stringify(endpoint)};\n`);
    console.log('Completado: diez libros en WordPress, imágenes en orden y app configurada con el catálogo público.');
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { mapConcurrent };
