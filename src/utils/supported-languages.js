// Native names make the language picker usable even after choosing an unfamiliar language.
export const supportedLanguages = [
    { code: 'es', nativeName: 'Español' },
    { code: 'en', nativeName: 'English' },
    { code: 'ar', nativeName: 'العربية', rtl: true },
    { code: 'de', nativeName: 'Deutsch' },
    { code: 'fr', nativeName: 'Français' },
    { code: 'hi', nativeName: 'हिन्दी' },
    { code: 'id', nativeName: 'Bahasa Indonesia' },
    { code: 'pt', nativeName: 'Português' },
    { code: 'ru', nativeName: 'Русский' },
    { code: 'pl', nativeName: 'Polski' },
    { code: 'vi', nativeName: 'Tiếng Việt' },
    { code: 'tr', nativeName: 'Türkçe' },
    { code: 'it', nativeName: 'Italiano' },
    { code: 'fa', nativeName: 'فارسی', rtl: true },
    { code: 'th', nativeName: 'ไทย' },
    { code: 'bn', nativeName: 'বাংলা' },
    { code: 'fil', nativeName: 'Filipino' },
    { code: 'ta', nativeName: 'தமிழ்' },
    { code: 'te', nativeName: 'తెలుగు' },
    { code: 'ms', nativeName: 'Bahasa Melayu' },
    { code: 'ja', nativeName: '日本語' },
    { code: 'ko', nativeName: '한국어' },
    { code: 'ur', nativeName: 'اردو', rtl: true },
    { code: 'zh-TW', nativeName: '繁體中文（台灣）' },
    { code: 'uk', nativeName: 'Українська' },
    { code: 'ro', nativeName: 'Română' },
    { code: 'nl-NL', nativeName: 'Nederlands' },
    { code: 'he-IL', nativeName: 'עברית', rtl: true },
    { code: 'zh-CN', nativeName: '简体中文' },
    { code: 'zh-HK', nativeName: '繁體中文（香港）' },
    { code: 'pt-BR', nativeName: 'Português (Brasil)' },
    { code: 'pt-PT', nativeName: 'Português (Portugal)' },
    { code: 'mr-IN', nativeName: 'मराठी' },
    { code: 'gu', nativeName: 'ગુજરાતી' },
    { code: 'pa', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'ml-IN', nativeName: 'മലയാളം' },
    { code: 'kn-IN', nativeName: 'ಕನ್ನಡ' },
    { code: 'ne-NP', nativeName: 'नेपाली' },
    { code: 'si-LK', nativeName: 'සිංහල' },
    { code: 'my-MM', nativeName: 'မြန်မာ' },
    { code: 'km-KH', nativeName: 'ខ្មែរ' },
    { code: 'el-GR', nativeName: 'Ελληνικά' },
    { code: 'cs-CZ', nativeName: 'Čeština' },
    { code: 'hu-HU', nativeName: 'Magyar' },
    { code: 'sv-SE', nativeName: 'Svenska' },
    { code: 'no-NO', nativeName: 'Norsk (bokmål)' },
    { code: 'da-DK', nativeName: 'Dansk' },
    { code: 'fi-FI', nativeName: 'Suomi' },
    { code: 'bg', nativeName: 'Български' },
    { code: 'sk', nativeName: 'Slovenčina' },
    { code: 'sr', nativeName: 'Српски' },
    { code: 'hr', nativeName: 'Hrvatski' },
    { code: 'sl', nativeName: 'Slovenščina' },
    { code: 'sw', nativeName: 'Kiswahili' },
    { code: 'af', nativeName: 'Afrikaans' },
];

const codesByTag = new Map(supportedLanguages.map(({ code }) => [code.toLowerCase(), code]));
const codesByLanguage = new Map();
for (const { code } of supportedLanguages) {
    const base = code.split('-')[0];
    if (!codesByLanguage.has(base)) codesByLanguage.set(base, code);
}

const legacyLanguageCodes = { iw: 'he', in: 'id', tl: 'fil', nb: 'no' };

export function matchSupportedLocale(locale) {
    if (!locale) return null;
    const tag = typeof locale === 'string'
        ? locale
        : locale.languageTag || [locale.languageCode, locale.languageScriptCode, locale.regionCode].filter(Boolean).join('-');
    if (typeof tag !== 'string') return null;

    const parts = tag.trim().replace(/_/g, '-').toLowerCase().split('-');
    const base = legacyLanguageCodes[parts[0]] || parts[0];
    parts[0] = base;
    const exact = codesByTag.get(parts.join('-'));
    if (exact && (typeof locale === 'string' || parts.length > 1)) return exact;

    // Do not interpret Unicode/private-use extensions as region or script subtags.
    const extension = parts.findIndex((part, index) => index > 0 && part.length === 1);
    const core = extension < 0 ? parts : parts.slice(0, extension);
    const script = core.find((part, index) => index > 0 && /^[a-z]{4}$/.test(part))
        || (typeof locale === 'object' ? locale.languageScriptCode?.toLowerCase() : null);
    const region = core.find((part, index) => index > 0 && /^([a-z]{2}|\d{3})$/.test(part))
        || (typeof locale === 'object' ? (locale.languageRegionCode || locale.regionCode)?.toLowerCase() : null);

    if (base === 'zh') {
        if (script === 'hans') return 'zh-CN';
        if (region === 'hk' || region === 'mo') return 'zh-HK';
        if (script === 'hant' || region === 'tw') return 'zh-TW';
        return 'zh-CN';
    }

    const regional = region && codesByTag.get(`${base}-${region}`);
    return regional || codesByLanguage.get(base) || null;
}

export function resolveLanguage(savedLanguage, deviceLocales = []) {
    const saved = matchSupportedLocale(savedLanguage);
    if (saved) return saved;
    for (const locale of deviceLocales || []) {
        const supported = matchSupportedLocale(locale);
        if (supported) return supported;
    }
    return 'es';
}
