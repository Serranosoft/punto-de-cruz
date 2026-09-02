import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MobileAds, {
    AdEventType,
    AdsConsent,
    AdsConsentPrivacyOptionsRequirementStatus,
    AppOpenAd,
    useInterstitialAd,
} from "react-native-google-mobile-ads";
import { AppState, Platform } from "react-native";
import {
    getTrackingPermissionsAsync,
    PermissionStatus,
    requestTrackingPermissionsAsync,
} from "expo-tracking-transparency";
import { intersitialId, loadId } from "../utils/constants";
import { userPreferences } from "../utils/user-preferences";

const APP_OPEN_MAX_AGE_MS = 4 * 60 * 60 * 1000;
const APP_OPEN_MIN_BACKGROUND_MS = 30 * 1000;
const FULL_SCREEN_MIN_INTERVAL_MS = 2 * 60 * 1000;
const APP_OPEN_MIN_LAUNCHES = 3;
const RETRY_DELAY_MS = 30 * 1000;

const AdsHandler = forwardRef((props, ref) => {
    const {
        isLoaded: isInterstitialLoaded,
        isOpened: isInterstitialOpened,
        isClosed: isInterstitialClosed,
        error: interstitialError,
        revenue: interstitialRevenue,
        load: loadInterstitial,
        show: showInterstitial,
    } = useInterstitialAd(
        props.adRequestOptions ? intersitialId : null,
        props.adRequestOptions ?? {}
    );

    const isMobileAdsStartedRef = useRef(false);
    const adsReadyRef = useRef(false);
    const adRequestOptionsRef = useRef(null);
    const loadInterstitialRef = useRef(loadInterstitial);
    const interstitialRetryRef = useRef(null);
    const lastFullScreenAtRef = useRef(0);
    const appOpenEligibleRef = useRef(false);

    const appOpenAdRef = useRef(null);
    const appOpenLoadedRef = useRef(false);
    const appOpenLoadTimeRef = useRef(0);
    const appOpenRetryRef = useRef(null);
    const appOpenSubscriptionsRef = useRef([]);
    const suppressNextAppOpenRef = useRef(false);

    const appStateRef = useRef(AppState.currentState);
    const backgroundStartedAtRef = useRef(0);

    useEffect(() => {
        loadInterstitialRef.current = loadInterstitial;
    }, [loadInterstitial]);

    useEffect(() => {
        let cancelled = false;

        const prepare = async () => {
            try {
                await hydrateAdPreferences();
                let consentInfo = await AdsConsent.requestInfoUpdate();
                updatePrivacyOptionsState(consentInfo);
                await AdsConsent.loadAndShowConsentFormIfRequired();
                consentInfo = await AdsConsent.getConsentInfo();
                updatePrivacyOptionsState(consentInfo);

                if (Platform.OS === "ios") {
                    await requestTrackingIfNeeded();
                }

                if (!cancelled) {
                    await startGoogleMobileAdsSDK();
                }
            } catch (error) {
                console.error("[ads] consent or initialization flow failed", error);
                try {
                    const consentInfo = await AdsConsent.getConsentInfo();
                    updatePrivacyOptionsState(consentInfo);
                } catch (consentInfoError) {
                    console.warn("[ads] could not recover cached consent info", consentInfoError);
                }

                if (!cancelled) {
                    await startGoogleMobileAdsSDK().catch((sdkError) => {
                        console.error("[ads] fallback SDK initialization failed", sdkError);
                    });
                }
            }
        };

        prepare();

        return () => {
            cancelled = true;
            clearTimeout(interstitialRetryRef.current);
            disposeAppOpenAd();
        };
    }, []);

    async function hydrateAdPreferences() {
        const entries = await AsyncStorage.multiGet([
            userPreferences.AD_LAST_FULL_SCREEN_AT,
            userPreferences.AD_APP_LAUNCH_COUNT,
        ]);
        const values = Object.fromEntries(entries);
        const previousLaunchCount = Number(values[userPreferences.AD_APP_LAUNCH_COUNT]) || 0;
        const currentLaunchCount = previousLaunchCount + 1;

        lastFullScreenAtRef.current = Number(values[userPreferences.AD_LAST_FULL_SCREEN_AT]) || 0;
        appOpenEligibleRef.current = currentLaunchCount >= APP_OPEN_MIN_LAUNCHES;

        await AsyncStorage.setItem(
            userPreferences.AD_APP_LAUNCH_COUNT,
            currentLaunchCount.toString()
        );
    }

    function updatePrivacyOptionsState(consentInfo) {
        const isRequired = consentInfo?.privacyOptionsRequirementStatus ===
            AdsConsentPrivacyOptionsRequirementStatus.REQUIRED;
        props.setPrivacyOptionsRequired(isRequired);
    }

    async function syncAdRequestOptionsWithConsent() {
        let requestNonPersonalizedAdsOnly = true;

        try {
            const gdprApplies = await AdsConsent.getGdprApplies();

            if (!gdprApplies) {
                requestNonPersonalizedAdsOnly = false;
            } else {
                const { selectPersonalisedAds } = await AdsConsent.getUserChoices();
                requestNonPersonalizedAdsOnly = !selectPersonalisedAds;
            }
        } catch (error) {
            console.warn("[ads] could not read consent choices; using non-personalized ads", error);
        }

        const previousOptions = adRequestOptionsRef.current;
        const optionsChanged = previousOptions?.requestNonPersonalizedAdsOnly !==
            requestNonPersonalizedAdsOnly;
        const nextOptions = { requestNonPersonalizedAdsOnly };

        adRequestOptionsRef.current = nextOptions;
        props.setAdRequestOptions((currentOptions) => {
            if (
                currentOptions?.requestNonPersonalizedAdsOnly ===
                requestNonPersonalizedAdsOnly
            ) {
                return currentOptions;
            }
            return nextOptions;
        });

        return optionsChanged;
    }

    async function requestTrackingIfNeeded() {
        try {
            const { status } = await getTrackingPermissionsAsync();
            if (status === PermissionStatus.UNDETERMINED) {
                await requestTrackingPermissionsAsync();
            }
        } catch (error) {
            console.warn("[ads] ATT request failed", error);
        }
    }

    async function startGoogleMobileAdsSDK() {
        const { canRequestAds } = await AdsConsent.getConsentInfo();
        if (!canRequestAds) {
            adsReadyRef.current = false;
            props.setAdsLoaded(false);
            return;
        }

        const requestOptionsChanged = await syncAdRequestOptionsWithConsent();

        if (!isMobileAdsStartedRef.current) {
            await MobileAds().initialize();
            isMobileAdsStartedRef.current = true;
            adsReadyRef.current = true;
            createAppOpenAd();
        } else if (requestOptionsChanged) {
            adsReadyRef.current = true;
            replaceAppOpenAd();
        } else {
            adsReadyRef.current = true;
            if (appOpenAdRef.current) {
                loadAppOpenAd();
            } else {
                createAppOpenAd();
            }
        }

        props.setAdsLoaded(true);
    }

    useEffect(() => {
        if (!props.adRequestOptions || !adsReadyRef.current) {
            return;
        }

        loadInterstitialRef.current();
    }, [props.adRequestOptions, loadInterstitial]);

    useEffect(() => {
        if (!isInterstitialClosed || !adsReadyRef.current) {
            return;
        }

        clearTimeout(interstitialRetryRef.current);
        loadInterstitialRef.current();
    }, [isInterstitialClosed, loadInterstitial]);

    useEffect(() => {
        if (!interstitialError || !adsReadyRef.current) {
            return;
        }

        console.warn("[ads:interstitial] load or show failed", interstitialError);
        clearTimeout(interstitialRetryRef.current);
        interstitialRetryRef.current = setTimeout(() => {
            if (adsReadyRef.current) {
                loadInterstitialRef.current();
            }
        }, RETRY_DELAY_MS);
    }, [interstitialError, loadInterstitial]);

    useEffect(() => {
        if (isInterstitialOpened) {
            console.info("[ads:interstitial] impression");
        }
    }, [isInterstitialOpened]);

    useEffect(() => {
        if (interstitialRevenue) {
            console.info("[ads:interstitial] revenue", interstitialRevenue);
        }
    }, [interstitialRevenue]);

    function canShowFullScreenAd() {
        return Date.now() - lastFullScreenAtRef.current >= FULL_SCREEN_MIN_INTERVAL_MS;
    }

    function recordFullScreenShown(format) {
        const shownAt = Date.now();
        lastFullScreenAtRef.current = shownAt;
        AsyncStorage.setItem(
            userPreferences.AD_LAST_FULL_SCREEN_AT,
            shownAt.toString()
        ).catch((error) => console.warn("[ads] could not persist frequency cap", error));
        console.info(`[ads:${format}] display requested`);
    }

    function showInterstitialAd() {
        if (!adsReadyRef.current || !canShowFullScreenAd()) {
            return false;
        }

        if (!isInterstitialLoaded) {
            loadInterstitialRef.current();
            return false;
        }

        recordFullScreenShown("interstitial");
        showInterstitial();
        return true;
    }

    function createAppOpenAd() {
        if (appOpenAdRef.current) {
            return;
        }

        const appOpenAd = AppOpenAd.createForAdRequest(
            loadId,
            adRequestOptionsRef.current ?? { requestNonPersonalizedAdsOnly: true }
        );
        appOpenAdRef.current = appOpenAd;

        appOpenSubscriptionsRef.current = [
            appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
                appOpenLoadedRef.current = true;
                appOpenLoadTimeRef.current = Date.now();
            }),
            appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
                appOpenLoadedRef.current = false;
                appOpenLoadTimeRef.current = 0;
                loadAppOpenAd();
            }),
            appOpenAd.addAdEventListener(AdEventType.OPENED, () => {
                console.info("[ads:app-open] impression");
            }),
            appOpenAd.addAdEventListener(AdEventType.ERROR, (error) => {
                appOpenLoadedRef.current = false;
                appOpenLoadTimeRef.current = 0;
                console.warn("[ads:app-open] load or show failed", error);
                scheduleAppOpenRetry();
            }),
            appOpenAd.addAdEventListener(AdEventType.PAID, (event) => {
                console.info("[ads:app-open] revenue", event);
            }),
        ];

        loadAppOpenAd();
    }

    function disposeAppOpenAd() {
        clearTimeout(appOpenRetryRef.current);
        appOpenSubscriptionsRef.current.forEach((unsubscribe) => unsubscribe());
        appOpenSubscriptionsRef.current = [];
        appOpenAdRef.current = null;
        appOpenLoadedRef.current = false;
        appOpenLoadTimeRef.current = 0;
    }

    function replaceAppOpenAd() {
        disposeAppOpenAd();
        if (adsReadyRef.current) {
            createAppOpenAd();
        }
    }

    function loadAppOpenAd() {
        if (!adsReadyRef.current || !appOpenAdRef.current) {
            return;
        }

        clearTimeout(appOpenRetryRef.current);
        appOpenAdRef.current.load();
    }

    function scheduleAppOpenRetry() {
        clearTimeout(appOpenRetryRef.current);
        appOpenRetryRef.current = setTimeout(() => {
            loadAppOpenAd();
        }, RETRY_DELAY_MS);
    }

    function isAppOpenAdValid() {
        return appOpenLoadedRef.current &&
            Date.now() - appOpenLoadTimeRef.current < APP_OPEN_MAX_AGE_MS;
    }

    function handleAppForegrounded() {
        const backgroundDuration = Date.now() - backgroundStartedAtRef.current;
        if (suppressNextAppOpenRef.current) {
            suppressNextAppOpenRef.current = false;
            return;
        }

        if (
            !adsReadyRef.current ||
            !appOpenEligibleRef.current ||
            backgroundDuration < APP_OPEN_MIN_BACKGROUND_MS ||
            !canShowFullScreenAd()
        ) {
            return;
        }

        if (!isAppOpenAdValid()) {
            const isExpired = appOpenLoadedRef.current &&
                Date.now() - appOpenLoadTimeRef.current >= APP_OPEN_MAX_AGE_MS;
            if (isExpired) {
                replaceAppOpenAd();
            } else {
                loadAppOpenAd();
            }
            return;
        }

        recordFullScreenShown("app-open");
        appOpenLoadedRef.current = false;
        appOpenAdRef.current.show().catch((error) => {
            console.warn("[ads:app-open] could not be shown", error);
            scheduleAppOpenRetry();
        });
    }

    useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextAppState) => {
            const previousAppState = appStateRef.current;

            if (nextAppState === "background") {
                backgroundStartedAtRef.current = Date.now();
            }

            if (previousAppState === "background" && nextAppState === "active") {
                handleAppForegrounded();
            }

            appStateRef.current = nextAppState;
        });

        return () => subscription.remove();
    }, []);

    async function showPrivacyOptionsForm() {
        const consentInfo = await AdsConsent.showPrivacyOptionsForm();
        updatePrivacyOptionsState(consentInfo);

        if (consentInfo.canRequestAds) {
            await startGoogleMobileAdsSDK();
        } else {
            adsReadyRef.current = false;
            props.setAdsLoaded(false);
            disposeAppOpenAd();
        }

        return consentInfo;
    }

    useImperativeHandle(ref, () => ({
        loadIntersitialAd() {
            if (adsReadyRef.current) {
                loadInterstitialRef.current();
            }
        },
        showIntersitialAd() {
            return showInterstitialAd();
        },
        isClosedIntersitial() {
            return isInterstitialClosed;
        },
        isLoadedIntersitial() {
            return isInterstitialLoaded;
        },
        setShowOpenAd(shouldShow) {
            suppressNextAppOpenRef.current = !shouldShow;
        },
        showPrivacyOptionsForm,
    }));

    return null;
});

export default AdsHandler;
