import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRewardedAd } from "react-native-google-mobile-ads";
import Header from "../src/components/header";
import { AdsContext } from "../src/utils/AdsContext";
import { LangContext } from "../src/utils/LangContext";
import { rewardedVipId } from "../src/utils/constants";
import { formatVipExpiry, getVipAccessStatus, grantVipAccess } from "../src/utils/vip-access";
import { getVipCopy, interpolateVipCopy } from "../src/utils/vip-copy";

function Benefit({ icon, children }) {
    return (
        <View style={styles.benefit}>
            <View style={styles.benefitIcon}>
                <Ionicons name={icon} size={18} color="#6f3c8f" />
            </View>
            <Text style={styles.benefitText}>{children}</Text>
        </View>
    );
}

export default function VipPatterns() {
    const { language } = useContext(LangContext);
    const {
        adRequestOptions,
        adsLoaded,
        setShowOpenAd,
        onRewardedAdOpened,
        onRewardedAdClosed,
    } = useContext(AdsContext);
    const insets = useSafeAreaInsets();
    const vipCopy = useMemo(() => getVipCopy(language.locale), [language.locale]);
    const [vipStatus, setVipStatus] = useState(null);
    const [notice, setNotice] = useState("");
    const [rewardSessionActive, setRewardSessionActive] = useState(false);
    const rewardHandledRef = useRef(false);
    const showAttemptRef = useRef(false);

    const shouldCreateRewardedAd = Boolean(
        rewardedVipId &&
        adsLoaded &&
        vipStatus &&
        (!vipStatus.isActive || rewardSessionActive)
    );

    const {
        isLoaded,
        isOpened,
        isClosed,
        isShowing,
        isEarnedReward,
        error,
        revenue,
        load,
        show,
    } = useRewardedAd(
        shouldCreateRewardedAd ? rewardedVipId : null,
        adRequestOptions ?? {}
    );

    const refreshVipStatus = useCallback(() => {
        getVipAccessStatus()
            .then(setVipStatus)
            .catch((statusError) => {
                console.warn("[vip] access_status_failed", statusError);
                setVipStatus({ isActive: false, expiresAt: 0, remainingMs: 0 });
            });
    }, []);

    useFocusEffect(refreshVipStatus);

    useEffect(() => {
        setShowOpenAd(false);
        return () => {
            setShowOpenAd(true);
            onRewardedAdClosed();
        };
    }, [onRewardedAdClosed, setShowOpenAd]);

    useEffect(() => {
        if (shouldCreateRewardedAd && !isLoaded && !isShowing && !error) {
            console.info("[ads:rewarded-vip] load_requested");
            load();
        }
    }, [error, isLoaded, isShowing, load, shouldCreateRewardedAd]);

    useEffect(() => {
        if (isOpened) {
            console.info("[ads:rewarded-vip] opened");
            onRewardedAdOpened();
        }
    }, [isOpened, onRewardedAdOpened]);

    useEffect(() => {
        if (!isEarnedReward || rewardHandledRef.current) {
            return;
        }

        rewardHandledRef.current = true;
        grantVipAccess()
            .then((nextStatus) => {
                setVipStatus(nextStatus);
                setNotice("");
                Alert.alert(vipCopy.rewardTitle, vipCopy.rewardBody);
                console.info("[ads:rewarded-vip] reward_granted", {
                    expiresAt: nextStatus.expiresAt,
                });
            })
            .catch((rewardError) => {
                rewardHandledRef.current = false;
                console.error("[vip] access_grant_failed", rewardError);
            });
    }, [isEarnedReward, vipCopy.rewardBody, vipCopy.rewardTitle]);

    useEffect(() => {
        if (!isClosed) {
            return;
        }

        onRewardedAdClosed();
        setRewardSessionActive(false);
        if (showAttemptRef.current && !isEarnedReward) {
            setNotice(vipCopy.noReward);
        }
        showAttemptRef.current = false;
    }, [isClosed, isEarnedReward, onRewardedAdClosed, vipCopy.noReward]);

    useEffect(() => {
        if (!error) {
            return;
        }

        console.warn("[ads:rewarded-vip] load_or_show_failed", {
            code: error?.code,
            message: error?.message,
        });
        onRewardedAdClosed();
        setRewardSessionActive(false);
        setNotice(vipCopy.adUnavailableBody);
    }, [error, onRewardedAdClosed, vipCopy.adUnavailableBody]);

    useEffect(() => {
        if (revenue) {
            console.info("[ads:rewarded-vip] revenue", revenue);
        }
    }, [revenue]);

    const handleUnlock = () => {
        if (!rewardedVipId) {
            Alert.alert(vipCopy.missingIdTitle, vipCopy.missingIdBody);
            return;
        }

        if (!adsLoaded || !isLoaded) {
            if (adsLoaded) {
                load();
            }
            Alert.alert(vipCopy.adUnavailableTitle, vipCopy.adUnavailableBody);
            return;
        }

        rewardHandledRef.current = false;
        showAttemptRef.current = true;
        setRewardSessionActive(true);
        setNotice("");
        console.info("[ads:rewarded-vip] show_requested");
        show();
    };

    const expiryDate = formatVipExpiry(vipStatus?.expiresAt, language.locale);

    return (
        <View style={styles.screen}>
            <Stack.Screen options={{ header: () => <Header title={vipCopy.title} /> }} />
            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 20) + 20 }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.hero}>
                    <View style={styles.glowLarge} />
                    <View style={styles.glowSmall} />
                    <View style={styles.crownCircle}>
                        <Ionicons name="diamond" size={30} color="#2b153c" />
                    </View>
                    <Text style={styles.heroBadge}>
                        {vipStatus?.isActive ? vipCopy.activeBadge : vipCopy.lockedEyebrow}
                    </Text>
                    <Text style={styles.heroTitle}>
                        {vipStatus?.isActive ? vipCopy.title : vipCopy.lockedTitle}
                    </Text>
                    <Text style={styles.heroDescription}>
                        {vipStatus?.isActive
                            ? interpolateVipCopy(vipCopy.activeUntil, { date: expiryDate })
                            : vipCopy.lockedDescription}
                    </Text>
                </View>

                {!vipStatus ? (
                    <View style={styles.loadingState}>
                        <ActivityIndicator color="#6f3c8f" size="large" />
                    </View>
                ) : vipStatus.isActive ? (
                    <View style={styles.comingSoonCard}>
                        <View style={styles.comingSoonIcon}>
                            <Ionicons name="color-palette-outline" size={34} color="#6f3c8f" />
                        </View>
                        <Text style={styles.comingSoonTitle}>{vipCopy.comingSoonTitle}</Text>
                        <Text style={styles.comingSoonBody}>{vipCopy.comingSoonBody}</Text>
                        <View style={styles.activePill}>
                            <Ionicons name="checkmark-circle" size={17} color="#277a4b" />
                            <Text style={styles.activePillText}>
                                {interpolateVipCopy(vipCopy.activeUntil, { date: expiryDate })}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.unlockCard}>
                        <Benefit icon="sparkles">{vipCopy.benefitOne}</Benefit>
                        <Benefit icon="calendar-outline">{vipCopy.benefitTwo}</Benefit>
                        <Benefit icon="shield-checkmark-outline">{vipCopy.benefitThree}</Benefit>

                        <TouchableOpacity
                            style={[styles.unlockButton, (!isLoaded || isShowing) && styles.unlockButtonLoading]}
                            onPress={handleUnlock}
                            disabled={isShowing}
                            accessibilityRole="button"
                        >
                            {isShowing ? (
                                <ActivityIndicator color="#2b153c" />
                            ) : (
                                <Ionicons name="play-circle" size={22} color="#2b153c" />
                            )}
                            <Text style={styles.unlockButtonText}>
                                {isShowing ? vipCopy.loadingAd : vipCopy.unlockButton}
                            </Text>
                        </TouchableOpacity>
                        {!!notice && <Text style={styles.notice}>{notice}</Text>}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#f8f5fa",
    },
    content: {
        padding: 20,
        gap: 18,
    },
    hero: {
        overflow: "hidden",
        minHeight: 300,
        borderRadius: 28,
        padding: 26,
        justifyContent: "flex-end",
        backgroundColor: "#2b153c",
        shadowColor: "#2b153c",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.22,
        shadowRadius: 18,
        elevation: 7,
    },
    glowLarge: {
        position: "absolute",
        width: 230,
        height: 230,
        borderRadius: 115,
        top: -100,
        right: -60,
        backgroundColor: "rgba(247, 200, 94, 0.18)",
    },
    glowSmall: {
        position: "absolute",
        width: 130,
        height: 130,
        borderRadius: 65,
        top: 45,
        right: 55,
        backgroundColor: "rgba(181, 126, 220, 0.18)",
    },
    crownCircle: {
        width: 58,
        height: 58,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 28,
        backgroundColor: "#f7c85e",
        transform: [{ rotate: "-5deg" }],
    },
    heroBadge: {
        alignSelf: "flex-start",
        color: "#f7c85e",
        fontFamily: "poppins-bold",
        fontSize: 11,
        letterSpacing: 1.2,
        marginBottom: 8,
    },
    heroTitle: {
        color: "#fff",
        fontFamily: "poppins-bold",
        fontSize: 29,
        lineHeight: 36,
        marginBottom: 9,
    },
    heroDescription: {
        maxWidth: 310,
        color: "#e8dced",
        fontFamily: "poppins-regular",
        fontSize: 14,
        lineHeight: 21,
    },
    loadingState: {
        paddingVertical: 60,
        alignItems: "center",
    },
    unlockCard: {
        borderRadius: 24,
        padding: 20,
        gap: 15,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#eadff0",
    },
    benefit: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    benefitIcon: {
        width: 38,
        height: 38,
        borderRadius: 13,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f2eaf6",
    },
    benefitText: {
        flex: 1,
        color: "#3c3042",
        fontFamily: "poppins-medium",
        fontSize: 13,
        lineHeight: 19,
    },
    unlockButton: {
        minHeight: 58,
        borderRadius: 18,
        marginTop: 8,
        paddingHorizontal: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        backgroundColor: "#f7c85e",
    },
    unlockButtonLoading: {
        backgroundColor: "#f2d991",
    },
    unlockButtonText: {
        flexShrink: 1,
        color: "#2b153c",
        textAlign: "center",
        fontFamily: "poppins-bold",
        fontSize: 14,
    },
    notice: {
        color: "#8a5c3d",
        textAlign: "center",
        fontFamily: "poppins-regular",
        fontSize: 12,
        lineHeight: 18,
    },
    comingSoonCard: {
        minHeight: 270,
        borderRadius: 24,
        padding: 26,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#eadff0",
    },
    comingSoonIcon: {
        width: 72,
        height: 72,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        backgroundColor: "#f2eaf6",
    },
    comingSoonTitle: {
        color: "#2b153c",
        textAlign: "center",
        fontFamily: "poppins-bold",
        fontSize: 20,
        lineHeight: 27,
        marginBottom: 9,
    },
    comingSoonBody: {
        color: "#75687c",
        textAlign: "center",
        fontFamily: "poppins-regular",
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 20,
    },
    activePill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        paddingHorizontal: 13,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#e8f6ee",
    },
    activePillText: {
        flexShrink: 1,
        color: "#277a4b",
        fontFamily: "poppins-medium",
        fontSize: 11,
    },
});
