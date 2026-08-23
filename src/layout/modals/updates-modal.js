import { useContext, useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LangContext } from '../../utils/LangContext';
import { APP, userPreferences } from '../../utils/user-preferences';
import { ui } from '../../utils/styles';
import Button from '../../components/button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function UpdatesModal() {
    const [visible, setVisible] = useState(false);
    const { language } = useContext(LangContext);
    const insets = useSafeAreaInsets();

    const updates = [
        { emoji: '🗂️', text: language.t("_updatesModalCategories") },
        { emoji: '📄', text: language.t("_updatesModalPatternSets") },
        { emoji: '✨', text: language.t("_updatesModalDesigns") },
        { emoji: '⚡', text: language.t("_updatesModalPerformance") },
    ];


    useEffect(() => {
        const checkIfSeen = async () => {
            try {
                const version = await AsyncStorage.getItem(userPreferences.CHANGELOG_VERSION);
                if (version !== APP.currentVersion) {
                    setVisible(true);
                }
            } catch (e) {
                console.error("UpdatesModal checkIfSeen error:", e);
            }
        };
        checkIfSeen();
    }, []);

    const closeModal = async () => {
        setVisible(false);
        try {
            await AsyncStorage.setItem(userPreferences.CHANGELOG_VERSION, APP.currentVersion);
        } catch (e) {
            console.error("UpdatesModal closeModal error:", e);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={closeModal}
        >
            <View style={[
                styles.overlay,
                {
                    paddingTop: Math.max(insets.top, 24),
                    paddingBottom: Math.max(insets.bottom, 24),
                }
            ]}>
                <View style={styles.modal} accessibilityViewIsModal>
                    <View style={styles.heroIcon}>
                        <Text style={styles.heroEmoji}>🎉</Text>
                    </View>
                    <Text style={[ui.h3, styles.title]}>{language.t("_updatesModalNews")}</Text>
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.updates}
                        showsVerticalScrollIndicator={false}
                    >
                        {updates.map((update) => (
                            <View key={update.emoji} style={styles.updateCard}>
                                <View style={styles.updateIcon}>
                                    <Text style={styles.updateEmoji}>{update.emoji}</Text>
                                </View>
                                <Text style={[ui.text, styles.update]}>{update.text}</Text>
                            </View>
                        ))}
                    </ScrollView>
                    <Button text={language.t("_updatesButton")} onClick={closeModal} />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(45, 24, 12, 0.62)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    modal: {
        backgroundColor: '#fffaf6',
        padding: 22,
        borderRadius: 28,
        width: '100%',
        maxWidth: 480,
        maxHeight: '80%',
        gap: 16,
        borderWidth: 1,
        borderColor: '#ffe2cf',
        elevation: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    heroIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#ffe7d6',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: -52,
        borderWidth: 5,
        borderColor: '#fffaf6',
    },
    heroEmoji: {
        fontSize: 36,
    },
    title: {
        color: '#7a2e00',
        textAlign: 'center',
    },
    scrollView: {
        flexShrink: 1,
    },
    updates: {
        gap: 10,
    },
    updateCard: {
        minHeight: 58,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f8e8dd',
    },
    updateIcon: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff1e8',
    },
    updateEmoji: {
        fontSize: 21,
    },
    update: {
        flex: 1,
        color: '#3d2a20',
        fontSize: 15,
        lineHeight: 20,
        textAlign: 'auto',
    },
});
