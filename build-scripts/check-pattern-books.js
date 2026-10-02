const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { createRequire } = require('node:module');
const { PDFDocument, PDFName, PDFRawStream, decodePDFRawStream } = require('pdf-lib');
const UPNG = createRequire(require.resolve('pdf-lib'))('@pdf-lib/upng').default;
const { imageUrls, mapConcurrent } = require('./scrape-pattern-books');

async function main() {
    // Exercise template images, empty markup and original Blogger resolutions.
    const parsed = imageUrls(`<div class="post-body"><div class="post-thumbb"><img src="cover.jpg"></div><div><a href="https://blogger.googleusercontent.com/scan/s1600/00.jpg"><img src="preview.jpg"></a><img src=""><img src="2.png"></div></div>`, 'https://example.com/post');
    assert.deepEqual(parsed, ['https://blogger.googleusercontent.com/scan/s0/00.jpg', 'https://example.com/2.png']);
    // Downloads deliberately finish in reverse order; PDF input must retain DOM order.
    assert.deepEqual(await mapConcurrent([1, 2, 3], async item => {
        await new Promise(resolve => setTimeout(resolve, (4 - item) * 10));
        return item;
    }), [1, 2, 3]);

    const out = path.resolve(__dirname, '../out');
    const catalog = JSON.parse(await fs.readFile(path.join(out, 'catalog.json'), 'utf8'));
    assert.equal(catalog.books.length, 10, 'Expected ten books');
    const folders = (await fs.readdir(out, { withFileTypes: true })).filter(item => item.isDirectory()).map(item => item.name);
    assert.deepEqual(folders.sort(), catalog.books.map(book => book.folder).sort(), 'Output folders differ from catalog');
    let pages = 0;
    for (const book of catalog.books) {
        const directory = path.join(out, book.folder);
        const files = await fs.readdir(directory);
        const imageFiles = files.filter(file => /\.(jpg|png)$/i.test(file));
        assert.equal(imageFiles.length, book.pageCount, `${book.title}: image count`);
        assert.equal(files.filter(file => file.endsWith('.pdf')).length, 1, `${book.title}: PDF count`);
        const pdf = await PDFDocument.load(await fs.readFile(path.join(directory, book.pdfFilename)));
        assert.equal(pdf.getPageCount(), book.pageCount, `${book.title}: PDF page count`);
        assert.equal(pdf.getTitle(), book.title, `${book.title}: PDF title`);
        assert.equal(book.images.length, book.pageCount);
        for (const [index, image] of book.images.entries()) {
            assert.equal(image.order, index + 1);
            assert.match(image.filename, new RegExp(`^${index + 1}\\.(jpg|png)$`));
            const bytes = await fs.readFile(path.join(directory, image.filename));
            assert.equal(createHash('sha256').update(bytes).digest('hex'), image.sha256);
            const page = pdf.getPage(index);
            assert.equal(page.getWidth(), image.width);
            assert.equal(page.getHeight(), image.height);
            const objects = page.node.Resources().lookup(PDFName.of('XObject'));
            const streams = objects.values().map(ref => pdf.context.lookup(ref)).filter(obj => obj instanceof PDFRawStream && obj.dict.get(PDFName.of('Subtype'))?.toString() === '/Image');
            assert.equal(streams.length, 1, `${book.title}: page ${index + 1} must contain one scan`);
            if (image.filename.endsWith('.jpg')) {
                assert.deepEqual(Buffer.from(streams[0].getContents()), bytes, `${book.title}: page ${index + 1} scan differs or is out of order`);
            } else {
                const rgba = new Uint8Array(UPNG.toRGBA8(UPNG.decode(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)))[0]);
                const rgb = Buffer.alloc(image.width * image.height * 3);
                const alpha = Buffer.alloc(image.width * image.height);
                for (let pixel = 0; pixel < alpha.length; pixel++) {
                    rgb[pixel * 3] = rgba[pixel * 4];
                    rgb[pixel * 3 + 1] = rgba[pixel * 4 + 1];
                    rgb[pixel * 3 + 2] = rgba[pixel * 4 + 2];
                    alpha[pixel] = rgba[pixel * 4 + 3];
                }
                assert.deepEqual(Buffer.from(decodePDFRawStream(streams[0]).decode()), rgb, `${book.title}: page ${index + 1} PNG pixels differ`);
                const mask = streams[0].dict.get(PDFName.of('SMask'));
                if (mask) assert.deepEqual(Buffer.from(decodePDFRawStream(pdf.context.lookup(mask)).decode()), alpha);
            }
            pages++;
        }
        console.log(`OK: ${book.title} (${book.pageCount} páginas)`);
    }
    console.log(`Verified ten folders and PDFs, ${pages} numbered images, checksums, PDF page order and original dimensions.`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
