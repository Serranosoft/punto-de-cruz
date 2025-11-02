import { Stack } from "expo-router";
import { View, StatusBar, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createRef, useEffect, useState } from "react";
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

export default function Layout() {

    // Idioma
    const [langRdy, setLangRdy] = useState(false);
    const [language, setLanguage] = useState(getLocales()[0].languageCode);
    const i18n = new I18n(translations);
    if (language) i18n.locale = language;
    i18n.enableFallback = true
    i18n.defaultLocale = "es";

    // Gestión de anuncios
    const [adsLoaded, setAdsLoaded] = useState();
    const [adTrigger, setAdTrigger] = useState(0);
    const [showOpenAd, setShowOpenAd] = useState(true);
    const adsHandlerRef = createRef();

    // Configurar notificaciones y cargar preferencias de usuario
    useEffect(() => {
        getUserPreferences();
        configureNotifications();
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
        setLanguage(language || getLocales()[0].languageCode);
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
        if (await StoreReview.hasAction()) {
            StoreReview.requestReview()
        }
    }

    return (
        <View style={styles.container}>
            <AdsContext.Provider value={{ setAdTrigger: setAdTrigger, adsLoaded: adsLoaded, setShowOpenAd: setShowOpenAd }}>
                <LangContext.Provider value={{ setLanguage: setLanguage, language: i18n }}>
                    <AdsHandler ref={adsHandlerRef} adsLoaded={adsLoaded} setAdsLoaded={setAdsLoaded} showOpenAd={showOpenAd} setShowOpenAd={setShowOpenAd} />
                    <GestureHandlerRootView style={styles.wrapper}>
                        <Stack />
                        <StatusBar backgroundColor={"#fff"} style="light" />
                    </GestureHandlerRootView>
                    <UpdatesModal />
                </LangContext.Provider>
            </AdsContext.Provider>
        </View >
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