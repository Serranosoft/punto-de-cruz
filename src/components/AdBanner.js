import { useCallback, useContext, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useFocusEffect } from "expo-router";
import {
    BannerAd,
    BannerAdSize,
    useForeground,
} from "react-native-google-mobile-ads";
import { AdsContext } from "../utils/AdsContext";
import { getBannerId } from "../utils/constants";

export default function AdBanner({ placement, embedded = false }) {
    const { adRequestOptions, adsLoaded } = useContext(AdsContext);
    const [isFocused, setIsFocused] = useState(false);
    const isFocusedRef = useRef(false);
    const bannerRef = useRef(null);

    useFocusEffect(
        useCallback(() => {
            isFocusedRef.current = true;
            setIsFocused(true);
            return () => {
                isFocusedRef.current = false;
                setIsFocused(false);
            };
        }, [])
    );

    useForeground(() => {
        if (Platform.OS === "ios" && isFocusedRef.current) {
            bannerRef.current?.load();
        }
    });

    if (!adsLoaded || !isFocused) {
        return null;
    }

    return (
        <View style={[styles.container, embedded && styles.embedded]} pointerEvents="box-none">
            <BannerAd
                ref={bannerRef}
                unitId={getBannerId(placement)}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={adRequestOptions}
                onAdLoaded={() => console.info(`[ads:banner:${placement}] loaded`)}
                onAdFailedToLoad={(error) => console.warn(`[ads:banner:${placement}] load_failed`, {
                    code: error?.code,
                    message: error?.message,
                })}
                onAdImpression={() => console.info(`[ads:banner:${placement}] impression`)}
                onPaid={(event) => console.info(`[ads:banner:${placement}] revenue`, event)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 52,
        paddingTop: 8,
        paddingBottom: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: "#e0e0e0",
        backgroundColor: "#fff",
    },
    embedded: {
        marginVertical: 10,
    },
});
