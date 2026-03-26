import { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useContext } from 'react';
import { LangContext } from '../../src/utils/LangContext';
import { AchievementsContext } from '../../src/utils/AchievementsContext';
import { DMC_COLORS } from '../../src/utils/dmc';

// Muestra reducida de colores DMC para el inventario
// DMC_COLORS is now imported from src/utils/dmc.js

export default function Stash() {
    const router = useRouter();
    const { language } = useContext(LangContext);
    const { unlockAchievement } = useContext(AchievementsContext);
    const [activeTab, setActiveTab] = useState('Hilos'); // Hilos, Compra, Patrones
    const [searchQuery, setSearchQuery] = useState('');
    
    // States for Persistence
    const [inventory, setInventory] = useState({}); // { '310': 2, '666': 0 }
    const [shoppingList, setShoppingList] = useState({}); // { '666': true }

    const loadData = async () => {
        try {
            const storedInventory = await AsyncStorage.getItem('stash_inventory');
            const storedShopping = await AsyncStorage.getItem('stash_shopping');
            
            if (storedInventory) {
                const parsed = JSON.parse(storedInventory);
                setInventory(parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {});
            }
            if (storedShopping) {
                const parsed = JSON.parse(storedShopping);
                setShoppingList(parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {});
            }
        } catch (e) {
            console.error("Error cargando inventario", e);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const updateInventory = async (code, increment) => {
        const newQty = Math.max(0, (inventory[code] || 0) + increment);
        const newInventory = { ...inventory, [code]: newQty };
        setInventory(newInventory);
        await AsyncStorage.setItem('stash_inventory', JSON.stringify(newInventory));
        
        // Logro Coleccionista
        if (Object.keys(newInventory).filter(k => newInventory[k] > 0).length >= 20) {
            unlockAchievement('coleccionista');
        }
    };

    const toggleShoppingList = async (code) => {
        const newShopping = { ...shoppingList };
        if (newShopping[code]) {
            delete newShopping[code];
        } else {
            newShopping[code] = true;
        }
        setShoppingList(newShopping);
        await AsyncStorage.setItem('stash_shopping', JSON.stringify(newShopping));
    };

    // Filter Logic
    const filteredThreads = useMemo(() => {
        let list = DMC_COLORS;
        if (searchQuery) {
            list = list.filter(item => 
                item.code.includes(searchQuery) || 
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (activeTab === 'Compra') {
            list = list.filter(item => shoppingList[item.code]);
        }
        return list;
    }, [searchQuery, activeTab, shoppingList]);

    const renderThreadItem = ({ item }) => {
        const qty = inventory[item.code] || 0;
        const isShopping = shoppingList[item.code] || false;

        return (
            <View style={styles.threadCard}>
                <View style={styles.threadInfo}>
                    <View style={[styles.colorSwatch, { backgroundColor: item.hex, borderWidth: item.hex === '#FFFFFF' ? 1 : 0, borderColor: '#ddd' }]} />
                    <View>
                        <Text style={styles.threadCode}>{language.t('_stashDmcCode', { code: item.code })}</Text>
                        <Text style={styles.threadName}>{item.name}</Text>
                    </View>
                </View>

                <View style={styles.threadControls}>
                    <TouchableOpacity 
                        style={[styles.shoppingBtn, isShopping && styles.shoppingBtnActive]}
                        onPress={() => toggleShoppingList(item.code)}
                    >
                        <Feather name="shopping-cart" size={16} color={isShopping ? "#fff" : "#888"} />
                    </TouchableOpacity>
                    
                    <View style={styles.stepper}>
                        <TouchableOpacity style={styles.stepBtn} onPress={() => updateInventory(item.code, -1)}>
                            <Feather name="minus" size={16} color="#d35400" />
                        </TouchableOpacity>
                        <Text style={styles.stepVal}>{qty}</Text>
                        <TouchableOpacity style={styles.stepBtn} onPress={() => updateInventory(item.code, 1)}>
                            <Feather name="plus" size={16} color="#d35400" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{language.t('_stashTitle')}</Text>
                
                {/* Custom Tabs */}
                <View style={styles.tabContainer}>
                    {[
                        { id: 'Hilos', label: language.t('_stashTabThreads') },
                        { id: 'Compra', label: language.t('_stashTabShopping') }
                    ].map(tab => (
                        <TouchableOpacity 
                            key={tab.id} 
                            style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
                            onPress={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                        >
                            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Search Bar (Only for Hilos/Compra) */}
                {activeTab !== 'Patrones' && (
                    <View style={styles.searchBar}>
                        <Feather name="search" size={18} color="#888" style={styles.searchIcon} />
                        <TextInput 
                            style={styles.searchInput}
                            placeholder={language.t('_stashSearchPlaceholder')}
                            placeholderTextColor="#aaa"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                )}
            </View>

            {/* List Content */}
            <FlatList
                data={filteredThreads}
                keyExtractor={(item) => item.code}
                renderItem={renderThreadItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Feather name={activeTab === 'Compra' ? "shopping-bag" : "box"} size={48} color="#ddd" />
                        <Text style={styles.emptyText}>
                            {activeTab === 'Compra' ? language.t('_stashEmptyShopping') : language.t('_stashEmptyThreads')}
                        </Text>
                    </View>
                }
            />
        </KeyboardAvoidingView>
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
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabBtnActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontFamily: 'poppins-medium',
        fontSize: 13,
        color: '#666',
    },
    tabTextActive: {
        color: '#111',
        fontFamily: 'poppins-bold',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f6f8',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        borderWidth: 1,
        borderColor: '#e1e3e8',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'poppins-regular',
        fontSize: 14,
        color: '#333',
        height: '100%',
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
        gap: 12,
    },
    threadCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    threadInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    colorSwatch: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
    },
    threadCode: {
        fontFamily: 'poppins-bold',
        fontSize: 15,
        color: '#222',
    },
    threadName: {
        fontFamily: 'poppins-regular',
        fontSize: 12,
        color: '#777',
    },
    threadControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    shoppingBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shoppingBtnActive: {
        backgroundColor: '#fae5d3',
    },
    stepper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fae5d3',
        borderRadius: 20,
        paddingHorizontal: 4,
        paddingVertical: 4,
    },
    stepBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepVal: {
        fontFamily: 'poppins-bold',
        fontSize: 14,
        color: '#d35400',
        width: 28,
        textAlign: 'center',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    emptyText: {
        fontFamily: 'poppins-medium',
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginTop: 16,
    }
});
