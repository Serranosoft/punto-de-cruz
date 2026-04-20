import { Stack } from "expo-router";
import { View, StyleSheet, Platform } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect, useState, useMemo, useRef } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import * as Notifications from 'expo-notifications';
import { LangContext } from "../src/utils/LangContext";
import { I18n } from "i18n-js";
import { translations } from "../src/utils/localizations";
import { getLocales } from "expo-localization";
import { AdsContext } from "../src/utils/AdsContext";
import AdsHandler from "../src/components/AdsHandler";
import * as StoreReview from 'expo-store-review';
import UpdatesModal from "../src/layout/modals/updates-modal";
import { scheduleWeeklyNotification } from "../src/utils/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userPreferences } from "../src/utils/user-preferences";
import Toast from 'react-native-toast-message';
import { AchievementsProvider } from '../src/utils/AchievementsContext';

export default function Layout() {

    // Idioma
    const [langRdy, setLangRdy] = useState(false);
    const locales = getLocales();
    const [language, setLanguage] = useState(locales?.[0]?.languageCode || "es");

    const i18n = useMemo(() => {
        const instance = new I18n(translations);
        instance.enableFallback = true;
        instance.defaultLocale = "es";
        return instance;
    }, []);

    if (language) {
        i18n.locale = language;
    }

    // Gestión de anuncios
    const [adsLoaded, setAdsLoaded] = useState();
    const [adTrigger, setAdTrigger] = useState(0);
    const [showOpenAd, setShowOpenAd] = useState(true);
    const adsHandlerRef = useRef(null);

    useEffect(() => {
        getUserPreferences().catch(e => console.error('getUserPreferences error:', e));
        configureNotifications().catch(e => console.error('configureNotifications error:', e));
    }, [])

    // Al terminar de configurar el idioma se lanza notificación
    useEffect(() => {
        if (langRdy) {
            scheduleWeeklyNotification(i18n);
        }
    }, [language, langRdy])

    // Gestión de anuncios
    useEffect(() => {
        if (adsLoaded) {
            if (adTrigger > 4) {
                adsHandlerRef.current.showIntersitialAd();
                setAdTrigger(0);
            }
        }

        if (adTrigger > 3) {
            askForReview();
        }
    }, [adTrigger])

    async function getUserPreferences() {
        // Language
        const language = await AsyncStorage.getItem(userPreferences.LANGUAGE);
        setLanguage(language || getLocales()?.[0]?.languageCode || "es");
        setLangRdy(true);
    }

    async function configureNotifications() {
        const { granted } = await Notifications.requestPermissionsAsync();
        if (granted) {
            await AsyncStorage.setItem(userPreferences.NOTIFICATION_PERMISSION, "true");
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowBanner: true,
                    shouldShowList: true,
                    shouldPlaySound: false,
                    shouldSetBadge: false,
                }),
            });
        } else {
            await AsyncStorage.setItem(userPreferences.NOTIFICATION_PERMISSION, "false");
        }
    }

    async function askForReview() {
        if (await StoreReview.isAvailableAsync()) {
            await StoreReview.requestReview()
        }
    }

    return (
        <SafeAreaProvider>
            <View style={styles.container}>
                <AdsContext.Provider value={{ setAdTrigger: setAdTrigger, adsLoaded: adsLoaded, setShowOpenAd: setShowOpenAd }}>
                    <LangContext.Provider value={{ setLanguage: setLanguage, language: i18n }}>
                        <AchievementsProvider>
                            <AdsHandler ref={adsHandlerRef} adsLoaded={adsLoaded} setAdsLoaded={setAdsLoaded} showOpenAd={showOpenAd} setShowOpenAd={setShowOpenAd} />
                            <GestureHandlerRootView style={styles.wrapper}>
                                <Stack>
                                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                                </Stack>
                                <StatusBar style="dark" />
                            </GestureHandlerRootView>
                            <UpdatesModal />
                        </AchievementsProvider>
                    </LangContext.Provider>
                </AdsContext.Provider>
                <Toast />
            </View >
        </SafeAreaProvider>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
        justifyContent: "center",
    },
    wrapper: {
        flex: 1,
        width: "100%",
        alignSelf: "center",
        justifyContent: "center",
    },
})