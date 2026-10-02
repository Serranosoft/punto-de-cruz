const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { transformSync } = require('@babel/core');
const { mapConcurrent } = require('./upload-pattern-books');

const ROOT = path.resolve(__dirname, '..');
async function load(file) {
    const module = { exports: {} };
    const { code } = transformSync(await fs.readFile(path.join(ROOT, file), 'utf8'), {
        configFile: false, babelrc: false, plugins: ['@babel/plugin-transform-modules-commonjs'],
    });
    new Function('module', 'exports', code)(module, module.exports);
    return module.exports;
}
async function main() {
    const { validatePatternBooksCatalog } = await load('src/utils/pattern-books-catalog.js');
    const { patternBooksEndpoint } = await load('src/utils/pattern-books-config.js');
    const response = await fetch(patternBooksEndpoint, { signal: AbortSignal.timeout(45000) });
    assert.equal(response.status, 200, 'Catalog must be accessible without authentication');
    const catalog = await response.json();
    const books = validatePatternBooksCatalog(catalog);
    assert.equal(books.length, Number(process.env.PATTERN_BOOKS_EXPECTED_COUNT || 18));
    assert.equal(books.reduce((sum, book) => sum + book.pageCount, 0), Number(process.env.PATTERN_BOOKS_EXPECTED_PAGES || 353));
    const unordered = structuredClone(catalog);
    [unordered.books[0].images[0], unordered.books[0].images[1]] = [unordered.books[0].images[1], unordered.books[0].images[0]];
    assert.throws(() => validatePatternBooksCatalog(unordered), /order/);
    const duplicate = structuredClone(catalog);
    duplicate.books.push(duplicate.books[0]);
    assert.throws(() => validatePatternBooksCatalog(duplicate), /book/);
    const mediaIds = new Set();
    let verifiedFiles = 0;
    for (const book of books) {
        assert.ok(book.pageCount <= 25, 'A book exceeds 25 pages');
        assert.ok(!book.sourceUrl, 'Original publication link still exists');
        const base = book.importId?.match(/^(.*)-vol-\d+$/)?.[1];
        if (base) assert.equal(book.coverUrl, books.find(item => item.importId === base)?.coverUrl, 'Series covers differ');
        for (const image of book.images) {
            assert.ok(!mediaIds.has(image.id), 'Page duplicated across volumes');
            mediaIds.add(image.id);
        }
        const files = [{ url: book.pdfUrl, type: 'application/pdf' }, ...book.images.map(image => ({ url: image.url, type: 'image/' }))];
        await mapConcurrent(files, async file => {
            const head = await fetch(file.url, { method: 'HEAD', signal: AbortSignal.timeout(45000) });
            assert.equal(head.status, 200, 'Public file inaccessible');
            assert.ok(Number(head.headers.get('content-length')) > 0, 'Empty file');
            assert.ok(head.headers.get('content-type')?.includes(file.type), 'Wrong MIME type');
            verifiedFiles += 1;
        }, 8);
        console.log('OK: ' + book.title + ' (' + book.pageCount + ' pages and PDF)');
    }
    assert.equal(mediaIds.size, books.reduce((sum, book) => sum + book.pageCount, 0));
    console.log('Verified ' + books.length + ' books/volumes and ' + verifiedFiles + ' public files; ordered pages, shared covers, no original links.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
