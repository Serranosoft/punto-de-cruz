import { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LangContext } from '../../src/utils/LangContext';
import LangList from '../../src/components/lang-list';
import { useRouter } from 'expo-router';
import { AchievementsContext, ACHIEVEMENTS_DATA } from '../../src/utils/AchievementsContext';


export default function Profile() {
    const { language } = useContext(LangContext);
    const { unlockedAchievements } = useContext(AchievementsContext);
    const router = useRouter();
    
    // User Stats
    const unlockedCount = unlockedAchievements.length;
    // Maestro gives 5 levels, otherwise 1 per achievement
    const level = Math.max(1, unlockedCount + (unlockedAchievements.includes('maestro') ? 4 : 0));
    
    const titles = [
        language.t('_userTitle1'),
        language.t('_userTitle2'),
        language.t('_userTitle3'),
        language.t('_userTitle4'),
        language.t('_userTitle5'),
        language.t('_userTitle6')
    ];
    const title = titles[Math.min(level - 1, titles.length - 1)];
    
    const currentXP = unlockedCount * 100;
    const nextLevelXP = (level) * 100;
    const progress = Math.min((currentXP / nextLevelXP) * 100, 100);

    const achievementsList = Object.values(ACHIEVEMENTS_DATA);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{language.t('_profileTitle')}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* Hero Section */}
                <View style={styles.profileHero}>
                    <Text style={styles.userTitle}>{title}</Text>
                    <View style={styles.xpContainer}>
                        <View style={styles.xpBarBg}>
                            <View style={[styles.xpBarFill, { width: `${progress}%` }]} />
                        </View>
                        <View style={styles.xpTextRow}>
                            <Text style={styles.xpText}>{language.t('_labelLevel')} {level}</Text>
                            <Text style={styles.xpTextDetail}>{currentXP} / {nextLevelXP} XP</Text>
                            <Text style={styles.xpText}>{language.t('_labelLevel')} {level + 1}</Text>
                        </View>
                    </View>
                </View>

                {/* Logros (Achievements) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{language.t('_achievementsTitle')}</Text>
                    <Text style={styles.sectionSubtitle}>{language.t('_achievementsSubtitle', { count: unlockedCount, total: achievementsList.length })}</Text>
                    
                    <View style={styles.achievementsGrid}>
                        {achievementsList.map((ach) => {
                            const isUnlocked = unlockedAchievements.includes(ach.id);
                            return (
                                <View key={ach.id} style={[styles.achBox, !isUnlocked && styles.achBoxLocked]} 
                                      accessible={true} 
                                      accessibilityLabel={`${language.t(ach.title)}. ${isUnlocked ? language.t('_labelUnlocked') : language.t('_labelLocked')}. ${language.t(ach.desc)}`}>
                                    <View style={[styles.achIconWrapper, !isUnlocked && styles.achIconLocked]}>
                                        <Feather name={ach.icon} size={24} color={isUnlocked ? "#d35400" : "#999"} />
                                    </View>
                                    <Text style={styles.achTitle} numberOfLines={2}>{language.t(ach.title)}</Text>
                                </View>
                            )
                        })}
                    </View>
                </View>


                {/* Ajustes de Sistema */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{language.t('_settingsApp')}</Text>
                    
                    <View style={styles.settingsCard}>
                        <View style={styles.settingRow}>
                            <Feather name="globe" size={20} color="#555" />
                            <Text style={styles.settingLabel}>{language.t("_settingsLang") || "Idioma de la interfaz"}</Text>
                        </View>
                        <View style={styles.langListWrapper}>
                            <LangList />
                        </View>
                    </View>

                    <View style={styles.settingsCard}>
                        <TouchableOpacity 
                            style={styles.settingActionRow}
                            onPress={() => Linking.openURL('https://mollydigital.manu-scholz.com/politica-de-privacidad-disena-tu-mirada/')}
                        >
                            <Feather name="shield" size={20} color="#555" />
                            <Text style={styles.settingLabel}>{language.t('_settingsPrivacy')}</Text>
                            <Feather name="chevron-right" size={20} color="#ccc" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{height: 40}} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    },
    scrollContent: {
        paddingBottom: 40,
    },
    profileHero: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f1f1',
        marginBottom: 24,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#fae5d3',
    },
    levelBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#d35400',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    levelText: {
        fontFamily: 'poppins-bold',
        color: '#fff',
        fontSize: 14,
    },
    userName: {
        fontFamily: 'poppins-bold',
        fontSize: 22,
        color: '#111',
        marginBottom: 4,
    },
    userTitle: {
        fontFamily: 'poppins-medium',
        fontSize: 14,
        color: '#d35400',
        marginBottom: 20,
    },
    xpContainer: {
        width: '80%',
    },
    xpBarBg: {
        height: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 8,
    },
    xpBarFill: {
        height: '100%',
        backgroundColor: '#2ecc71',
        borderRadius: 6,
    },
    xpTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    xpText: {
        fontFamily: 'poppins-bold',
        fontSize: 12,
        color: '#777',
    },
    xpTextDetail: {
        fontFamily: 'poppins-regular',
        fontSize: 11,
        color: '#999',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    sectionTitle: {
        fontFamily: 'poppins-bold',
        fontSize: 18,
        color: '#222',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontFamily: 'poppins-regular',
        fontSize: 13,
        color: '#777',
        marginBottom: 16,
    },
    achievementsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    achBox: {
        width: '31%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    achBoxLocked: {
        backgroundColor: '#f5f6f8',
        shadowOpacity: 0,
        elevation: 0,
        borderWidth: 1,
        borderColor: '#eee',
    },
    achIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fae5d3',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    achIconLocked: {
        backgroundColor: '#e1e3e8',
    },
    achTitle: {
        fontFamily: 'poppins-medium',
        fontSize: 10,
        color: '#333',
        textAlign: 'center',
        lineHeight: 14,
    },
    settingsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
    },
    settingActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
    },
    settingLabel: {
        flex: 1,
        fontFamily: 'poppins-medium',
        fontSize: 15,
        color: '#333',
    },
    langListWrapper: {
        paddingHorizontal: 12,
        paddingBottom: 12,
    },
    separator: {
        height: 1,
        backgroundColor: '#f1f1f1',
        marginHorizontal: 12,
    }
});
