import { useState, useMemo, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { LangContext } from '../../src/utils/LangContext';
import { content } from '../../src/utils/data';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import React from 'react';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { bannerId } from '../../src/utils/constants';
import { AdsContext } from '../../src/utils/AdsContext';

const PatternCard = React.memo(({ item, onPress }) => {
    // Determine difficulty badge roughly by steps
    const { language } = useContext(LangContext);
    let difficulty = language.t('_difficultyEasy');
    let badgeColor = "#2ecc71";
    if (item.steps > 5 && item.steps <= 8) {
        difficulty = language.t('_difficultyMedium');
        badgeColor = "#f39c12";
    } else if (item.steps > 8) {
        difficulty = language.t('_difficultyHard');
        badgeColor = "#e74c3c";
    }

    return (
        <TouchableOpacity style={styles.cardContainer} onPress={() => onPress(item)} activeOpacity={0.8}>
            <Image
                source={item.image}
                style={styles.cardImage}
                contentFit="cover"
                transition={200}
            />
            <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                <View style={styles.badgeRow}>
                    <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                        <Text style={styles.badgeText}>{difficulty}</Text>
                    </View>
                    <Text style={styles.stepsText}>{item.steps} {language.t('_labelSteps')}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
});

const ALL_CATEGORY = 'all_patterns';

export default function Explore() {
    const { language } = useContext(LangContext);
    const { adsLoaded } = useContext(AdsContext);

    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);

    const allCategories = useMemo(() => content(language), [language, language.locale]);

    // Flatten all patterns
    const allPatterns = useMemo(() => {
        let patterns = [];
        allCategories.forEach(cat => {
            cat.subcategories.forEach(sub => {
                patterns.push({
                    ...sub,
                    parentCategory: cat.name,
                    parentCategoryFetch: cat.fetch
                });
            });
        });
        return patterns;
    }, [allCategories]);

    // categories for pills
    const pillCategories = useMemo(() => [
        { id: ALL_CATEGORY, name: language.t("_labelAll"), isNew: false },
        ...allCategories.map(c => ({ id: c.fetch, name: c.name, isNew: c.isNew }))
    ], [allCategories, language, language.locale]);

    // Filter logic
    const filteredPatterns = useMemo(() => {
        let result = allPatterns;

        if (activeCategory !== ALL_CATEGORY) {
            result = result.filter(p => p.parentCategoryFetch === activeCategory);
        }

        if (searchQuery.trim().length > 0) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                p.parentCategory.toLowerCase().includes(lowerQuery)
            );
        }

        return result;
    }, [allPatterns, activeCategory, searchQuery]);

    const handlePressItem = useCallback((item) => {
        router.push({
            pathname: "/item",
            params: {
                category: item.parentCategory,
                subcategory: item.name,
                categoryFetch: item.parentCategoryFetch,
                subcategoryFetch: item.fetch,
                steps: item.steps
            }
        });
    }, [router]);

    const renderItem = useCallback(({ item }) => (
        <PatternCard item={item} onPress={handlePressItem} />
    ), [handlePressItem]);

    const listEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <Feather name="search" size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>{language.t('_exploreEmptyTitle')}</Text>
            <Text style={styles.emptySubtitle}>{language.t('_exploreEmptySubtitle')}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{language.t('_exploreTitle')}</Text>
                <View style={styles.searchBar}>
                    <Feather name="search" size={20} color="#888" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={language.t('_exploreSearchPlaceholder')}
                        placeholderTextColor="#aaa"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearButtonMode="while-editing"
                        accessibilityLabel={language.t('_accessibilitySearch')}
                    />
                    {searchQuery.length > 0 && Platform.OS === 'android' && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Feather name="x-circle" size={20} color="#888" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.pillsContainer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={pillCategories}
                    keyExtractor={(item) => item.id}
                    extraData={activeCategory + language.locale}
                    contentContainerStyle={styles.pillsScroll}
                    renderItem={({ item }) => {
                        const isActive = activeCategory === item.id;
                        return (
                            <TouchableOpacity
                                style={[styles.pill, isActive && styles.pillActive]}
                                onPress={() => setActiveCategory(item.id)}
                                accessibilityState={{ selected: isActive }}
                            >
                                <View style={styles.pillContent}>
                                    <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{item.name}</Text>
                                    {item.isNew && (
                                        <View style={styles.newBadgeContainer}>
                                            <Text style={styles.newBadgeText}>{language.t("_labelNew")}</Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            <FlatList
                data={filteredPatterns}
                keyExtractor={(item) => `${item.categoryFetch}-${item.fetch}`}
                renderItem={renderItem}
                numColumns={2}
                contentContainerStyle={styles.gridContent}
                columnWrapperStyle={styles.rowWrapper}
                ListEmptyComponent={listEmptyComponent}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
            />
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
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f1f1',
        zIndex: 10,
    },
    headerTitle: {
        fontFamily: 'poppins-bold',
        fontSize: 24,
        color: '#111',
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'poppins-regular',
        fontSize: 15,
        color: '#333',
        height: '100%',
    },
    pillsContainer: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f1f1',
    },
    pillsScroll: {
        paddingHorizontal: 20,
        gap: 8,
    },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 8,
    },
    pillActive: {
        backgroundColor: '#d35400',
    },
    pillText: {
        fontFamily: 'poppins-medium',
        fontSize: 14,
        color: '#555',
    },
    pillTextActive: {
        color: '#fff',
    },
    pillContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    newBadgeContainer: {
        backgroundColor: '#e74c3c',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        marginLeft: 6,
    },
    newBadgeText: {
        color: '#fff',
        fontSize: 8,
        fontFamily: 'poppins-bold',
        textTransform: 'uppercase',
    },
    gridContent: {
        padding: 16,
        paddingBottom: 40,
    },
    rowWrapper: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    cardContainer: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardImage: {
        width: '100%',
        height: 140,
        backgroundColor: '#e1e1e1',
    },
    cardInfo: {
        padding: 12,
    },
    cardTitle: {
        fontFamily: 'poppins-bold',
        fontSize: 14,
        color: '#222',
        marginBottom: 6,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontFamily: 'poppins-bold',
        fontSize: 10,
        color: '#fff',
    },
    stepsText: {
        fontFamily: 'poppins-regular',
        fontSize: 12,
        color: '#777',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyTitle: {
        fontFamily: 'poppins-bold',
        fontSize: 18,
        color: '#333',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontFamily: 'poppins-regular',
        fontSize: 14,
        color: '#777',
        textAlign: 'center',
        marginTop: 8,
    }
});
