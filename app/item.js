import { StatusBar, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { createRef, useEffect, useState } from "react";
import Progress from "../src/layout/item/progress";
// import { fetchData, fetchImages } from "../src/utils/data";
import Card from "../src/layout/item/Card";
import Bubble from "../src/components/bubble";
import { ui } from "../src/utils/styles";
import Pinch from "../src/components/pinch";
import Actions from "../src/layout/item/actions";

export default function Item() {

    const params = useLocalSearchParams();
    const { category, subcategory, steps } = params;

    // const [steps, setSteps] = useState([]);
    const [images, setImages] = useState([]);

    const [current, setCurrent] = useState(0);

    useEffect(() => {
        // Recuperar todas las imagenes de cloudinary con la tag category+subcategory
        const tag = `${category.toLowerCase()}-${subcategory.toLowerCase().split(" ").join("-")}`;
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
            <Stack.Screen options={{ headerShown: false }} />
            <Bubble style={{ position: "absolute", top: -200, left: -100, width: 300, height: 300, opacity: 0.75 }} />
            <View style={styles.action}>
            </View>
            <View style={styles.wrapper}>
                <Text style={[ui.h2, { marginBottom: 8 }]}>{`${category} / ${subcategory}`}</Text>
                <Card name={`${category} / ${subcategory}`} images={images} setCurrent={setCurrent} current={current} steps={steps} />
                <Actions />
                <Progress current={(current + 1)} qty={steps} setCurrent={setCurrent} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: StatusBar.currentHeight + 32,
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: "#fff"
    },
    wrapper: {
        flex: 1,
        justifyContent: "space-around",
        gap: 12,
    }
})