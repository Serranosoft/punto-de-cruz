import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { AdsContext } from '../../src/utils/AdsContext';
import { LangContext } from '../../src/utils/LangContext';
import { useContext } from 'react';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { bannerId } from '../../src/utils/constants';

export default function ToolsHub() {
    const router = useRouter();
    const { language } = useContext(LangContext);
    const { adsLoaded } = useContext(AdsContext);

    const tools = [
        {
            id: 'calc',
            title: language.t('_toolsCalcTitle'),
            description: language.t('_toolsCalcDescription'),
            icon: 'calculator',
            color: '#3498db',
            bg: '#e8f4fd',
            route: '/calculator'
        },
        {
            id: 'conv',
            title: language.t('_toolsConvTitle'),
            description: language.t('_toolsConvDescription'),
            icon: 'image',
            color: '#d35400',
            bg: '#fcf3e8',
            route: '/converter'
        },
        {
            id: 'stash',
            title: language.t('_toolsStashTitle'),
            description: language.t('_toolsStashDescription'),
            icon: 'archive',
            color: '#2ecc71',
            bg: '#eafaf1',
            route: '/stash'
        },
        {
            id: 'guide',
            title: language.t('_toolsGuideTitle'),
            description: language.t('_toolsGuideDescription'),
            icon: 'book',
            color: '#9b59b6',
            bg: '#f5eef8',
            route: null // Próximamente
        }
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{language.t('_toolsTitle')}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.introText}>{language.t('_toolsIntro')}</Text>

                <View style={styles.grid}>
                    {tools.map((tool) => (
                        <TouchableOpacity
                            key={tool.id}
                            style={styles.toolCard}
                            activeOpacity={0.7}
                            onPress={() => tool.route ? router.push(tool.route) : null}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: tool.bg }]}>
                                <Ionicons name={tool.icon} size={28} color={tool.color} />
                            </View>
                            <Text style={styles.toolTitle}>{tool.title}</Text>
                            <Text style={styles.toolDescription}>{tool.description}</Text>

                            {tool.route ? (
                                <View style={styles.arrowContainer}>
                                    <Ionicons name="chevron-forward" size={18} color="#ccc" />
                                </View>
                            ) : (
                                <View style={styles.soonBadge}>
                                    <Text style={styles.soonText}>{language.t('_labelSoon')}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
            {adsLoaded && <BannerAd unitId={bannerId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{}} />}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa'
    },
    header: {
        paddingTop: Constants.statusBarHeight + 2,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f1f1',
    },
    headerTitle: {
        fontFamily: 'poppins-bold',
        fontSize: 22,
        color: '#111',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    introText: {
        fontFamily: 'poppins-regular',
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
    },
    toolCard: {
        width: '47.5%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        paddingBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        position: 'relative',
    },
    iconContainer: {
        width: 54,
        height: 54,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    toolTitle: {
        fontFamily: 'poppins-bold',
        fontSize: 15,
        color: '#222',
        marginBottom: 8,
    },
    toolDescription: {
        fontFamily: 'poppins-regular',
        fontSize: 11,
        color: '#777',
        lineHeight: 16,
    },
    arrowContainer: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    soonBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    soonText: {
        fontFamily: 'poppins-bold',
        fontSize: 8,
        color: '#999',
    }
});
