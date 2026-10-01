import { TestIds } from "react-native-google-mobile-ads";

const productionBannerId = "ca-app-pub-3738413299329691/5411255060";
const productionInterstitialId = "ca-app-pub-3738413299329691/7356280609";
const productionAppOpenId = "ca-app-pub-3738413299329691/9092034102";
const productionRewardedVipId = "ca-app-pub-3738413299329691/1772975531";
const useTestAds = __DEV__ || process.env.EXPO_PUBLIC_USE_TEST_ADS === "true";

const productionBannerIds = {
    home: "ca-app-pub-3738413299329691/5411255060",
    explore: "ca-app-pub-3738413299329691/8885353804",
    tools: "ca-app-pub-3738413299329691/4098173399",
    pattern: "ca-app-pub-3738413299329691/8253040820",
};

export const getBannerId = (placement = "home") => (
    useTestAds ? TestIds.ADAPTIVE_BANNER : (productionBannerIds[placement] || productionBannerId)
);

export const bannerId = getBannerId();
export const intersitialId = useTestAds ? TestIds.INTERSTITIAL : productionInterstitialId;
export const loadId = useTestAds ? TestIds.APP_OPEN : productionAppOpenId;
export const rewardedVipId = useTestAds ? TestIds.REWARDED : productionRewardedVipId;
