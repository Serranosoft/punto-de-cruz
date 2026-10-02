function decodeTitle(title) {
    const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
    return title.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (entity, value) => {
        if (value[0] !== '#') return named[value.toLowerCase()] || entity;
        const code = value[1].toLowerCase() === 'x' ? parseInt(value.slice(2), 16) : parseInt(value.slice(1), 10);
        return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : entity;
    });
}

export function validatePatternBooksCatalog(catalog) {
    if (!catalog || !Array.isArray(catalog.books)) throw new Error('Invalid book catalog');
    const ids = new Set();
    const publicUrl = value => typeof value === 'string' && /^https:\/\//i.test(value);
    for (const book of catalog.books) {
        if (!/^[a-z0-9_-]+$/i.test(String(book.id || '')) || ids.has(String(book.id)) || typeof book.title !== 'string' || !publicUrl(book.pdfUrl) ||
            !Array.isArray(book.images) || book.images.length === 0 || book.pageCount !== book.images.length) {
            throw new Error('Invalid pattern book');
        }
        ids.add(String(book.id));
        for (const [index, image] of book.images.entries()) {
            if (image.order !== index + 1 || !publicUrl(image.url) || !(image.width > 0) || !(image.height > 0)) {
                throw new Error('Invalid page or page order');
            }
        }
    }
    const byImportId = new Map(catalog.books.map(book => [book.importId, book]));
    return catalog.books.map(book => {
        // Older WordPress plugin versions derive covers from the first page.
        // Later volumes share volume one's cover even with that catalog format.
        const baseImportId = book.importId?.match(/^(.*)-vol-\d+$/)?.[1];
        const firstVolume = baseImportId && byImportId.get(baseImportId);
        return { ...book, id: String(book.id), title: decodeTitle(book.title), coverUrl: firstVolume?.coverUrl || book.coverUrl };
    });
}
