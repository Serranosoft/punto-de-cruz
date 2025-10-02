import { StyleSheet, Text, View } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import Progress from "../src/layout/item/progress";
import Card from "../src/layout/item/Card";
import { ui } from "../src/utils/styles";
import Actions from "../src/layout/item/actions";
import Button from "../src/components/button";
import { LangContext } from "../src/utils/LangContext";
import Header from "../src/components/header";
import Constants from "expo-constants";
import { AdsContext } from "../src/utils/AdsContext";
import { bannerId } from "../src/utils/constants";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";

export default function Item() {

    const params = useLocalSearchParams();
    const { category, subcategory, categoryFetch, subcategoryFetch, steps } = params;
    const { language } = useContext(LangContext);
    const { adsLoaded, setAdTrigger } = useContext(AdsContext);
    const [images, setImages] = useState([]);
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        // Recuperar todas las imagenes de cloudinary con la tag category+subcategory
        const tag = `${categoryFetch.toLowerCase()}-${subcategoryFetch.toLowerCase().split(" ").join("-")}`;
        fetchResourcesList(tag);
    }, [])

    async function fetchResourcesList(tag) {
        const response = await fetch(`https://res.cloudinary.com/dvuvk6yrw/image/list/${tag}.json`)
            .then((response) => response.json())
            .then(data => data);

        let images = [];

        const sorted = response.resources.sort((a, b) => {
            if (a["public_id"] > b["public_id"]) {
                return 1;
            } else {
                return -1
            }
        })

        sorted.forEach((image) => {
            images.push("https://res.cloudinary.com/dvuvk6yrw/image/upload/" + image["public_id"]);
        })

        setImages(images);
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ header: () => <Header title={`${category} / ${subcategory}`} /> }} />
            <View style={styles.wrapper}>
                <Card name={`${category} / ${subcategory}`} images={images} setCurrent={setCurrent} current={current} steps={steps} />
                {adsLoaded && <BannerAd unitId={bannerId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{}} />}
                {
                    (current + 1) == steps ?
                        <View style={styles.column}>
                            <Text style={[ui.h3, ui.center]}>{language.t("_itemPdfTitle")}</Text>
                            <Button
                                text={language.t("_itemPdfButton")}
                                onClick={() => router.navigate(`https://mollydigital.manu-scholz.com/wp-content/uploads/2024/12/patron-${categoryFetch.toLowerCase().replaceAll(" ", "-")}-${subcategoryFetch.toLowerCase().replaceAll(" ", "-")}.pdf`)}>
                            </Button>
                        </View>
                        :
                        <View style={styles.column}>
                            <Text style={[ui.muted, ui.center]}>{language.t("_itemPdfInfo")}</Text>
                        </View>
                }
                <Actions />
                <Progress current={(current + 1)} qty={steps} setCurrent={setCurrent} setAdTrigger={setAdTrigger} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Constants.statusBarHeight + 32,
        paddingBottom: 16,
        backgroundColor: "#fff"
    },
    wrapper: {
        flex: 1,
        justifyContent: "space-around",
        gap: 12,
    },

    column: {
        gap: 8,
        alignItems: "center",
        alignSelf: "center",
        marginBottom: 8,
        paddingHorizontal: 16,
    }
})