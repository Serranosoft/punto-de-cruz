import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { bookAccessKey, bookAccessStatus, subscribeBookAccess } from './pattern-book-access';

export function usePatternBookAccess(books) {
    const signature = JSON.stringify(books.map(bookAccessKey));
    const keys = useMemo(() => JSON.parse(signature), [signature]);
    const [expiries, setExpiries] = useState({});
    const [now, setNow] = useState(Date.now);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const revision = useRef(0);

    const refresh = useCallback(async () => {
        const request = ++revision.current;
        setNow(Date.now());
        setLoading(true);
        try {
            const stored = keys.length ? await AsyncStorage.multiGet(keys) : [];
            if (request !== revision.current) return;
            setNow(Date.now());
            setExpiries(Object.fromEntries(stored));
            setError(false);
        } catch (err) {
            if (request !== revision.current) return;
            setExpiries({});
            setError(true);
            console.warn('[pattern-books] Could not read access', err);
        } finally {
            if (request === revision.current) setLoading(false);
        }
    }, [keys]);

    useFocusEffect(useCallback(() => {
        refresh();
        return () => { revision.current += 1; };
    }, [refresh]));

    useEffect(() => {
        const unsubscribe = subscribeBookAccess(refresh);
        const subscription = AppState.addEventListener('change', state => {
            if (state === 'active') refresh();
        });
        return () => {
            unsubscribe();
            subscription.remove();
        };
    }, [refresh]);

    const statuses = useMemo(() => Object.fromEntries(keys.map(key => [key, bookAccessStatus(expiries[key], now)])), [keys, expiries, now]);
    useEffect(() => {
        const remaining = Object.values(statuses).filter(status => status.isActive).map(status => status.expiresAt - Date.now());
        if (!remaining.length) return;
        // Recheck long durations daily; lock immediately at the nearest expiry.
        const timer = setTimeout(() => setNow(Date.now()), Math.max(1, Math.min(...remaining, 24 * 60 * 60 * 1000) + 1));
        return () => clearTimeout(timer);
    }, [statuses]);

    return { statuses, loading, error, refresh };
}
