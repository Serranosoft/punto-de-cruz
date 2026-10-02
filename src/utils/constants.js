import { Platform } from "react-native";
import { TestIds } from "react-native-google-mobile-ads";

const useTestAds = __DEV__ || process.env.EXPO_PUBLIC_USE_TEST_ADS === "true";

const productionAdIdsByPlatform = {
    android: {
        banners: {
            home: "ca-app-pub-3738413299329691/5411255060",
            explore: "ca-app-pub-3738413299329691/8885353804",
            tools: "ca-app-pub-3738413299329691/4098173399",
            pattern: "ca-app-pub-3738413299329691/8253040820",
        },
        interstitial: "ca-app-pub-3738413299329691/7356280609",
        appOpen: "ca-app-pub-3738413299329691/9092034102",
        rewardedBook: "ca-app-pub-3738413299329691/1772975531",
    },
    ios: {
        banners: {
            home: "ca-app-pub-3738413299329691/6812870608",
            explore: "ca-app-pub-3738413299329691/7175746962",
            tools: "ca-app-pub-3738413299329691/5332357261",
            pattern: "ca-app-pub-3738413299329691/3915244525",
        },
        interstitial: "ca-app-pub-3738413299329691/3057547714",
        appOpen: "ca-app-pub-3738413299329691/9431384378",
        rewardedBook: "ca-app-pub-3738413299329691/8920248484",
    },
};

const productionAdIds = Platform.OS === "ios"
    ? productionAdIdsByPlatform.ios
    : productionAdIdsByPlatform.android;

export const getBannerId = (placement = "home") => (
    useTestAds ? TestIds.ADAPTIVE_BANNER : (productionAdIds.banners[placement] || productionAdIds.banners.home)
);

export const bannerId = getBannerId();
export const intersitialId = useTestAds ? TestIds.INTERSTITIAL : productionAdIds.interstitial;
export const loadId = useTestAds ? TestIds.APP_OPEN : productionAdIds.appOpen;
export const rewardedBookId = useTestAds ? TestIds.REWARDED : productionAdIds.rewardedBook;
