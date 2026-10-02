import { useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Zoomable } from '@likashefqet/react-native-image-zoom';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatBookCopy } from '../utils/pattern-books-copy';

function ZoomPage({ image, label, copy, zoomRef }) {
    const [viewport, setViewport] = useState({ width: 0, height: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const fit = Math.min(viewport.width / image.width, viewport.height / image.height);
    return (
        <View style={styles.viewport} onLayout={({ nativeEvent }) => setViewport(nativeEvent.layout)}>
            {fit > 0 ? (
                <Zoomable
                    ref={zoomRef}
                    minScale={1}
                    maxScale={8}
                    doubleTapScale={3}
                    isDoubleTapEnabled
                    isPinchEnabled
                    isPanEnabled
                    style={{ flex: 0, width: image.width * fit, height: image.height * fit }}
                >
                    <Image
                        key={attempt}
                        source={{ uri: image.url }}
                        style={styles.image}
                        contentFit="contain"
                        allowDownscaling={false}
                        cachePolicy="memory-disk"
                        accessibilityLabel={label}
                        onLoad={() => { setLoading(false); setError(false); }}
                        onError={() => { setLoading(false); setError(true); }}
                    />
                </Zoomable>
            ) : null}
            {loading ? <View style={styles.overlay} pointerEvents="none"><ActivityIndicator size="large" color="#fff" /></View> : null}
            {error ? (
                <View style={styles.overlay}>
                    <Text style={styles.hint} accessibilityLiveRegion="polite">{copy.imageError}</Text>
                    <TouchableOpacity style={styles.retry} accessibilityRole="button" onPress={() => { setError(false); setLoading(true); setAttempt(value => value + 1); }}>
                        <Text style={styles.buttonText}>{copy.retry}</Text>
                    </TouchableOpacity>
                </View>
            ) : null}
        </View>
    );
}

function IconButton({ icon, label, onPress, disabled = false }) {
    return (
        <TouchableOpacity
            style={[styles.iconButton, disabled && styles.disabled]}
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ disabled }}
        >
            <Ionicons name={icon} size={24} color="#fff" />
        </TouchableOpacity>
    );
}

export default function PatternBookImageViewer({ book, index, copy, onClose, onChange }) {
    const insets = useSafeAreaInsets();
    const zoomRef = useRef(null);
    const image = book?.images[index];
    if (!image) return null;
    const label = formatBookCopy(copy.page, { current: index + 1, total: book.pageCount });
    const zoom = factor => {
        const info = zoomRef.current?.getInfo();
        if (!info) return;
        zoomRef.current.zoom({
            scale: Math.max(1, Math.min(8, info.transformations.scale * factor)),
            x: info.container.center.x,
            y: info.container.center.y,
        });
    };
    return (
        <Modal visible animationType="fade" presentationStyle="fullScreen" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent hardwareAccelerated>
            <GestureHandlerRootView style={styles.screen} accessibilityViewIsModal>
                <StatusBar style="light" />
                <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                    <View style={styles.titleBlock}>
                        <Text style={styles.title} numberOfLines={1}>{book.title}</Text>
                        <Text style={styles.counter}>{label}</Text>
                    </View>
                    <IconButton icon="close" label={copy.closeViewer} onPress={onClose} />
                </View>
                <ZoomPage key={`${book.id}:${index}:${image.url}`} image={image} label={label} copy={copy} zoomRef={zoomRef} />
                <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
                    <Text style={styles.hint}>{copy.zoomHint}</Text>
                    <View style={styles.controls}>
                        <IconButton icon="chevron-back" label={copy.previousPage} disabled={index === 0} onPress={() => onChange(index - 1)} />
                        <IconButton icon="remove" label={copy.zoomOut} onPress={() => zoom(0.5)} />
                        <IconButton icon="scan-outline" label={copy.resetZoom} onPress={() => zoomRef.current?.reset()} />
                        <IconButton icon="add" label={copy.zoomIn} onPress={() => zoom(2)} />
                        <IconButton icon="chevron-forward" label={copy.nextPage} disabled={index === book.images.length - 1} onPress={() => onChange(index + 1)} />
                    </View>
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#111' },
    header: { paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#191919' },
    titleBlock: { flex: 1, gap: 4 },
    title: { fontFamily: 'poppins-medium', fontSize: 14, color: '#fff' },
    counter: { fontFamily: 'poppins-regular', fontSize: 12, color: '#ccc' },
    viewport: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    image: { width: '100%', height: '100%' },
    overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
    footer: { paddingTop: 12, paddingHorizontal: 12, backgroundColor: '#191919', gap: 8 },
    hint: { fontFamily: 'poppins-regular', fontSize: 12, lineHeight: 18, color: '#ccc', textAlign: 'center' },
    controls: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    iconButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: '#303030' },
    disabled: { opacity: 0.3 },
    retry: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 20, borderRadius: 12, backgroundColor: '#d35400' },
    buttonText: { fontFamily: 'poppins-medium', fontSize: 14, color: '#fff' },
});
