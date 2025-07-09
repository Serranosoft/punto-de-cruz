import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import MobileAds, { AdsConsent, useInterstitialAd } from "react-native-google-mobile-ads";
import { intersitialId, loadId } from "../utils/constants";
import { AdEventType, AppOpenAd } from "react-native-google-mobile-ads";
import { AppState } from "react-native";

const AdsHandler = forwardRef((props, ref) => {

    const {
        isLoaded: isLoadedIntersitial,
        isClosed: isClosedIntersitial,
        load: loadIntersitial,
        show: showIntersitial } = useInterstitialAd(intersitialId);


    /* CONSENT */
    const isMobileAdsStartCalledRef = useRef(false);
    useEffect(() => {
        const prepare = async () => {
            console.log("oki?");
            const consentInfo = await AdsConsent.requestInfoUpdate();
            console.log(consentInfo);
            AdsConsent.loadAndShowConsentFormIfRequired()
                .then(startGoogleMobileAdsSDK)
                .catch((error) => console.error('Consent gathering failed:', error));
            startGoogleMobileAdsSDK();
        }

        prepare();
    }, []);

    async function startGoogleMobileAdsSDK() {
        const { canRequestAds } = await AdsConsent.getConsentInfo();
        if (!canRequestAds || isMobileAdsStartCalledRef.current) {
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
        AppState.addEventListener("change", nextAppState => {
            setAppStateChanged(nextAppState);
        })
    }

    return <></>
})

export default AdsHandler