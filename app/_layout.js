import { SplashScreen, Stack } from "expo-router";
import { View, StatusBar, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createRef, useEffect, useState } from "react";
import { useFonts } from "expo-font";
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

SplashScreen.preventAutoHideAsync();
export default function Layout() {

    // Carga de fuentes.
    const [fontsLoaded] = useFonts({
        "poppins-regular": require("../assets/fonts/Poppins-Regular.ttf"),
        "poppins-medium": require("../assets/fonts/Poppins-Medium.ttf"),
        "poppins-bold": require("../assets/fonts/Poppins-Bold.ttf")
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    useEffect(() => {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowBanner: true,
                shouldShowList: true,
                shouldPlaySound: false,
                shouldSetBadge: false,
            }),
        });
    }, [])
    
    useEffect(() => {
        if (i18n) {
            scheduleWeeklyNotification(i18n);
        }
    }, [i18n])

    // Idioma
    const [language, setLanguage] = useState(getLocales()[0].languageCode || "es");
    const i18n = new I18n(translations);
    i18n.locale = language;
    i18n.enableFallback = true
    i18n.defaultLocale = "es";

    // Gestión de anuncios
    const [adsLoaded, setAdsLoaded] = useState(false);
    const [adTrigger, setAdTrigger] = useState(0);
    const [showOpenAd, setShowOpenAd] = useState(true);
    const adsHandlerRef = createRef();

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

    async function askForReview() {
        if (await StoreReview.hasAction()) {
            StoreReview.requestReview()
        }
    }

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            <AdsContext.Provider value={{ setAdTrigger: setAdTrigger, adsLoaded: adsLoaded, setShowOpenAd: setShowOpenAd }}>
                <LangContext.Provider value={{ setLanguage: setLanguage, language: i18n }}>
                    <AdsHandler ref={adsHandlerRef} adsLoaded={adsLoaded} setAdsLoaded={setAdsLoaded} showOpenAd={showOpenAd} setShowOpenAd={setShowOpenAd} />
                    <GestureHandlerRootView style={styles.wrapper}>
                        <Stack />
                        <StatusBar style="light" />
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