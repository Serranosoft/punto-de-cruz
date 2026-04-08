import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Feather, Ionicons } from '@expo/vector-icons';
import { ui } from '../../src/utils/styles';
import Constants from 'expo-constants';
import Svg, { Circle } from 'react-native-svg';
import { useContext, useState, useCallback, useMemo } from 'react';
import { LangContext } from '../../src/utils/LangContext';
import { AdsContext } from '../../src/utils/AdsContext';
import { content } from '../../src/utils/data';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { bannerId } from '../../src/utils/constants';
import { AchievementsContext } from '../../src/utils/AchievementsContext';

export default function Inicio() {
    const { language } = useContext(LangContext);
    const { adsLoaded } = useContext(AdsContext);
    const router = useRouter();

    const [lastProject, setLastProject] = useState(null);
    const { unlockAchievement } = useContext(AchievementsContext);

    useFocusEffect(
        useCallback(() => {
            AsyncStorage.getItem('lastProject').then((data) => {
                if (data) {
                    try {
                        const parsed = JSON.parse(data);
                        const stepsNum = Number(parsed?.steps);
                        const lastStepNum = Number(parsed?.lastStep);
                        const hasRequiredParams = parsed?.categoryFetch && parsed?.subcategoryFetch;

                        if (parsed && !isNaN(stepsNum) && stepsNum > 0 && !isNaN(lastStepNum) && hasRequiredParams) {
                            // Normalize to numbers to avoid any downstream type issues
                            parsed.steps = stepsNum;
                            parsed.lastStep = lastStepNum;
                            setLastProject(parsed);
                        } else {
                            AsyncStorage.removeItem('lastProject').catch(console.error);
                            setLastProject(null);
                        }
                    } catch (e) {
                        AsyncStorage.removeItem('lastProject').catch(console.error);
                        setLastProject(null);
                    }
                }
            }).catch(console.error);

            // Noctámbulo check
            const hour = new Date().getHours();
            if (hour >= 22 || hour < 4) {
                unlockAchievement('noctambulo');
            }

            // Constancia check (7 days)
            const today = new Date().toDateString();
            AsyncStorage.getItem('last_opened_date').then(date => {
                if (date !== today) {
                    AsyncStorage.setItem('last_opened_date', today).catch(console.error);
                    AsyncStorage.getItem('open_streak').then(streak => {
                        // Easy streak: just total days opened. A real consecutive check would parse dates.
                        const newStreak = (parseInt(streak) || 0) + 1;
                        AsyncStorage.setItem('open_streak', newStreak.toString()).catch(console.error);
                        if (newStreak >= 7) {
                            unlockAchievement('constancia');
                        }
                    }).catch(console.error);
                }
            }).catch(console.error);
        }, [])
    );

    // Mapeo dinámico para extraer 3 patrones aleatorios como "Inspiración Diaria"
    const dailyInspiration = useMemo(() => {
        const allCategories = content(language);
        let allPatterns = [];
        allCategories.forEach(cat => {
            cat.subcategories.forEach(sub => {
                allPatterns.push({
                    ...sub,
                    parentCategory: cat.name,
                    categoryFetch: cat.fetch
                });
            });
        });

        // Shuffle and take 10 items
        return allPatterns.sort(() => Math.random() - 0.5).slice(0, 10);
    }, [language, language.locale]);

    // Progreso SVG Matemático
    const radius = 35;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;
    const progress = lastProject && lastProject.steps ? Math.round((lastProject.lastStep / lastProject.steps) * 100) : 0;
    const safeProgress = isNaN(progress) ? 0 : progress;
    const strokeDashoffset = circumference - (safeProgress / 100) * circumference;
    const isProjectActive = lastProject && lastProject.steps && lastProject.lastStep < lastProject.steps;

    const handleContinue = () => {
        if (lastProject) {
            router.push({
                pathname: "/item",
                params: {
                    category: lastProject.category,
                    subcategory: lastProject.subcategory,
                    categoryFetch: lastProject.categoryFetch,
                    subcategoryFetch: lastProject.subcategoryFetch,
                    steps: lastProject.steps,
                    image: lastProject.image
                }
            });
        }
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            {/* Header Simplified */}
            <View style={styles.header}>
                <Text style={styles.title}>{language.t('_headerTitle')}</Text>
                <TouchableOpacity
                    style={styles.bellButton}
                    accessibilityLabel={language.t('_accessibilityBell')}
                    accessibilityRole="button"
                >
                    <Feather name="bell" size={20} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Banner Ad Adaptive Superior */}
            <View style={{ marginBottom: 20, alignItems: 'center' }}>
                {adsLoaded && <BannerAd unitId={bannerId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{}} />}
            </View>

            {/* Mi Bastidor (Último Proyecto o Recomendación) */}
            <View style={styles.section}>
                <TouchableOpacity
                    style={styles.card}
                    accessible={true}
                    accessibilityLabel={isProjectActive ? language?.t?.('_accessibilityActiveProject', { name: lastProject?.subcategory, progress: progress }) : language?.t?.('_homeSuggestion')}
                    onPress={isProjectActive ? handleContinue : () => {
                        if (dailyInspiration && dailyInspiration.length > 0) {
                            router.push({
                                pathname: "/item",
                                params: {
                                    category: dailyInspiration[0].parentCategory,
                                    subcategory: dailyInspiration[0].name,
                                    categoryFetch: dailyInspiration[0].categoryFetch,
                                    subcategoryFetch: dailyInspiration[0].fetch,
                                    steps: dailyInspiration[0].steps,
                                    image: dailyInspiration[0].image
                                }
                            });
                        }
                    }}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.progressContainer}>
                            {isProjectActive ? (
                                <>
                                    <Svg width="80" height="80" viewBox="0 0 100 100">
                                        <Circle cx="50" cy="50" r={radius} stroke="#fae5d3" strokeWidth={strokeWidth} fill="none" />
                                        <Circle
                                            cx="50" cy="50" r={radius}
                                            stroke="#d35400" strokeWidth={strokeWidth}
                                            fill="none" strokeDasharray={circumference}
                                            strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                                            transform="rotate(-90 50 50)"
                                        />
                                    </Svg>
                                    <View style={styles.progressTextContainer}>
                                        <Text style={styles.progressText}>{progress}%</Text>
                                    </View>
                                </>
                            ) : (
                                <View style={styles.suggestionIconWrapper}>
                                    <View style={styles.suggestionIconCircle}>
                                        <Ionicons name="sparkles" size={30} color="#d35400" />
                                    </View>
                                </View>
                            )}
                        </View>
                        <View style={styles.cardInfo}>
                            <Text style={styles.projectTitle}>{isProjectActive ? lastProject?.subcategory : language?.t?.('_homeWhatToStitch')}</Text>
                            <View style={styles.timeInfo}>
                                <Feather name={isProjectActive ? "clock" : "compass"} size={14} color="#555" />
                                <Text style={styles.timeText}>
                                    {isProjectActive ? language?.t?.('_itemStepsRemaining', { count: (lastProject?.steps || 0) - (lastProject?.lastStep || 0) }) : language?.t?.('_itemTapForDetails')}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.continueButton}
                                onPress={isProjectActive ? handleContinue : () => router.push('/explore')}
                                accessibilityRole="button"
                            >
                                <Text style={styles.continueText}>{isProjectActive ? language?.t?.('_itemContinue') : language?.t?.('_homeViewDesigns')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {(isProjectActive ? lastProject?.image : (dailyInspiration && dailyInspiration[0]?.image)) &&
                        <Image source={isProjectActive ? lastProject?.image : dailyInspiration[0]?.image} style={styles.projectImage} contentFit="cover" transition={300} />
                    }
                </TouchableOpacity>
            </View>

            {/* Daily Inspiration / Sugeridas */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitleInHeader}>{language.t('_homeDailyInspiration')}</Text>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={language.t('_homeViewDesigns')} onPress={() => router.navigate('/explore')}>
                    <Text style={styles.viewAllText}>{language.t('_homeExplore')}</Text>
                </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                {dailyInspiration.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.categoryCard, index === 0 && { marginLeft: 20 }]}
                        onPress={() => {
                            router.push({
                                pathname: "/item",
                                params: {
                                    category: item.parentCategory,
                                    subcategory: item.name,
                                    categoryFetch: item.categoryFetch,
                                    subcategoryFetch: item.fetch,
                                    steps: item.steps,
                                    image: item.image
                                }
                            });
                        }}
                    >
                        <Image source={item.image} style={styles.categoryImage} contentFit="cover" transition={200} />
                        <View style={styles.categoryOverlay}>
                            <Text style={styles.categoryTitle}>{item.name}</Text>
                            <Text style={styles.categorySubtitle}>{item.parentCategory}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Scanner Banner Redirecting to Tools */}
            <TouchableOpacity style={styles.banner} accessibilityRole="button" onPress={() => router.navigate('/tools')}>
                <View style={styles.bannerIconContainer}>
                    <Feather name="layers" size={20} color="#fff" />
                </View>
                <View style={styles.bannerTextContainer}>
                    <Text style={styles.bannerTitle}>{language.t('_homeToolsCenter')}</Text>
                    <Text style={styles.bannerSubtitle}>{language.t('_homeToolsSubtitle')}</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#d35400" />
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        paddingTop: 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Constants.statusBarHeight + 2,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f1f1',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    greeting: {
        fontFamily: 'poppins-regular',
        color: '#555',
        fontSize: 14,
    },
    title: {
        fontFamily: 'poppins-bold',
        color: '#111',
        fontSize: 20,
        lineHeight: 24,
    },
    bellButton: {
        width: 44,
        height: 44,
        backgroundColor: '#fff',
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    section: {
        marginTop: 20,
    },
    sectionTitle: {
        fontFamily: 'poppins-bold',
        fontSize: 18,
        color: '#111',
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    sectionTitleInHeader: {
        fontFamily: 'poppins-bold',
        fontSize: 18,
        color: '#111',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    viewAllText: {
        fontFamily: 'poppins-medium',
        color: '#d35400',
        fontSize: 14,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    progressContainer: {
        position: 'relative',
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressTextContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressText: {
        fontFamily: 'poppins-bold',
        fontSize: 18,
        color: '#d35400',
    },
    cardInfo: {
        flex: 1,
        paddingLeft: 16,
    },
    projectTitle: {
        fontFamily: 'poppins-bold',
        fontSize: 16,
        color: '#111',
        marginBottom: 4,
    },
    timeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    timeText: {
        fontFamily: 'poppins-regular',
        fontSize: 12,
        color: '#555',
    },
    continueButton: {
        backgroundColor: '#d35400',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    continueText: {
        fontFamily: 'poppins-medium',
        color: '#fff',
        fontSize: 13,
    },
    projectImage: {
        width: '100%',
        height: 140,
        borderRadius: 12,
    },
    banner: {
        backgroundColor: '#fbf0e9',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 24,
        borderWidth: 1,
        borderColor: '#fae5d3',
    },
    bannerIconContainer: {
        width: 44,
        height: 44,
        backgroundColor: '#d35400',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    bannerTextContainer: {
        flex: 1,
    },
    bannerTitle: {
        fontFamily: 'poppins-bold',
        fontSize: 15,
        color: '#d35400',
    },
    bannerSubtitle: {
        fontFamily: 'poppins-regular',
        fontSize: 13,
        color: '#e67e22',
        marginTop: 2,
    },
    categoriesScroll: {
        paddingBottom: 20,
    },
    categoryCard: {
        width: 150,
        height: 200,
        borderRadius: 16,
        marginRight: 16,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#ddd',
    },
    categoryImage: {
        width: '100%',
        height: '100%',
    },
    categoryOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
        justifyContent: 'flex-end',
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    categoryTitle: {
        fontFamily: 'poppins-bold',
        color: '#fff',
        fontSize: 16,
    },
    categorySubtitle: {
        fontFamily: 'poppins-regular',
        color: '#eee',
        fontSize: 12,
    },
    suggestionIconWrapper: {
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    suggestionIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fdf2e9',
        borderWidth: 1,
        borderColor: '#fae5d3',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
