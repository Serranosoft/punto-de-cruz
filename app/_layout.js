import { Stack } from "expo-router";
import { ActivityIndicator, Image, View, StyleSheet } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LangContext } from "../src/utils/LangContext";
import { I18n } from "i18n-js";
import { translations } from "../src/utils/localizations";
import { resolveLanguage } from "../src/utils/supported-languages";
import { getLocales } from "expo-localization";
import { AdsContext } from "../src/utils/AdsContext";
import AdsHandler from "../src/components/AdsHandler";
import UpdatesModal from "../src/layout/modals/updates-modal";
import { scheduleWeeklyNotification } from "../src/utils/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userPreferences } from "../src/utils/user-preferences";
import Toast from 'react-native-toast-message';
import { AchievementsProvider } from '../src/utils/AchievementsContext';

export default function Layout() {

    // Idioma
    const [langRdy, setLangRdy] = useState(false);
    const [language, setLanguage] = useState(() => resolveLanguage(null, getLocales()));

    const i18n = useMemo(() => {
        const instance = new I18n(translations);
        instance.enableFallback = true;
        instance.defaultLocale = "es";
        instance.locale = language;
        return instance;
    }, [language]);

    // Gestión de anuncios
    const [adsLoaded, setAdsLoaded] = useState(false);
    const [adRequestOptions, setAdRequestOptions] = useState(null);
    const [adTrigger, setAdTrigger] = useState(0);
    const [privacyOptionsRequired, setPrivacyOptionsRequired] = useState(false);
    const [adsBootstrapComplete, setAdsBootstrapComplete] = useState(false);
    const adsHandlerRef = useRef(null);

    useEffect(() => {
        getUserPreferences().catch(e => console.error('getUserPreferences error:', e));
    }, [])

    // Al terminar de configurar el idioma se lanza notificación
    useEffect(() => {
        if (langRdy) {
            scheduleWeeklyNotification(i18n);
        }
    }, [language, langRdy])

    // Gestión de anuncios
    useEffect(() => {
        if (!adsLoaded) {
            return;
        }

        if (adTrigger >= 3) {
            adsHandlerRef.current?.loadIntersitialAd();
        }

        if (adTrigger >= 5) {
            const wasShown = adsHandlerRef.current?.showIntersitialAd();
            if (wasShown) {
                setAdTrigger(0);
            }
        }
    }, [adTrigger, adsLoaded])

    async function getUserPreferences() {
        try {
            const savedLanguage = await AsyncStorage.getItem(userPreferences.LANGUAGE);
            setLanguage(resolveLanguage(savedLanguage, getLocales()));
        } finally {
            setLangRdy(true);
        }
    }

    const showPrivacyOptions = useCallback(async () => {
        return adsHandlerRef.current?.showPrivacyOptionsForm();
    }, []);

    const setShowOpenAd = useCallback((shouldShow) => {
        adsHandlerRef.current?.setShowOpenAd(shouldShow);
    }, []);

    const onRewardedAdOpened = useCallback(() => {
        adsHandlerRef.current?.onRewardedAdOpened();
    }, []);

    const onRewardedAdClosed = useCallback(() => {
        adsHandlerRef.current?.onRewardedAdClosed();
    }, []);

    const completeAdsBootstrap = useCallback(() => {
        setAdsBootstrapComplete(true);
    }, []);

    const adsCanRender = adsLoaded && adsBootstrapComplete;

    const adsContextValue = useMemo(() => ({
        setAdTrigger,
        adsLoaded: adsCanRender,
        adRequestOptions,
        privacyOptionsRequired,
        showPrivacyOptions,
        setShowOpenAd,
        onRewardedAdOpened,
        onRewardedAdClosed,
    }), [adRequestOptions, adsCanRender, onRewardedAdClosed, onRewardedAdOpened, privacyOptionsRequired, setShowOpenAd, showPrivacyOptions]);

    return (
        <SafeAreaProvider>
            <View style={styles.container}>
                <AdsContext.Provider value={adsContextValue}>
                    <LangContext.Provider value={{ setLanguage: setLanguage, language: i18n }}>
                        <AchievementsProvider>
                            <AdsHandler
                                ref={adsHandlerRef}
                                adRequestOptions={adRequestOptions}
                                setAdRequestOptions={setAdRequestOptions}
                                setAdsLoaded={setAdsLoaded}
                                setPrivacyOptionsRequired={setPrivacyOptionsRequired}
                                onColdStartComplete={completeAdsBootstrap}
                            />
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
                {!adsBootstrapComplete && (
                    <View style={styles.adsLoadingOverlay} accessibilityLabel="Cargando aplicación">
                        <Image
                            source={require("../assets/splash-punto-de-cruz.png")}
                            style={styles.adsLoadingImage}
                            resizeMode="contain"
                        />
                        <ActivityIndicator size="large" color="#d35400" />
                    </View>
                )}
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
    adsLoadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000,
        elevation: 1000,
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        backgroundColor: "#F7F0EC",
    },
    adsLoadingImage: {
        width: "72%",
        height: 220,
    },
})
