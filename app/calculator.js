import { useState, useMemo, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LangContext } from "../src/utils/LangContext";
import Header from "../src/components/header";
import { Stack, useRouter } from "expo-router";
import Constants from 'expo-constants';
import { AchievementsContext } from '../src/utils/AchievementsContext';

export default function CalculatorScreen() {
    const { language } = useContext(LangContext);
    const { unlockAchievement } = useContext(AchievementsContext);
    const router = useRouter();

    // Fabric Calculator State
    const [stitchesW, setStitchesW] = useState('');
    const [stitchesH, setStitchesH] = useState('');
    const [fabricCount, setFabricCount] = useState(14); // Default Aida 14
    const [marginCm, setMarginCm] = useState('5'); // Default 5cm margin

    const counts = [11, 14, 16, 18, 28, 32];

    const fabricSize = useMemo(() => {
        const w = parseInt(stitchesW) || 0;
        const h = parseInt(stitchesH) || 0;
        const m = parseInt(marginCm) || 0;
        
        if (w > 0 && h > 0) {
            unlockAchievement('matematico');
        }

        if (w === 0 || h === 0) return null;

        const widthCm = ((w / fabricCount) * 2.54);
        const heightCm = ((h / fabricCount) * 2.54);

        const totalWidth = (widthCm + (m * 2)).toFixed(1);
        const totalHeight = (heightCm + (m * 2)).toFixed(1);

        return { w: totalWidth, h: totalHeight, baseW: widthCm.toFixed(1), baseH: heightCm.toFixed(1) };
    }, [stitchesW, stitchesH, fabricCount, marginCm]);

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <Stack.Screen options={{ 
                header: () => <Header title={language.t('_toolsCalcTitle')} />
            }} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconBox, { backgroundColor: '#e8f4fd' }]}>
                            <Ionicons name="expand" size={20} color="#3498db" />
                        </View>
                        <Text style={styles.cardTitle}>{language.t('_calcPatternDimensions')}</Text>
                    </View>
                    <Text style={styles.cardSubtitle}>{language.t('_calcSubtitle')}</Text>
                    
                    <View style={styles.formRow}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{language.t('_calcWidthLabel')}</Text>
                            <TextInput 
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="100"
                                placeholderTextColor="#ccc"
                                value={stitchesW}
                                onChangeText={setStitchesW}
                                maxLength={4}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{language.t('_calcHeightLabel')}</Text>
                            <TextInput 
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="120"
                                placeholderTextColor="#ccc"
                                value={stitchesH}
                                onChangeText={setStitchesH}
                                maxLength={4}
                            />
                        </View>
                    </View>

                    <Text style={styles.inputLabel}>{language.t('_calcFabricCount')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.countScroll} contentContainerStyle={{ gap: 8 }}>
                        {counts.map((c) => (
                            <TouchableOpacity 
                                key={c} 
                                style={[styles.countPill, fabricCount === c && styles.countPillActive]}
                                onPress={() => setFabricCount(c)}
                            >
                                <Text style={[styles.countPillText, fabricCount === c && styles.countPillTextActive]}>{c} ct</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{language.t('_calcMarginLabel')}</Text>
                        <TextInput 
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="5"
                            placeholderTextColor="#ccc"
                            value={marginCm}
                            onChangeText={setMarginCm}
                            maxLength={2}
                        />
                        <Text style={styles.helpText}>{language.t('_calcMarginHelp')}</Text>
                    </View>

                    <View style={[styles.resultBox, !fabricSize && styles.resultBoxEmpty]}>
                        {!fabricSize ? (
                            <Text style={styles.resultEmptyText}>{language.t('_calcResultEmpty')}</Text>
                        ) : (
                            <>
                                <Text style={styles.resultLabel}>{language.t('_calcResultLabel')}</Text>
                                <Text style={styles.resultValue}>{fabricSize.w} cm × {fabricSize.h} cm</Text>
                                <Text style={styles.resultSubValue}>{language.t('_calcResultEmbroidered', { w: fabricSize.baseW, h: fabricSize.baseH })}</Text>
                            </>
                        )}
                    </View>
                </View>
                <View style={{height: 40}} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingTop: 0,
    },
    scrollContent: {
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        fontFamily: 'poppins-bold',
        fontSize: 18,
        color: '#222',
    },
    cardSubtitle: {
        fontFamily: 'poppins-regular',
        fontSize: 13,
        color: '#666',
        marginBottom: 16,
    },
    formRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    inputGroup: {
        flex: 1,
        marginBottom: 16,
    },
    inputLabel: {
        fontFamily: 'poppins-medium',
        fontSize: 13,
        color: '#444',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f5f6f8',
        borderRadius: 12,
        height: 50,
        paddingHorizontal: 16,
        fontFamily: 'poppins-medium',
        fontSize: 16,
        color: '#111',
        borderWidth: 1,
        borderColor: '#e1e3e8',
    },
    helpText: {
        fontFamily: 'poppins-regular',
        fontSize: 11,
        color: '#888',
        marginTop: 6,
    },
    countScroll: {
        marginBottom: 20,
    },
    countPill: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    countPillActive: {
        backgroundColor: '#e8f4fd',
        borderColor: '#3498db',
    },
    countPillText: {
        fontFamily: 'poppins-medium',
        fontSize: 14,
        color: '#555',
    },
    countPillTextActive: {
        color: '#3498db',
    },
    resultBox: {
        backgroundColor: '#2ecc71',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginTop: 12,
    },
    resultBoxEmpty: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 32,
    },
    resultEmptyText: {
        fontFamily: 'poppins-medium',
        fontSize: 13,
        color: '#999',
    },
    resultLabel: {
        fontFamily: 'poppins-medium',
        fontSize: 13,
        color: '#fff',
        opacity: 0.9,
    },
    resultValue: {
        fontFamily: 'poppins-bold',
        fontSize: 24,
        color: '#fff',
    },
    resultSubValue: {
        fontFamily: 'poppins-regular',
        fontSize: 12,
        color: '#fff',
        opacity: 0.8,
    }
});
