const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const babel = require('@babel/core');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const stored = new Map();
let writeError = false;
const storage = {
    getItem: async key => stored.get(key) ?? null,
    removeItem: async key => { stored.delete(key); },
    setItem: async (key, value) => {
        if (writeError) throw new Error('Disk full');
        stored.set(key, value);
    },
};
function load(file, mocks = {}) {
    const filename = path.resolve(file);
    const { code } = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
        filename, configFile: false, babelrc: false,
        plugins: [['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }], '@babel/plugin-transform-modules-commonjs'],
    });
    const module = { exports: {} };
    new Function('require', 'module', 'exports', code)(name => {
        if (Object.hasOwn(mocks, name)) return mocks[name];
        if (name.startsWith('.')) throw new Error(`Missing mock ${name} in ${file}`);
        return require(name);
    }, module, module.exports);
    return module.exports;
}
const access = load('src/utils/pattern-book-access.js', {
    '@react-native-async-storage/async-storage': storage,
    './pattern-books-config': { patternBooksEndpoint: 'https://example.com/books' },
});
const { createBookRewardSession } = load('src/utils/pattern-book-reward-session.js');
const copy = load('src/utils/pattern-books-copy.js');
const bookA = { id: '1', importId: 'book-a', title: 'Book A', pageCount: 2, coverUrl: 'https://example.com/cover.jpg', pdfUrl: 'https://example.com/book.pdf', sourceUrl: 'https://example.com/source', images: [
    { url: 'https://example.com/page-1.jpg', width: 100, height: 150 },
    { url: 'https://example.com/page-2.jpg', width: 100, height: 150 },
] };
const bookB = { ...bookA, id: '2', importId: 'book-b' };
const now = 1800000000000;
let checks = 0;
async function check(name, run) {
    await run();
    checks += 1;
    console.log(`OK ${name}`);
}
function session(grantAccess) {
    const changes = [];
    const value = createBookRewardSession({ grantAccess, onChange: phase => changes.push(phase), onOpened() {}, onClosed() {} });
    return { value, changes };
}

async function main() {
    await check('30 days, independent books, persistence and exact expiry', async () => {
        const granted = await access.grantBookAccess(bookA, now);
        assert.equal(granted.expiresAt, now + 30 * 24 * 60 * 60 * 1000);
        assert.equal((await access.getBookAccessStatus(bookB, now)).isActive, false);
        const restarted = load('src/utils/pattern-book-access.js', {
            '@react-native-async-storage/async-storage': storage,
            './pattern-books-config': { patternBooksEndpoint: 'https://example.com/books' },
        });
        assert.equal((await restarted.getBookAccessStatus({ ...bookA, id: '99' }, now)).isActive, true);
        assert.equal((await restarted.getBookAccessStatus(bookA, granted.expiresAt - 1)).isActive, true);
        assert.equal((await restarted.getBookAccessStatus(bookA, granted.expiresAt)).isActive, false);
        assert.equal((await restarted.getBookAccessStatus(bookA, granted.expiresAt + 1)).isActive, false);
        await access.grantBookAccess(bookA, now);
        assert.equal((await access.getBookAccessStatus(bookA, now)).expiresAt, granted.expiresAt);
    });
    await check('corrupt storage and old general VIP unlock do not grant book access', async () => {
        for (const value of ['invalid', '-1', 'Infinity', 'NaN', '0', '']) {
            stored.set(access.bookAccessKey(bookB), value);
            assert.equal((await access.getBookAccessStatus(bookB, now)).isActive, false);
        }
        stored.set('vip_access_expires_at', String(now + access.BOOK_ACCESS_DURATION_MS));
        stored.delete(access.bookAccessKey(bookB));
        assert.equal((await access.getBookAccessStatus(bookB, now)).isActive, false);
    });
    await check('expiry during an asynchronous storage read denies access', async () => {
        const realNow = Date.now;
        const realGetItem = storage.getItem;
        const expiry = now + access.BOOK_ACCESS_DURATION_MS;
        let clock = expiry - 1;
        Date.now = () => clock;
        storage.getItem = async () => {
            await Promise.resolve();
            clock = expiry;
            return String(expiry);
        };
        try {
            assert.equal((await access.getBookAccessStatus(bookA)).isActive, false);
        } finally {
            Date.now = realNow;
            storage.getItem = realGetItem;
        }
    });
    await check('opening and closing an ad without reward keeps the book locked', async () => {
        let grants = 0;
        const { value, changes } = session(async () => { grants += 1; });
        await value.rewarded(); // Unsolicited event before any user show attempt.
        value.loaded();
        await value.show({ show: async () => {} });
        value.opened();
        value.closed();
        await value.rewarded();
        assert.equal(grants, 0);
        assert.equal(changes.at(-1), 'noReward');
    });
    await check('duplicate reward events and double taps grant once, even when close precedes saving', async () => {
        let complete;
        let grants = 0;
        let shows = 0;
        const { value, changes } = session(() => { grants += 1; return new Promise(resolve => { complete = resolve; }); });
        value.loaded();
        const ad = { show: async () => { shows += 1; } };
        await Promise.all([value.show(ad), value.show(ad)]);
        const pending = value.rewarded();
        await value.rewarded();
        value.closed();
        assert.equal(changes.at(-1), 'saving');
        complete();
        await pending;
        assert.equal(grants, 1);
        assert.equal(shows, 1);
        assert.equal(changes.at(-1), 'unlocked');
    });
    await check('load errors and rejected or throwing show never unlock', async () => {
        let grants = 0;
        for (const show of [async () => { throw new Error('Show failed'); }, () => { throw new Error('Not loaded'); }]) {
            const { value, changes } = session(async () => { grants += 1; });
            value.loaded();
            await value.show({ show });
            await value.rewarded();
            assert.equal(changes.at(-1), 'adError');
        }
        const { value, changes } = session(async () => { grants += 1; });
        value.failed();
        value.loaded();
        await value.show({ show: async () => {} });
        await value.rewarded();
        assert.equal(changes.at(-1), 'adError');
        assert.equal(grants, 0);
    });
    await check('failed persistence remains locked and duplicate callbacks cannot retry the same reward', async () => {
        writeError = true;
        let grants = 0;
        const { value, changes } = session(async () => { grants += 1; await access.grantBookAccess(bookB, now); });
        value.loaded();
        await value.show({ show: async () => {} });
        await value.rewarded();
        await value.rewarded();
        writeError = false;
        assert.equal(grants, 1);
        assert.equal(changes.at(-1), 'saveError');
        assert.equal((await access.getBookAccessStatus(bookB, now)).isActive, false);
    });
    await check('a confirmed reward saves despite unmount during persistence, without updating a disposed screen', async () => {
        let complete;
        const { value, changes } = session(() => new Promise(resolve => { complete = resolve; }));
        value.loaded();
        await value.show({ show: async () => {} });
        const pending = value.rewarded();
        value.dispose();
        complete();
        await pending;
        assert.equal(changes.at(-1), 'saving');
    });

    // Render the actual detail screen with host components and controlled native
    // boundaries. Verify both the rendered gate and a stale PDF button callback.
    let uiAccess = { isActive: false, expiresAt: 0 };
    let permit = false;
    let downloads = 0;
    let saves = 0;
    let folderPrompts = 0;
    let folderGranted = true;
    let httpStatus = 200;
    let expireDuringDownload = false;
    const removed = [];
    const downloader = load('src/utils/pattern-book-download.js', {
        'react-native': { Platform: { OS: 'android' } },
        '@react-native-async-storage/async-storage': storage,
        'expo-file-system/legacy': {
            cacheDirectory: 'cache/', EncodingType: { Base64: 'base64' },
            downloadAsync: async () => { downloads += 1; if (expireDuringDownload) permit = false; return { status: httpStatus }; },
            deleteAsync: async uri => { removed.push(uri); },
            readAsStringAsync: async () => 'JVBERi0=',
            writeAsStringAsync: async () => { saves += 1; },
            StorageAccessFramework: {
                readDirectoryAsync: async () => [],
                requestDirectoryPermissionsAsync: async () => { folderPrompts += 1; return { granted: folderGranted, directoryUri: 'content://downloads' }; },
                createFileAsync: async (_, name) => `content://downloads/${name}`,
            },
        },
    });
    const actions = [];
    let selectedPage = null;
    const selections = [];
    let viewerProps;
    const lang = React.createContext({ language: { locale: 'es' } });
    const passthrough = tag => ({ children }) => React.createElement(tag, null, children);
    const Screen = load('app/pattern-book.js', {
        react: {
            ...React,
            useState: initial => {
                const state = React.useState(initial);
                return initial === null ? [selectedPage, value => selections.push(value)] : state;
            },
        },
        'react-native': {
            View: passthrough('div'), Text: passthrough('span'), ScrollView: passthrough('div'), ActivityIndicator: () => null,
            StyleSheet: { create: value => value }, Platform: { OS: 'android' }, Alert: { alert() {} }, Linking: { openURL: async () => {} },
            TouchableOpacity: props => { actions.push(props); return React.createElement('button', null, props.children); },
            FlatList: ({ data, renderItem, ListHeaderComponent }) => React.createElement('div', null, ListHeaderComponent, data.map((item, index) => React.createElement(React.Fragment, { key: index }, renderItem({ item, index })))),
        },
        'expo-image': { Image: ({ source }) => React.createElement('img', { src: source.uri }) },
        '@expo/vector-icons': { Ionicons: () => null },
        'expo-router': { Stack: { Screen: () => null }, useLocalSearchParams: () => ({ id: '1' }) },
        'react-native-safe-area-context': { useSafeAreaInsets: () => ({ bottom: 0 }) },
        '../src/utils/LangContext': { LangContext: lang },
        '../src/utils/AdsContext': { AdsContext: React.createContext({ setShowOpenAd() {} }) },
        '../src/utils/pattern-books': { usePatternBooks: () => ({ books: [bookA], loading: false, error: false, refresh() {} }) },
        '../src/utils/pattern-books-copy': copy,
        '../src/utils/pattern-book-access': { ...access, getBookAccessStatus: async () => ({ isActive: permit }) },
        '../src/utils/use-pattern-book-access': { usePatternBookAccess: () => ({ statuses: { [access.bookAccessKey(bookA)]: uiAccess }, loading: false, error: false, refresh: async () => {} }) },
        '../src/utils/use-pattern-book-reward': { usePatternBookReward: () => ({ phase: 'ready', unlock() {} }) },
        '../src/utils/pattern-book-download': downloader,
        '../src/components/PatternBookImageViewer': { __esModule: true, default: props => {
            viewerProps = props;
            return React.createElement('div', { 'data-viewer': props.index }, React.createElement('img', { src: props.book.images[props.index].url }));
        } },
    }).default;
    await check('direct detail route hides pages and PDF while locked; unlock shows both in order', async () => {
        const locked = renderToStaticMarkup(React.createElement(Screen));
        assert.ok(locked.includes(bookA.coverUrl));
        assert.ok(!locked.includes(bookA.images[0].url));
        assert.ok(!locked.includes(bookA.images[1].url));
        assert.ok(!locked.includes(copy.getPatternBooksCopy('es').pdf));
        uiAccess = { isActive: true, expiresAt: Date.now() + access.BOOK_ACCESS_DURATION_MS };
        actions.length = 0;
        const unlocked = renderToStaticMarkup(React.createElement(Screen));
        assert.ok(unlocked.includes(copy.getPatternBooksCopy('es').pdf));
        assert.ok(!unlocked.includes('publicación original'));
        assert.ok(!unlocked.includes(bookA.sourceUrl));
        assert.ok(unlocked.indexOf(bookA.images[0].url) < unlocked.indexOf(bookA.images[1].url));
        const savePdf = actions[0].onPress;
        await savePdf(); // Stale button: stored access already expired.
        assert.equal(downloads, 0);
        assert.equal(saves, 0);
        permit = true;
        await savePdf();
        assert.equal(downloads, 1);
        assert.equal(saves, 1);
        expireDuringDownload = true;
        await savePdf();
        assert.equal(downloads, 2);
        assert.equal(saves, 1); // Expiry during download prevents saving externally.
        assert.equal(folderPrompts, 1);
        assert.ok(removed.includes('cache/book-1-download.pdf'));
    });
    await check('image taps check access; the viewer shows the selected page and disappears on expiry', async () => {
        uiAccess = { isActive: true, expiresAt: Date.now() + access.BOOK_ACCESS_DURATION_MS };
        actions.length = 0;
        renderToStaticMarkup(React.createElement(Screen));
        const openSecondPage = actions.find(action => action.accessibilityLabel === 'Ampliar página 2').onPress;
        permit = false;
        selections.length = 0;
        await openSecondPage();
        assert.deepEqual(selections, []);
        permit = true;
        await openSecondPage();
        assert.deepEqual(selections, [1]);
        selectedPage = selections[0];
        const open = renderToStaticMarkup(React.createElement(Screen));
        assert.ok(open.includes('data-viewer="1"'));
        assert.equal(viewerProps.book.images[viewerProps.index].url, bookA.images[1].url);
        viewerProps.onClose();
        assert.equal(selections.at(-1), null);
        uiAccess = { isActive: false, expiresAt: Date.now() - 1 };
        const expired = renderToStaticMarkup(React.createElement(Screen));
        assert.ok(!expired.includes('data-viewer'));
        assert.ok(!expired.includes(bookA.images[1].url));
        selectedPage = null;
    });
    await check('direct download remembers the folder; cancellation and HTTP errors never save a PDF', async () => {
        permit = true;
        expireDuringDownload = false;
        const result = await downloader.downloadBookPdf(bookA, async () => permit);
        assert.equal(result.uri, 'content://downloads/Book A.pdf');
        assert.equal(saves, 2);
        assert.equal(folderPrompts, 1);
        stored.delete('pattern-books:download-directory');
        folderGranted = false;
        const previousDownloads = downloads;
        assert.equal(await downloader.downloadBookPdf(bookA, async () => permit), null);
        assert.equal(downloads, previousDownloads);
        folderGranted = true;
        httpStatus = 500;
        await assert.rejects(downloader.downloadBookPdf(bookA, async () => permit), /HTTP 500/);
        assert.equal(saves, 2);
    });
    await check('volumes share the original cover and have independent 30-day unlocks', async () => {
        const { validatePatternBooksCatalog } = load('src/utils/pattern-books-catalog.js');
        const first = { ...bookA, title: 'Book A - Volumen 1', images: bookA.images.map((image, index) => ({ ...image, order: index + 1 })) };
        const second = { ...first, id: '3', importId: `${bookA.importId}-vol-2`, title: 'Book A - Volumen 2', coverUrl: 'https://example.com/different.jpg' };
        const books = validatePatternBooksCatalog({ books: [first, second] });
        assert.equal(books[0].coverUrl, books[1].coverUrl);
        await access.grantBookAccess(books[0], now);
        assert.equal((await access.getBookAccessStatus(books[1], now)).isActive, false);
    });
    console.log(`${checks} pattern book reward/access checks passed.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
