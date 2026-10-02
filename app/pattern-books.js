import React, { useCallback, useContext } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LangContext } from '../src/utils/LangContext';
import { usePatternBooks } from '../src/utils/pattern-books';
import { formatBookCopy, getPatternBooksCopy } from '../src/utils/pattern-books-copy';
import { bookAccessKey, formatBookExpiry } from '../src/utils/pattern-book-access';
import { usePatternBookAccess } from '../src/utils/use-pattern-book-access';

const BookCard = React.memo(function BookCard({ book, copy, onOpen, access, locale }) {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onOpen(book.id)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${book.title}. ${access?.isActive ? copy.open : copy.locked}`}
        >
            <Image source={{ uri: book.coverUrl || book.images[0].url }} style={styles.cover} contentFit="contain" cachePolicy="memory-disk" />
            <View style={styles.info}>
                <Text style={styles.bookTitle}>{book.title}</Text>
                <Text style={styles.pages}>{formatBookCopy(copy.pages, { count: book.pageCount })}</Text>
                <Text style={styles.status}>{access?.isActive ? formatBookCopy(copy.activeUntil, { date: formatBookExpiry(access.expiresAt, locale) }) : copy.locked}</Text>
                <View style={styles.cta}>
                    <Text style={styles.ctaText}>{access?.isActive ? copy.open : copy.unlock}</Text>
                    <Ionicons name={access?.isActive ? 'arrow-forward' : 'lock-closed-outline'} size={18} color="#d35400" />
                </View>
            </View>
        </TouchableOpacity>
    );
});

export default function PatternBooks() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { language } = useContext(LangContext);
    const copy = getPatternBooksCopy(language.locale);
    const { books, loading, error, refresh } = usePatternBooks();
    const { statuses } = usePatternBookAccess(books);
    const openBook = useCallback(id => router.push({ pathname: '/pattern-book', params: { id } }), [router]);
    const renderBook = useCallback(({ item }) => <BookCard book={item} copy={copy} onOpen={openBook} access={statuses[bookAccessKey(item)]} locale={language.locale} />, [copy, openBook, statuses, language.locale]);

    return (
        <View style={styles.screen}>
            <Stack.Screen options={{ title: copy.title, headerBackTitle: '', headerTintColor: '#d35400' }} />
            <FlatList
                data={books}
                extraData={statuses}
                renderItem={renderBook}
                keyExtractor={book => book.id}
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
                initialNumToRender={5}
                windowSize={5}
                refreshing={loading && books.length > 0}
                onRefresh={refresh}
                ListEmptyComponent={(
                    <View style={styles.empty}>
                        {loading ? <ActivityIndicator color="#d35400" /> : null}
                        <Text style={styles.description}>{loading ? copy.loading : error ? copy.loadError : copy.empty}</Text>
                        {!loading && error ? <TouchableOpacity style={styles.cta} onPress={refresh} accessibilityRole="button"><Text style={styles.ctaText}>{copy.retry}</Text></TouchableOpacity> : null}
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#f8f9fa' },
    empty: { paddingVertical: 40, alignItems: 'center', gap: 12 },
    content: { padding: 20, gap: 16 },
    description: { fontFamily: 'poppins-regular', fontSize: 14, lineHeight: 22, color: '#666', marginBottom: 4 },
    card: { flexDirection: 'row', padding: 14, gap: 16, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ece8e4' },
    cover: { width: 100, height: 145, borderRadius: 10, backgroundColor: '#f6f1eb' },
    info: { flex: 1, justifyContent: 'center', gap: 8 },
    bookTitle: { fontFamily: 'poppins-bold', fontSize: 15, color: '#222' },
    pages: { fontFamily: 'poppins-regular', fontSize: 12, color: '#666' },
    status: { fontFamily: 'poppins-medium', fontSize: 11, color: '#666' },
    cta: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8 },
    ctaText: { fontFamily: 'poppins-medium', fontSize: 13, color: '#d35400' },
});
