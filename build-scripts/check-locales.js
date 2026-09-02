const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const { transformSync } = require('@babel/core');
const { I18n } = require('i18n-js');

const root = path.resolve(__dirname, '..');
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const legacyCodes = new Set(['es', 'en', 'ar', 'de', 'fr', 'hi', 'id', 'pt', 'ru', 'pl', 'vi', 'tr', 'it', 'fa']);
const additions = 'th bn fil ta te ms ja ko ur zh-TW uk ro nl-NL he-IL zh-CN zh-HK pt-BR pt-PT mr-IN gu pa ml-IN kn-IN ne-NP si-LK my-MM km-KH el-GR cs-CZ hu-HU sv-SE no-NO da-DK fi-FI bg sk sr hr sl sw af'.split(' ');
const placeholders = (text) => (text.match(/%\{\w+\}/g) || []).sort();
// Proper names, loanwords and spellings shared with English can legitimately remain identical.
const sharedSpellings = new Set([
    '_stashDmcCode', '_dataAnimalesPanda', '_dataHalloween', '_dataAlimentosMaki', '_dataAlimentosSushi',
    '_dataPerrosCaniche', '_dataPerrosCarlino', '_dataPerrosDalmata', '_dataSencilloTorreEiffel',
    '_dataModernosCorazonBff', '_langListHindi', '_langListFarsi', '_dataModernos',
    '_dataAlimentosHamburguesa', '_dataBebe', '_homePopular', '_dataMarcapaginasFloral',
]);
const filipinoLoanwords = new Set(['_headerTitle', '_convertMediaAlbum', '_homeTrend', '_langListIndonesian', '_langListPolish', '_langListVietnamese']);

// Load the same ES modules that Metro uses, without loading React Native in Node.
function loadModule(relativePath) {
    const filename = path.join(root, relativePath);
    const { code } = transformSync(fs.readFileSync(filename, 'utf8'), {
        filename, configFile: false, babelrc: false,
        plugins: ['@babel/plugin-transform-modules-commonjs'],
    });
    const module = { exports: {} };
    new Function('require', 'module', 'exports', code)(createRequire(filename), module, module.exports);
    return module.exports;
}

const { supportedLanguages, matchSupportedLocale, resolveLanguage } = loadModule('src/utils/supported-languages.js');
const { translations } = loadModule('src/utils/localizations.js');
const codes = supportedLanguages.map(({ code }) => code);
assert.equal(new Set(codes).size, codes.length, 'Duplicate picker entries');
assert.deepEqual([...codes].sort(), [...legacyCodes, ...additions].sort(), 'Requested language coverage');
assert.deepEqual(Object.keys(translations).sort(), [...codes].sort(), 'Picker and dictionaries disagree');

// Language choices are autonyms: their labels never depend on the active UI locale.
const pickerSource = fs.readFileSync(path.join(root, 'src/components/lang-list.js'), 'utf8');
assert.match(pickerSource, /nativeName=\{lang\.nativeName\}/, 'Picker must render each language autonym');
assert.doesNotMatch(pickerSource, /_langList|language\.t\(/, 'Picker labels must not come from translated UI copy');
const nativeNames = Object.fromEntries(supportedLanguages.map(({ code, nativeName }) => [code, nativeName]));
assert.deepEqual(
    Object.fromEntries(['es', 'en', 'it', 'tr', 'ar', 'he-IL', 'ja', 'ko', 'zh-CN', 'zh-TW'].map((code) => [code, nativeNames[code]])),
    {
        es: 'Español', en: 'English', it: 'Italiano', tr: 'Türkçe', ar: 'العربية',
        'he-IL': 'עברית', ja: '日本語', ko: '한국어', 'zh-CN': '简体中文', 'zh-TW': '繁體中文（台灣）',
    },
    'Representative language autonyms changed'
);

const config = readJson('app.json').expo;
const plugin = config.plugins.find((entry) => Array.isArray(entry) && entry[0] === 'expo-localization');
assert.deepEqual([...plugin[1].supportedLocales].sort(), [...codes].sort(), 'Native supported locales disagree');
const source = translations.en;
const keys = Object.keys(source).sort();
const variables = { name: 'PROJECT_TEST', progress: 42, count: 3, total: 10, w: 12, h: 18, code: 310 };
const machineTranslationResidue = /Magic Converter|Fabric count|Embroidery beginner|No DMC embroidery threads found|Maximum Circus|Master Stitcher|Thread Mathematician|Pattern Maker|\bskeins?\b|\bhoop\b/i;

for (const { code, nativeName } of supportedLanguages) {
    assert.ok(nativeName.trim(), `Missing native name: ${code}`);
    assert.equal(matchSupportedLocale(code), code, `Canonical locale changed: ${code}`);
    const dictionary = translations[code];
    if (!legacyCodes.has(code)) {
        assert.deepEqual(Object.keys(dictionary).sort(), keys, `${code}: incomplete dictionary`);
        assert.ok(keys.filter((key) => dictionary[key] === source[key]).length < keys.length / 3,
            `${code}: too much untranslated English`);
        for (const key of keys) {
            if (!sharedSpellings.has(key) && !(code === 'fil' && filipinoLoanwords.has(key))) {
                assert.notEqual(dictionary[key], source[key], `${code}.${key}: untranslated English`);
            }
        }
        const native = readJson(config.locales[code]);
        assert.equal(native.android.app_name, dictionary._headerTitle, `${code}: Android title`);
        assert.equal(native.ios.CFBundleDisplayName, dictionary._headerTitle, `${code}: iOS title`);
        for (const permission of ['NSCameraUsageDescription', 'NSPhotoLibraryUsageDescription', 'NSPhotoLibraryAddUsageDescription', 'NSUserTrackingUsageDescription']) {
            assert.ok(native.ios[permission]?.trim(), `${code}: ${permission}`);
        }
        assert.equal(dictionary._itemProgress, '/', `${code}: progress separator must be locale-neutral`);
    }
    const i18n = new I18n(translations, { locale: code, defaultLocale: 'es', enableFallback: true });
    for (const [key, value] of Object.entries(dictionary)) {
        assert.equal(typeof value, 'string', `${code}.${key}: expected a string`);
        assert.ok(value.trim(), `${code}.${key}: empty translation`);
        assert.equal(value, value.trim(), `${code}.${key}: surrounding whitespace`);
        assert.ok(!/\uFFFD|\[\d+\]|876500\d{3}/.test(value), `${code}.${key}: corrupt translation`);
        if (!legacyCodes.has(code)) {
            assert.ok(!machineTranslationResidue.test(value), `${code}.${key}: machine-translation residue: ${value}`);
        }
        if (key in source) assert.deepEqual(placeholders(value), placeholders(source[key]), `${code}.${key}: interpolation mismatch`);
        const rendered = i18n.t(key, variables);
        assert.ok(!/missing (translation|value)|%\{\w+\}/i.test(rendered), `${code}.${key}: ${rendered}`);
    }
    // Legacy dictionaries have two pre-existing gaps; all screens must still resolve through Spanish.
    for (const key of keys) assert.ok(!i18n.t(key, variables).includes('missing translation'), `${code}.${key}: fallback failed`);
}

const cases = [
    ['zh', 'zh-CN'], ['zh-CN', 'zh-CN'], ['zh-SG', 'zh-CN'], ['zh-Hans', 'zh-CN'],
    ['zh-Hans-HK', 'zh-CN'], ['zh-TW', 'zh-TW'], ['zh-Hant', 'zh-TW'],
    ['zh-Hant-TW', 'zh-TW'], ['zh-HK', 'zh-HK'], ['zh-Hant-HK', 'zh-HK'], ['zh-MO', 'zh-HK'],
    ['zh-Hans-u-rg-twzzzz', 'zh-CN'], ['pt_BR', 'pt-BR'], ['pt-Latn-BR', 'pt-BR'],
    ['pt-PT', 'pt-PT'], ['pt', 'pt'], ['pt-AO', 'pt'], ['PT-br', 'pt-BR'],
    ['iw-IL', 'he-IL'], ['iw', 'he-IL'], ['he', 'he-IL'], ['he-IL', 'he-IL'],
    ['nl', 'nl-NL'], ['nl-BE', 'nl-NL'], ['tl-PH', 'fil'], ['fil-PH', 'fil'],
    ['nb-NO', 'no-NO'], ['no', 'no-NO'], ['in-ID', 'id'],
    ['mr', 'mr-IN'], ['ml', 'ml-IN'], ['kn', 'kn-IN'], ['ne', 'ne-NP'],
    ['si', 'si-LK'], ['my', 'my-MM'], ['km', 'km-KH'], ['el', 'el-GR'],
    ['cs', 'cs-CZ'], ['hu', 'hu-HU'], ['sv', 'sv-SE'], ['da', 'da-DK'], ['fi', 'fi-FI'],
    ['es-MX', 'es'], ['en-GB', 'en'], ['ja-JP', 'ja'], ['ur-PK', 'ur'],
    ['xx-XX', null], ['', null], [null, null], [{}, null],
    [{ languageTag: 'zh-Hant-HK', languageCode: 'zh' }, 'zh-HK'],
    [{ languageCode: 'zh', languageScriptCode: 'Hant', regionCode: 'TW' }, 'zh-TW'],
    [{ languageTag: 'zh', languageScriptCode: 'Hant', regionCode: 'TW' }, 'zh-TW'],
    [{ languageTag: 'pt', languageCode: 'pt', regionCode: 'BR' }, 'pt-BR'],
    [{ languageTag: 'pt-PT', regionCode: 'BR' }, 'pt-PT'],
];
for (const [input, expected] of cases) assert.equal(matchSupportedLocale(input), expected, JSON.stringify(input));
assert.equal(resolveLanguage('pt-BR', [{ languageTag: 'ja-JP' }]), 'pt-BR', 'Saved choice takes priority');
assert.equal(resolveLanguage('iw-IL', []), 'he-IL', 'Legacy saved choice');
assert.equal(resolveLanguage(null, [{ languageTag: 'xx-XX' }, { languageTag: 'ko-KR' }]), 'ko', 'Try later device preferences');
assert.equal(resolveLanguage('unknown', [{ languageTag: 'nl-BE' }]), 'nl-NL', 'Invalid stored choice');
assert.equal(resolveLanguage(null, []), 'es', 'Default fallback');
assert.equal(resolveLanguage(null, null), 'es', 'Missing device locales');
assert.notEqual(translations['pt-BR']._itemPdfButton, translations['pt-PT']._itemPdfButton, 'Portuguese regional copy');
assert.notEqual(translations['zh-TW']._settingsPrivacy, translations['zh-HK']._settingsPrivacy, 'Hong Kong regional copy');
console.log(`Validated ${codes.length} locales (${additions.length} additions), ${additions.length * keys.length} new translations, native resources, interpolation and ${cases.length + 6} locale resolution cases.`);
