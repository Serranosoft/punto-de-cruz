import { StyleSheet, Text, View } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { AchievementsContext } from '../src/utils/AchievementsContext';

import PdfDownload from "../src/layout/item/PdfDownload";

export default function Item() {

    const params = useLocalSearchParams();
    const { category, subcategory, categoryFetch, subcategoryFetch, steps, image } = params;
    const stepsNum = Number(steps);
    const { language } = useContext(LangContext);
    const { adsLoaded, setAdTrigger } = useContext(AdsContext);
    const { unlockAchievement } = useContext(AchievementsContext);
    const [images, setImages] = useState([]);
    const [current, setCurrent] = useState(0);

    const isLastStep = (current + 1) === stepsNum;

    // Guardar en AsyncStorage inmediatamente al entrar al patrón y en cada avance
    useEffect(() => {
        AsyncStorage.setItem('lastProject', JSON.stringify({
            idPatron: `${category}-${subcategory}`,
            category,
            subcategory,
            categoryFetch,
            subcategoryFetch,
            steps: stepsNum,
            lastStep: current + 1,
            image: images.length > 0 ? images[0] : (image || null),
            dateUpdated: Date.now()
        }));

        if (current > 0) {
            unlockAchievement('primera_puntada');
        }
    }, [current, images]);

    useEffect(() => {
        if (!categoryFetch || !subcategoryFetch) {
            console.error('item.js: categoryFetch o subcategoryFetch faltantes', { categoryFetch, subcategoryFetch });
            return;
        }

        // Recuperar todas las imagenes de cloudinary con la tag category+subcategory
        const tag = `${categoryFetch.toLowerCase()}-${subcategoryFetch.toLowerCase().split(" ").join("-")}`;
        fetchResourcesList(tag);
    }, [categoryFetch, subcategoryFetch])

    async function fetchResourcesList(tag) {
        try {
            const response = await fetch(`https://res.cloudinary.com/dvuvk6yrw/image/list/${tag}.json`)
                .then((response) => response.json())
                .then(data => data);

            if (!response || !Array.isArray(response.resources)) {
                console.warn('fetchResourcesList: respuesta inesperada', response);
                return;
            }

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
        } catch (e) {
            console.error('fetchResourcesList: error al obtener imágenes', e);
        }
    }

    const handleDownload = () => {
        if (!categoryFetch || !subcategoryFetch) {
            console.error('handleDownload: categoryFetch o subcategoryFetch faltantes');
            return;
        }
        router.navigate(`https://mollydigital.manu-scholz.com/wp-content/uploads/2024/12/patron-${categoryFetch.toLowerCase().replaceAll(" ", "-")}-${subcategoryFetch.toLowerCase().replaceAll(" ", "-")}.pdf`);
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ header: () => <Header title={`${category} / ${subcategory}`} /> }} />
            <View style={styles.wrapper}>
                {isLastStep ? (
                    <PdfDownload
                        language={language}
                        onDownload={handleDownload}
                    />
                ) : (
                    <>
                        <Card name={`${category} / ${subcategory}`} images={images} setCurrent={setCurrent} current={current} steps={steps} />
                        <View style={styles.column}>
                            <Text style={[ui.muted, ui.center]}>{language.t("_itemPdfInfo")}</Text>
                        </View>
                    </>
                )}

                {adsLoaded && (
                    <View style={styles.adContainer}>
                        <BannerAd unitId={bannerId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{}} />
                    </View>
                )}

                <Actions />
                <Progress current={(current + 1)} qty={steps} setCurrent={setCurrent} setAdTrigger={setAdTrigger} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 0,
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
    },
    adContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 10,
    }
})
