import { StyleSheet, Text, View, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { ui } from "../src/utils/styles";
import { useContext, useEffect } from "react";
import Bubble from "../src/components/bubble";
import ConverterHome from "../src/layout/home/converter-home";
import DesignsHome from "../src/layout/home/designs-home";
import DesignsListHome from "../src/layout/home/designs-list-home";
import Feedback from "../src/layout/home/feedback";
import { LangContext } from "../src/utils/LangContext";
import Header from "../src/components/header";
import Constants from "expo-constants";
import { bannerId } from "../src/utils/constants";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { AdsContext } from "../src/utils/AdsContext";
export default function Home() {

    const { language } = useContext(LangContext);
    const { adsLoaded, setAdTrigger } = useContext(AdsContext);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ header: () => <Header isHome /> }} />
            <Bubble style={{ position: "absolute", top: -200, left: -100, width: 300, height: 300, opacity: 0.75 }} />
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollInner}>
                <View style={{ paddingHorizontal: 16 }}>
                    <Text style={ui.h1}>{language.t("_homeH1")}</Text>
                    <Text style={ui.muted}>{language.t("_homeSubtitle")}</Text>
                </View>
                { adsLoaded && <BannerAd unitId={bannerId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{}} /> }
                <DesignsHome {...{ setAdTrigger }}/>
                <ConverterHome {...{ setAdTrigger }}/>
                { adsLoaded && <BannerAd unitId={bannerId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{}} /> }
                <DesignsListHome {...{ setAdTrigger }}/>
                <Feedback />
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Constants.statusBarHeight + 80,
        backgroundColor: "#fff"
    },
    scroll: {
        flex: 1,
    },

    scrollInner: {
        gap: 56,
    },
})