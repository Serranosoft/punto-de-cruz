import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import MobileAds, { AdsConsent, useInterstitialAd } from "react-native-google-mobile-ads";
import { intersitialId, loadId } from "../utils/constants";
import { AdEventType, AppOpenAd } from "react-native-google-mobile-ads";
import { AppState, Platform } from "react-native";
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

const AdsHandler = forwardRef((props, ref) => {

    const {
        isLoaded: isLoadedIntersitial,
        isClosed: isClosedIntersitial,
        load: loadIntersitial,
        show: showIntersitial } = useInterstitialAd(intersitialId);


    /* CONSENT & INITIALIZATION */
    const isMobileAdsStartCalledRef = useRef(false);
    useEffect(() => {
        const prepare = async () => {
            try {
                // 1. UMP (User Messaging Platform) Consent
                await AdsConsent.requestInfoUpdate();
                await AdsConsent.loadAndShowConsentFormIfRequired();

                // 2. ATT (App Tracking Transparency) - Sólo iOS
                if (Platform.OS === 'ios') {
                    try {
                        await requestTrackingPermissionsAsync();
                    } catch (attError) {
                        console.error('ATT Request failed:', attError);
                    }
                }

                // 3. Initialize SDK
                await startGoogleMobileAdsSDK();
            } catch (e) {
                console.error('Consent/Initialization flow failed:', e);
                // Fallback: intentar inicializar el SDK de todos modos
                startGoogleMobileAdsSDK().catch((e2) => console.error('SDK fallback init error:', e2));
            }
        }

        prepare();
    }, []);

    async function startGoogleMobileAdsSDK() {
        if (isMobileAdsStartCalledRef.current) {
            return;
        }

        const { canRequestAds } = await AdsConsent.getConsentInfo();
        if (!canRequestAds) {
            return;
        }

        isMobileAdsStartCalledRef.current = true;
        await MobileAds().initialize();
        props.setAdsLoaded(true);
        loadIntersitial(); // Cargar intersitial ads
        loadOpenAppAd(); // Cargar open ads
    }

    useImperativeHandle(ref, () => ({
        loadIntersitialAd() {
            loadIntersitial();
        },
        showIntersitialAd() {
            props.setShowOpenAd(false);
            showIntersitialAd();
        },
        isClosedIntersitial() {
            return isClosedIntersitial;
        },
        isLoadedIntersitial() {
            return isLoadedIntersitial;
        },
    }))

    useEffect(() => {
        if (isClosedIntersitial) {
            if (props.closedIntersitialCallback) {
                props.closedIntersitialCallback();
            }
        } else {
            loadIntersitial();
        }

    }, [isClosedIntersitial, props.closedIntersitialCallback])


    function showIntersitialAd() {
        if (isLoadedIntersitial) {
            showIntersitial();
        } else {
            loadIntersitial();
        }
    }


    /** APP OPEN ADS (BACKGROUND -> FOREGROUND -> SHOW ADD) */
    const openAdRef = useRef(null);
    const openAdLoadedRef = useRef(false);
    const [appStateChanged, setAppStateChanged] = useState(AppState.currentState);

    useEffect(() => {
        props.adsLoaded && appStateChanged == "active" && handleOpenAd();
    }, [appStateChanged])

    function handleOpenAd() {
        // Cuando adtrigger es 0 significa que acaba de hacer un posible trigger de un intersitialAd
        if (props.showOpenAd) {
            openAdRef.current && openAdLoadedRef.current && openAdRef.current.show();
        } else {
            props.setShowOpenAd(true);
        }
    }

    function loadOpenAppAd() {
        const appOpenAd = AppOpenAd.createForAdRequest(loadId);
        appOpenAd.load();

        appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
            openAdRef.current = appOpenAd;
            openAdLoadedRef.current = true;
        });
        appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
            openAdRef.current.load();
            openAdLoadedRef.current = false;
        });
        appOpenAd.addAdEventListener(AdEventType.ERROR, () => {
        });
    }

    useEffect(() => {
        const subscription = AppState.addEventListener("change", nextAppState => {
            setAppStateChanged(nextAppState);
        });
        return () => subscription.remove();
    }, []);

    return <></>
})

export default AdsHandler