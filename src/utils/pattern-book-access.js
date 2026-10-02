import AsyncStorage from '@react-native-async-storage/async-storage';
import { patternBooksEndpoint } from './pattern-books-config';

export const BOOK_ACCESS_DURATION_DAYS = 30;
export const BOOK_ACCESS_DURATION_MS = BOOK_ACCESS_DURATION_DAYS * 24 * 60 * 60 * 1000;
const listeners = new Set();

export function bookAccessKey(book) {
    const identity = book?.importId || book?.id;
    if (!identity) throw new Error('Missing pattern book identity');
    return `pattern-book-access:${patternBooksEndpoint}:${identity}`;
}

export function bookAccessStatus(value, now = Date.now()) {
    const expiry = Number(value);
    const expiresAt = Number.isFinite(expiry) && expiry > 0 ? expiry : 0;
    return { expiresAt, isActive: expiresAt > now };
}

export async function getBookAccessStatus(book, now) {
    const expiry = await AsyncStorage.getItem(bookAccessKey(book));
    return bookAccessStatus(expiry, now ?? Date.now());
}

export async function grantBookAccess(book, now = Date.now()) {
    // A reward grants this book for 30 days from completion, without stacking time.
    const expiresAt = now + BOOK_ACCESS_DURATION_MS;
    await AsyncStorage.setItem(bookAccessKey(book), String(expiresAt));
    listeners.forEach(listener => listener());
    return bookAccessStatus(expiresAt, now);
}

export function subscribeBookAccess(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function formatBookExpiry(expiresAt, locale = 'es') {
    if (!expiresAt) return '';
    try {
        return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(expiresAt));
    } catch {
        return new Date(expiresAt).toLocaleString();
    }
}
