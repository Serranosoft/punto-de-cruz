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
const COLD_START_MAX_WAIT_MS = 4 * 1000;
const RETRY_INITIAL_DELAY_MS = 30 * 1000;
const RETRY_MAX_DELAY_MS = 5 * 60 * 1000;

function getRetryDelay(attempt) {
    return Math.min(
        RETRY_INITIAL_DELAY_MS * (2 ** Math.max(attempt - 1, 0)),
        RETRY_MAX_DELAY_MS
    );
}

function getErrorDetails(error) {
    return {
        code: error?.code,
        message: error?.message,
    };
}

function logAdEvent(format, event, details) {
    if (details) {
        console.info(`[ads:${format}] ${event}`, details);
        return;
    }
    console.info(`[ads:${format}] ${event}`);
}

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
    const lastFullScreenAtRef = useRef(0);
    const isFullScreenShowingRef = useRef(false);
    const rewardedAdShowingRef = useRef(false);

    const loadInterstitialRef = useRef(loadInterstitial);
    const interstitialLoadedRef = useRef(false);
    const interstitialLoadInFlightRef = useRef(false);
    const interstitialLoadWantedRef = useRef(false);
    const interstitialShowRequestedRef = useRef(false);
    const interstitialOpportunityPendingRef = useRef(false);
    const interstitialRetryRef = useRef(null);
    const interstitialRetryAttemptRef = useRef(0);

    const appOpenEligibleRef = useRef(false);
    const appOpenAllowedRef = useRef(true);
    const appOpenAdRef = useRef(null);
    const appOpenLoadedRef = useRef(false);
    const appOpenLoadInFlightRef = useRef(false);
    const appOpenLoadTimeRef = useRef(0);
    const appOpenShowingRef = useRef(false);
    const appOpenRetryRef = useRef(null);
    const appOpenRetryAttemptRef = useRef(0);
    const appOpenSubscriptionsRef = useRef([]);

    const coldStartPendingRef = useRef(true);
    const coldStartAdShowingRef = useRef(false);
    const coldStartTimeoutRef = useRef(null);

    const appStateRef = useRef(AppState.currentState);
    const backgroundStartedAtRef = useRef(0);

    useEffect(() => {
        loadInterstitialRef.current = loadInterstitial;
        if (
            adsReadyRef.current &&
            interstitialLoadWantedRef.current &&
            !interstitialLoadedRef.current
        ) {
            interstitialLoadInFlightRef.current = false;
            requestInterstitialLoad("ad_instance_ready");
        }
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
                console.error("[ads] consent_or_initialization_failed", getErrorDetails(error));
                try {
                    const consentInfo = await AdsConsent.getConsentInfo();
                    updatePrivacyOptionsState(consentInfo);
                } catch (consentInfoError) {
                    console.warn("[ads] cached_consent_unavailable", getErrorDetails(consentInfoError));
                }

                if (!cancelled) {
                    try {
                        await startGoogleMobileAdsSDK();
                    } catch (sdkError) {
                        console.error("[ads] fallback_initialization_failed", getErrorDetails(sdkError));
                        completeColdStart("sdk_initialization_failed");
                    }
                }
            }
        };

        prepare();

        return () => {
            cancelled = true;
            clearTimeout(interstitialRetryRef.current);
            clearTimeout(coldStartTimeoutRef.current);
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

        if (!appOpenEligibleRef.current) {
            completeColdStart("launch_not_eligible");
        } else {
            scheduleColdStartTimeout();
        }
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
            console.warn("[ads] consent_choices_unavailable", getErrorDetails(error));
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
            console.warn("[ads] att_request_failed", getErrorDetails(error));
        }
    }

    async function startGoogleMobileAdsSDK() {
        const { canRequestAds } = await AdsConsent.getConsentInfo();
        if (!canRequestAds) {
            adsReadyRef.current = false;
            props.setAdsLoaded(false);
            completeColdStart("ads_not_allowed");
            return;
        }

        const requestOptionsChanged = await syncAdRequestOptionsWithConsent();

        if (!isMobileAdsStartedRef.current) {
            await MobileAds().initialize();
            isMobileAdsStartedRef.current = true;
        }

        adsReadyRef.current = true;
        props.setAdsLoaded(true);

        if (!appOpenEligibleRef.current) {
            disposeAppOpenAd();
            completeColdStart("launch_not_eligible");
            return;
        }

        scheduleColdStartTimeout();
        if (requestOptionsChanged) {
            replaceAppOpenAd("consent_changed");
        } else if (!appOpenAdRef.current) {
            createAppOpenAd();
        } else {
            loadAppOpenAd("sdk_ready");
        }
    }

    useEffect(() => {
        interstitialLoadedRef.current = isInterstitialLoaded;
        if (!isInterstitialLoaded) {
            return;
        }

        interstitialLoadInFlightRef.current = false;
        interstitialLoadWantedRef.current = false;
        interstitialRetryAttemptRef.current = 0;
        clearTimeout(interstitialRetryRef.current);
        logAdEvent("interstitial", "loaded");
    }, [isInterstitialLoaded]);

    useEffect(() => {
        if (!isInterstitialClosed) {
            return;
        }

        interstitialLoadedRef.current = false;
        interstitialLoadInFlightRef.current = false;
        interstitialShowRequestedRef.current = false;
        isFullScreenShowingRef.current = false;
        logAdEvent("interstitial", "closed");
    }, [isInterstitialClosed]);

    useEffect(() => {
        if (!interstitialError || !adsReadyRef.current) {
            return;
        }

        interstitialLoadedRef.current = false;
        interstitialLoadInFlightRef.current = false;
        isFullScreenShowingRef.current = false;
        if (interstitialShowRequestedRef.current) {
            interstitialOpportunityPendingRef.current = true;
        }
        interstitialShowRequestedRef.current = false;
        console.warn("[ads:interstitial] load_or_show_failed", getErrorDetails(interstitialError));
        scheduleInterstitialRetry();
    }, [interstitialError]);

    useEffect(() => {
        if (!isInterstitialOpened) {
            return;
        }

        interstitialOpportunityPendingRef.current = false;
        interstitialShowRequestedRef.current = false;
        recordFullScreenShown("interstitial");
        logAdEvent("interstitial", "impression");
    }, [isInterstitialOpened]);

    useEffect(() => {
        if (interstitialRevenue) {
            logAdEvent("interstitial", "revenue", interstitialRevenue);
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
        ).catch((error) => console.warn("[ads] frequency_cap_not_persisted", getErrorDetails(error)));
        logAdEvent(format, "shown", { shownAt });
    }

    function requestInterstitialLoad(reason = "manual") {
        interstitialLoadWantedRef.current = true;
        if (!adsReadyRef.current) {
            logAdEvent("interstitial", "load_blocked", { reason: "sdk_not_ready" });
            return false;
        }
        if (interstitialLoadedRef.current) {
            return true;
        }
        if (interstitialLoadInFlightRef.current || isFullScreenShowingRef.current) {
            return false;
        }

        clearTimeout(interstitialRetryRef.current);
        interstitialLoadInFlightRef.current = true;
        logAdEvent("interstitial", "load_requested", { reason });
        loadInterstitialRef.current();
        return true;
    }

    function scheduleInterstitialRetry() {
        clearTimeout(interstitialRetryRef.current);
        interstitialRetryAttemptRef.current += 1;
        const attempt = interstitialRetryAttemptRef.current;
        const delayMs = getRetryDelay(attempt);
        logAdEvent("interstitial", "retry_scheduled", { attempt, delayMs });
        interstitialRetryRef.current = setTimeout(() => {
            requestInterstitialLoad("retry");
        }, delayMs);
    }

    function showInterstitialAd() {
        interstitialOpportunityPendingRef.current = true;

        if (!adsReadyRef.current) {
            logAdEvent("interstitial", "show_blocked", { reason: "sdk_not_ready" });
            return false;
        }

        if (!interstitialLoadedRef.current) {
            requestInterstitialLoad("show_opportunity");
            logAdEvent("interstitial", "show_blocked", { reason: "not_loaded" });
            return false;
        }

        if (isFullScreenShowingRef.current) {
            logAdEvent("interstitial", "show_blocked", { reason: "full_screen_showing" });
            return false;
        }

        if (!canShowFullScreenAd()) {
            logAdEvent("interstitial", "show_blocked", {
                reason: "frequency_cap",
                retryAfterMs: FULL_SCREEN_MIN_INTERVAL_MS - (Date.now() - lastFullScreenAtRef.current),
            });
            return false;
        }

        try {
            isFullScreenShowingRef.current = true;
            interstitialShowRequestedRef.current = true;
            logAdEvent("interstitial", "show_requested");
            showInterstitial();
            return true;
        } catch (error) {
            isFullScreenShowingRef.current = false;
            interstitialShowRequestedRef.current = false;
            console.warn("[ads:interstitial] show_failed", getErrorDetails(error));
            scheduleInterstitialRetry();
            return false;
        }
    }

    function createAppOpenAd() {
        if (!appOpenEligibleRef.current || appOpenAdRef.current) {
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
                appOpenLoadInFlightRef.current = false;
                appOpenLoadTimeRef.current = Date.now();
                appOpenRetryAttemptRef.current = 0;
                clearTimeout(appOpenRetryRef.current);
                logAdEvent("app-open", "loaded");
                maybeShowColdStartAppOpen();
            }),
            appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
                const wasColdStart = coldStartAdShowingRef.current;
                appOpenLoadedRef.current = false;
                appOpenLoadInFlightRef.current = false;
                appOpenLoadTimeRef.current = 0;
                appOpenShowingRef.current = false;
                coldStartAdShowingRef.current = false;
                isFullScreenShowingRef.current = false;
                logAdEvent("app-open", "closed");
                if (wasColdStart) {
                    completeColdStart("ad_closed");
                }
                loadAppOpenAd("closed");
            }),
            appOpenAd.addAdEventListener(AdEventType.OPENED, () => {
                recordFullScreenShown("app-open");
                logAdEvent("app-open", "impression");
            }),
            appOpenAd.addAdEventListener(AdEventType.ERROR, (error) => {
                const wasColdStart = coldStartAdShowingRef.current || coldStartPendingRef.current;
                appOpenLoadedRef.current = false;
                appOpenLoadInFlightRef.current = false;
                appOpenLoadTimeRef.current = 0;
                appOpenShowingRef.current = false;
                coldStartAdShowingRef.current = false;
                isFullScreenShowingRef.current = false;
                console.warn("[ads:app-open] load_or_show_failed", getErrorDetails(error));
                if (wasColdStart) {
                    completeColdStart("ad_error");
                }
                scheduleAppOpenRetry();
            }),
            appOpenAd.addAdEventListener(AdEventType.PAID, (event) => {
                logAdEvent("app-open", "revenue", event);
            }),
        ];

        loadAppOpenAd("created");
    }

    function disposeAppOpenAd() {
        clearTimeout(appOpenRetryRef.current);
        appOpenSubscriptionsRef.current.forEach((unsubscribe) => unsubscribe());
        appOpenSubscriptionsRef.current = [];
        appOpenAdRef.current = null;
        appOpenLoadedRef.current = false;
        appOpenLoadInFlightRef.current = false;
        appOpenLoadTimeRef.current = 0;
        appOpenShowingRef.current = false;
    }

    function replaceAppOpenAd(reason) {
        disposeAppOpenAd();
        if (adsReadyRef.current && appOpenEligibleRef.current) {
            logAdEvent("app-open", "replaced", { reason });
            createAppOpenAd();
        }
    }

    function loadAppOpenAd(reason = "manual") {
        if (
            !adsReadyRef.current ||
            !appOpenEligibleRef.current ||
            !appOpenAdRef.current ||
            appOpenLoadedRef.current ||
            appOpenLoadInFlightRef.current ||
            appOpenShowingRef.current
        ) {
            return false;
        }

        clearTimeout(appOpenRetryRef.current);
        appOpenLoadInFlightRef.current = true;
        logAdEvent("app-open", "load_requested", { reason });
        appOpenAdRef.current.load();
        return true;
    }

    function scheduleAppOpenRetry() {
        if (!adsReadyRef.current || !appOpenEligibleRef.current) {
            return;
        }

        clearTimeout(appOpenRetryRef.current);
        appOpenRetryAttemptRef.current += 1;
        const attempt = appOpenRetryAttemptRef.current;
        const delayMs = getRetryDelay(attempt);
        logAdEvent("app-open", "retry_scheduled", { attempt, delayMs });
        appOpenRetryRef.current = setTimeout(() => {
            loadAppOpenAd("retry");
        }, delayMs);
    }

    function isAppOpenAdValid() {
        return appOpenLoadedRef.current &&
            Date.now() - appOpenLoadTimeRef.current < APP_OPEN_MAX_AGE_MS;
    }

    function showAppOpenAd(origin) {
        if (!appOpenAllowedRef.current) {
            logAdEvent("app-open", "show_blocked", { origin, reason: "placement_suppressed" });
            if (origin === "cold_start") {
                completeColdStart("placement_suppressed");
            }
            return false;
        }

        if (interstitialOpportunityPendingRef.current) {
            logAdEvent("app-open", "show_blocked", { origin, reason: "interstitial_pending" });
            if (origin === "cold_start") {
                completeColdStart("interstitial_pending");
            }
            return false;
        }

        if (isFullScreenShowingRef.current || !canShowFullScreenAd()) {
            logAdEvent("app-open", "show_blocked", {
                origin,
                reason: isFullScreenShowingRef.current ? "full_screen_showing" : "frequency_cap",
            });
            if (origin === "cold_start") {
                completeColdStart("frequency_cap");
            }
            return false;
        }

        if (!isAppOpenAdValid()) {
            const isExpired = appOpenLoadedRef.current &&
                Date.now() - appOpenLoadTimeRef.current >= APP_OPEN_MAX_AGE_MS;
            if (isExpired) {
                replaceAppOpenAd("expired");
            } else {
                loadAppOpenAd("show_opportunity");
            }
            logAdEvent("app-open", "show_blocked", {
                origin,
                reason: isExpired ? "expired" : "not_loaded",
            });
            return false;
        }

        clearTimeout(coldStartTimeoutRef.current);
        appOpenLoadedRef.current = false;
        appOpenShowingRef.current = true;
        coldStartAdShowingRef.current = origin === "cold_start";
        isFullScreenShowingRef.current = true;
        logAdEvent("app-open", "show_requested", { origin });
        appOpenAdRef.current.show().catch((error) => {
            appOpenShowingRef.current = false;
            coldStartAdShowingRef.current = false;
            isFullScreenShowingRef.current = false;
            console.warn("[ads:app-open] show_failed", getErrorDetails(error));
            if (origin === "cold_start") {
                completeColdStart("show_failed");
            }
            scheduleAppOpenRetry();
        });
        return true;
    }

    function scheduleColdStartTimeout() {
        if (!coldStartPendingRef.current || coldStartTimeoutRef.current) {
            return;
        }

        coldStartTimeoutRef.current = setTimeout(() => {
            completeColdStart("timeout");
        }, COLD_START_MAX_WAIT_MS);
    }

    function maybeShowColdStartAppOpen() {
        if (!coldStartPendingRef.current || !appOpenEligibleRef.current) {
            return;
        }
        showAppOpenAd("cold_start");
    }

    function completeColdStart(reason) {
        if (!coldStartPendingRef.current) {
            return;
        }

        coldStartPendingRef.current = false;
        clearTimeout(coldStartTimeoutRef.current);
        coldStartTimeoutRef.current = null;
        logAdEvent("app-open", "cold_start_complete", { reason });
        props.onColdStartComplete?.();
    }

    function handleAppForegrounded() {
        const backgroundDuration = Date.now() - backgroundStartedAtRef.current;
        if (!appOpenAllowedRef.current) {
            logAdEvent("app-open", "show_blocked", { origin: "foreground", reason: "placement_suppressed" });
            return;
        }

        if (!adsReadyRef.current || !appOpenEligibleRef.current) {
            return;
        }

        if (backgroundDuration < APP_OPEN_MIN_BACKGROUND_MS) {
            logAdEvent("app-open", "show_blocked", { origin: "foreground", reason: "short_background" });
            return;
        }

        showAppOpenAd("foreground");
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
            completeColdStart("ads_not_allowed");
        }

        return consentInfo;
    }

    useImperativeHandle(ref, () => ({
        loadIntersitialAd() {
            return requestInterstitialLoad("preload_threshold");
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
            appOpenAllowedRef.current = shouldShow;
            logAdEvent("app-open", shouldShow ? "placement_enabled" : "placement_suppressed");
        },
        onRewardedAdOpened() {
            if (rewardedAdShowingRef.current) {
                return;
            }
            rewardedAdShowingRef.current = true;
            isFullScreenShowingRef.current = true;
            recordFullScreenShown("rewarded-vip");
            logAdEvent("rewarded-vip", "impression");
        },
        onRewardedAdClosed() {
            if (!rewardedAdShowingRef.current) {
                return;
            }
            rewardedAdShowingRef.current = false;
            isFullScreenShowingRef.current = false;
            logAdEvent("rewarded-vip", "closed");
        },
        showPrivacyOptionsForm,
    }));

    return null;
});

export default AdsHandler;
