import { TestIds } from "react-native-google-mobile-ads";

const productionBannerId = "ca-app-pub-3738413299329691/5344360784";
const productionInterstitialId = "ca-app-pub-3738413299329691/7356280609";
const productionAppOpenId = "ca-app-pub-3738413299329691/9092034102";
const useTestAds = __DEV__ || process.env.EXPO_PUBLIC_USE_TEST_ADS === "true";

const productionBannerIds = {
    home: process.env.EXPO_PUBLIC_ADMOB_BANNER_HOME_ID || productionBannerId,
    explore: process.env.EXPO_PUBLIC_ADMOB_BANNER_EXPLORE_ID || productionBannerId,
    tools: process.env.EXPO_PUBLIC_ADMOB_BANNER_TOOLS_ID || productionBannerId,
    pattern: process.env.EXPO_PUBLIC_ADMOB_BANNER_PATTERN_ID || productionBannerId,
};

export const getBannerId = (placement = "home") => (
    useTestAds ? TestIds.ADAPTIVE_BANNER : (productionBannerIds[placement] || productionBannerId)
);

export const bannerId = getBannerId();
export const intersitialId = useTestAds ? TestIds.INTERSTITIAL : productionInterstitialId;
export const loadId = useTestAds ? TestIds.APP_OPEN : productionAppOpenId;
