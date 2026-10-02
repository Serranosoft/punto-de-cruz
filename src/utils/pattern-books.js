import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { patternBooksEndpoint } from './pattern-books-config';
import { validatePatternBooksCatalog } from './pattern-books-catalog';

let memoryCatalog = null;
let pendingRequest = null;
const cacheKey = `pattern-books:v2:${patternBooksEndpoint}`;

async function fetchCatalog() {
    if (!patternBooksEndpoint) throw new Error('Book catalog is not configured');
    if (pendingRequest) return pendingRequest;
    pendingRequest = (async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);
        try {
            const response = await fetch(patternBooksEndpoint, { signal: controller.signal });
            if (!response.ok) throw new Error(`Book catalog HTTP ${response.status}`);
            const books = validatePatternBooksCatalog(await response.json());
            memoryCatalog = books;
            try {
                await AsyncStorage.setItem(cacheKey, JSON.stringify({ books }));
            } catch (error) {
                console.warn('[pattern-books] Could not cache catalog', error);
            }
            return books;
        } finally {
            clearTimeout(timeout);
        }
    })();
    try {
        return await pendingRequest;
    } finally {
        pendingRequest = null;
    }
}

export function usePatternBooks() {
    const [books, setBooks] = useState(memoryCatalog || []);
    const [loading, setLoading] = useState(!memoryCatalog);
    const [error, setError] = useState(false);
    const mounted = useRef(false);
    const refresh = useCallback(async () => {
        if (mounted.current) { setLoading(true); setError(false); }
        try {
            const nextBooks = await fetchCatalog();
            if (mounted.current) setBooks(nextBooks);
        } catch (loadError) {
            console.warn('[pattern-books] Could not load catalog', loadError.message);
            if (mounted.current) setError(true);
        } finally {
            if (mounted.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        mounted.current = true;
        const bootstrap = async () => {
            if (!memoryCatalog) {
                try {
                    const stored = await AsyncStorage.getItem(cacheKey);
                    if (stored) {
                        const cached = validatePatternBooksCatalog(JSON.parse(stored));
                        memoryCatalog = cached;
                        if (mounted.current) setBooks(cached);
                    }
                } catch { /* Invalid or missing cache is replaced by the next request. */ }
            }
            if (mounted.current) await refresh();
        };
        bootstrap();
        return () => { mounted.current = false; };
    }, [refresh]);

    return { books, loading, error, refresh };
}
