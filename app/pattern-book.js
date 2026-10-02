import { fonts } from "../src/utils/fonts";
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LangContext } from '../src/utils/LangContext';
import { AdsContext } from '../src/utils/AdsContext';
import { usePatternBooks } from '../src/utils/pattern-books';
import { formatBookCopy, getPatternBooksCopy } from '../src/utils/pattern-books-copy';
import { bookAccessKey, formatBookExpiry, getBookAccessStatus } from '../src/utils/pattern-book-access';
import { usePatternBookAccess } from '../src/utils/use-pattern-book-access';
import { usePatternBookReward } from '../src/utils/use-pattern-book-reward';
import { downloadBookPdf } from '../src/utils/pattern-book-download';
import PatternBookImageViewer from '../src/components/PatternBookImageViewer';

export default function PatternBook() {
    const { id } = useLocalSearchParams();
    const { language } = useContext(LangContext);
    const { setShowOpenAd } = useContext(AdsContext);
    const copy = getPatternBooksCopy(language.locale);
    const insets = useSafeAreaInsets();
    const { books, loading, error, refresh } = usePatternBooks();
    const book = books.find(item => item.id === id);
    const [busy, setBusy] = useState(false);
    const busyRef = useRef(false);
    const [selectedPage, setSelectedPage] = useState(null);
    const access = usePatternBookAccess(book ? [book] : []);
    const status = book ? access.statuses[bookAccessKey(book)] : null;
    const isUnlocked = Boolean(status?.isActive);
    const { phase, unlock } = usePatternBookReward(book, Boolean(book && !access.loading && !access.error && !isUnlocked));
    const rewardBusy = ['loading', 'showing', 'saving'].includes(phase);
    const notice = ['adError', 'noReward', 'saveError'].includes(phase) ? copy[phase] : '';
    useEffect(() => { setSelectedPage(null); }, [id, isUnlocked]);

    const checkAccess = useCallback(async () => {
        if (book && (await getBookAccessStatus(book)).isActive) return true;
        await access.refresh();
        Alert.alert(copy.locked, copy.expired);
        return false;
    }, [book, access.refresh, copy]);

    const openPage = useCallback(async index => {
        if (!book?.images[index]) return;
        try {
            if (await checkAccess()) setSelectedPage(index);
        } catch {
            Alert.alert(copy.locked, copy.accessError);
        }
    }, [book, checkAccess, copy]);
    const closeViewer = useCallback(() => setSelectedPage(null), []);

    const savePdf = useCallback(async () => {
        if (!book || busyRef.current) return;
        busyRef.current = true;
        setBusy(true);
        setShowOpenAd?.(false);
        try {
            const result = await downloadBookPdf(book, checkAccess);
            if (result && Platform.OS !== 'web') {
                Alert.alert(copy.downloadedTitle, formatBookCopy(Platform.OS === 'ios' ? copy.downloadedIos : copy.downloadedBody, { name: result.name }));
            }
        } catch (error) {
            console.warn('[pattern-books] PDF export failed', error);
            Alert.alert(copy.errorTitle, copy.errorBody);
        } finally {
            busyRef.current = false;
            setBusy(false);
            setShowOpenAd?.(true);
        }
    }, [book, copy, checkAccess, setShowOpenAd]);

    const renderPage = useCallback(({ item, index }) => (
        <TouchableOpacity
            style={styles.page}
            activeOpacity={0.85}
            onPress={() => openPage(index)}
            accessibilityRole="button"
            accessibilityLabel={formatBookCopy(copy.enlargePage, { current: index + 1 })}
            accessibilityHint={copy.zoomHint}
        >
            <View style={styles.pageHeader}>
                <Text style={styles.pageLabel}>{formatBookCopy(copy.page, { current: index + 1, total: book.pageCount })}</Text>
                <Ionicons name="expand-outline" size={18} color="#d35400" />
            </View>
            <Image
                source={{ uri: item.url }}
                style={{ width: '100%', aspectRatio: item.width / item.height, minHeight: 48 }}
                contentFit="contain"
                cachePolicy="memory-disk"
            />
        </TouchableOpacity>
    ), [book, copy, openPage]);

    return (
        <View style={styles.screen}>
            <Stack.Screen options={{ title: book?.title || copy.title, headerBackTitle: '', headerTintColor: '#d35400' }} />
            {book && isUnlocked ? (
                <FlatList
                    data={book.images}
                    keyExtractor={(_, index) => String(index + 1)}
                    renderItem={renderPage}
                    contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
                    initialNumToRender={2}
                    maxToRenderPerBatch={3}
                    windowSize={3}
                    ListHeaderComponent={(
                        <View style={styles.actions}>
                            <Text style={styles.accessLabel}>{formatBookCopy(copy.activeUntil, { date: formatBookExpiry(status.expiresAt, language.locale) })}</Text>
                            <TouchableOpacity style={styles.pdfButton} onPress={savePdf} disabled={busy} accessibilityRole="button" accessibilityState={{ disabled: busy }}>
                                {busy ? <ActivityIndicator color="#fff" /> : <Ionicons name="download-outline" size={22} color="#fff" />}
                                <Text style={styles.pdfText}>{busy ? copy.preparing : copy.pdf}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            ) : book ? (
                <ScrollView contentContainerStyle={[styles.lockedContent, { paddingBottom: insets.bottom + 24 }]}>
                    <View style={styles.lockedCard}>
                        <Image source={{ uri: book.coverUrl || book.images[0].url }} style={styles.cover} contentFit="contain" cachePolicy="memory-disk" accessibilityLabel={book.title} />
                        <Text style={styles.bookTitle}>{book.title}</Text>
                        <Text style={styles.pageLabel}>{formatBookCopy(copy.pages, { count: book.pageCount })}</Text>
                        <Ionicons name="lock-closed-outline" size={28} color="#d35400" />
                        <Text style={styles.description}>{copy.unlockDescription}</Text>
                        {access.loading ? (
                            <View style={styles.loadingRow}><ActivityIndicator color="#d35400" /><Text style={styles.pageLabel}>{copy.checkingAccess}</Text></View>
                        ) : access.error ? (
                            <>
                                <Text style={styles.notice} accessibilityLiveRegion="polite">{copy.accessError}</Text>
                                <TouchableOpacity style={styles.pdfButton} onPress={access.refresh} accessibilityRole="button"><Text style={styles.pdfText}>{copy.retry}</Text></TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <TouchableOpacity style={[styles.pdfButton, rewardBusy && styles.disabled]} onPress={unlock} disabled={rewardBusy} accessibilityRole="button" accessibilityState={{ disabled: rewardBusy, busy: rewardBusy }}>
                                    {rewardBusy ? <ActivityIndicator color="#fff" /> : <Ionicons name="play-circle-outline" size={24} color="#fff" />}
                                    <Text style={styles.pdfText}>{phase === 'loading' ? copy.loadingAd : phase === 'showing' ? copy.showingAd : phase === 'saving' ? copy.savingAccess : phase === 'ready' ? copy.unlock : copy.retry}</Text>
                                </TouchableOpacity>
                                {notice ? <Text style={styles.notice} accessibilityLiveRegion="polite">{notice}</Text> : null}
                            </>
                        )}
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.empty}>
                    {loading ? <ActivityIndicator color="#d35400" /> : null}
                    <Text style={styles.pageLabel}>{loading ? copy.loading : error ? copy.loadError : copy.unavailable}</Text>
                    {!loading && error ? <TouchableOpacity style={styles.sourceButton} onPress={refresh} accessibilityRole="button"><Text style={styles.sourceText}>{copy.retry}</Text></TouchableOpacity> : null}
                </View>
            )}
            {book && isUnlocked && selectedPage !== null ? (
                <PatternBookImageViewer book={book} index={selectedPage} copy={copy} onClose={closeViewer} onChange={openPage} />
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#f8f9fa' },
    content: { padding: 16, gap: 18 },
    actions: { gap: 8, marginBottom: 6 },
    pdfButton: { minHeight: 52, borderRadius: 16, padding: 14, gap: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#d35400' },
    pdfText: { flexShrink: 1, fontFamily: fonts.bold, fontSize: 14, color: '#fff' },
    sourceButton: { minHeight: 48, gap: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    sourceText: { fontFamily: fonts.regular, fontSize: 12, color: '#666' },
    page: { padding: 10, borderRadius: 12, backgroundColor: '#fff', gap: 10 },
    pageHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    pageLabel: { fontFamily: fonts.medium, fontSize: 12, color: '#666' },
    empty: { padding: 24, alignItems: 'center', gap: 12 },
    lockedContent: { padding: 20, flexGrow: 1, justifyContent: 'center' },
    lockedCard: { padding: 22, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', gap: 16 },
    cover: { width: '100%', height: 240, borderRadius: 12, backgroundColor: '#fdf3eb' },
    bookTitle: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 28, color: '#222', textAlign: 'center' },
    description: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: '#666', textAlign: 'center' },
    notice: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 20, color: '#963d00', textAlign: 'center' },
    accessLabel: { fontFamily: fonts.medium, fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 6 },
    loadingRow: { gap: 10, alignItems: 'center' },
    disabled: { opacity: 0.65 },
});
