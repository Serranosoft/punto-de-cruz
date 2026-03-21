import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { LangContext } from './LangContext';

export const AchievementsContext = createContext({});

export const ACHIEVEMENTS_DATA = {
    primera_puntada: { id: 'primera_puntada', title: '_achTitle_primera_puntada', desc: '_achDesc_primera_puntada', icon: 'check-square' },
    coleccionista: { id: 'coleccionista', title: '_achTitle_coleccionista', desc: '_achDesc_coleccionista', icon: 'box' },
    noctambulo: { id: 'noctambulo', title: '_achTitle_noctambulo', desc: '_achDesc_noctambulo', icon: 'moon' },
    constancia: { id: 'constancia', title: '_achTitle_constancia', desc: '_achDesc_constancia', icon: 'calendar' },
    matematico: { id: 'matematico', title: '_achTitle_matematico', desc: '_achDesc_matematico', icon: 'scissors' },
    comprador: { id: 'comprador', title: '_achTitle_comprador', desc: '_achDesc_comprador', icon: 'shopping-cart' },
    hacedor: { id: 'hacedor', title: '_achTitle_hacedor', desc: '_achDesc_hacedor', icon: 'image' },
    perfeccionista: { id: 'perfeccionista', title: '_achTitle_perfeccionista', desc: '_achDesc_perfeccionista', icon: 'upload' },
    circo: { id: 'circo', title: '_achTitle_circo', desc: '_achDesc_circo', icon: 'star' },
    maestro: { id: 'maestro', title: '_achTitle_maestro', desc: '_achDesc_maestro', icon: 'award' }
};

export const AchievementsProvider = ({ children }) => {
    const [unlockedAchievements, setUnlockedAchievements] = useState([]);

    useEffect(() => {
        loadAchievements();
    }, []);

    const loadAchievements = async () => {
        try {
            const data = await AsyncStorage.getItem('stash_achievements');
            if (data) {
                setUnlockedAchievements(JSON.parse(data));
            }
        } catch (e) {
            console.error("Error loading achievements", e);
        }
    };

    const { language } = React.useContext(LangContext);

    const unlockAchievement = useCallback(async (id) => {
        try {
            const data = await AsyncStorage.getItem('stash_achievements');
            let current = data ? JSON.parse(data) : [];

            if (!current.includes(id)) {
                const newUnlocked = [...current, id];
                await AsyncStorage.setItem('stash_achievements', JSON.stringify(newUnlocked));
                setUnlockedAchievements(newUnlocked);

                const achData = ACHIEVEMENTS_DATA[id];
                if(achData && language) {
                    Toast.show({
                        type: 'success',
                        text1: language.t('_achUnlockedToast'),
                        text2: language.t(achData.title),
                        visibilityTime: 4000,
                        position: 'top',
                        topOffset: 60
                    });
                }
                
                // Maestro checker
                if (newUnlocked.length >= 3 && !newUnlocked.includes('maestro') && id !== 'maestro') {
                    setTimeout(() => unlockAchievement('maestro'), 4500); 
                }
            }
        } catch (e) {
            console.error("Error unlocking achievement", e);
        }
    }, [language]);

    return (
        <AchievementsContext.Provider value={{ unlockedAchievements, unlockAchievement }}>
            {children}
        </AchievementsContext.Provider>
    );
};
