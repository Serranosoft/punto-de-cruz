import { Linking, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Progress from "../src/layout/item/progress";
import Card from "../src/layout/item/Card";
import { ui } from "../src/utils/styles";
import Actions from "../src/layout/item/actions";
import { LangContext } from "../src/utils/LangContext";
import Header from "../src/components/header";
import { AdsContext } from "../src/utils/AdsContext";
import { AchievementsContext } from '../src/utils/AchievementsContext';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AdBanner from "../src/components/AdBanner";

import PdfDownload from "../src/layout/item/PdfDownload";
import { getPatternImages } from "../src/utils/pattern-resources";

const PDF_UPLOAD_FOLDERS = {
    'bebe-chico': '2026/08',
    'bebe-chica': '2026/08',
    'bebe-recien-nacido': '2026/08',
    'conjuntos-naturaleza': '2026/08',
    'modernos-noche-estrellada': '2026/08',
    'marcapaginas-floral': '2026/08',
};

const slugify = (value = '') => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');

export default function Item() {

    const params = useLocalSearchParams();
    const { category, subcategory, categoryFetch, subcategoryFetch, steps, image } = params;
    const stepsNum = Number(steps);
    const { language } = useContext(LangContext);
    const { setAdTrigger } = useContext(AdsContext);
    const { unlockAchievement } = useContext(AchievementsContext);
    const insets = useSafeAreaInsets();
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
        })).catch(console.error);

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
        const tag = `${slugify(categoryFetch)}-${slugify(subcategoryFetch)}`;
        const configuredImages = getPatternImages(tag);

        if (configuredImages.length > 0) {
            setImages(configuredImages);
            return;
        }

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
        const patternSlug = `${slugify(categoryFetch)}-${slugify(subcategoryFetch)}`;
        const uploadFolder = PDF_UPLOAD_FOLDERS[patternSlug] || '2024/12';
        Linking.openURL(`https://mollydigital.manu-scholz.com/wp-content/uploads/${uploadFolder}/patron-${patternSlug}.pdf`)
            .catch((error) => console.error('handleDownload: no se pudo abrir el PDF', error));
    };

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
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

                <AdBanner placement="pattern" embedded />

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
})
