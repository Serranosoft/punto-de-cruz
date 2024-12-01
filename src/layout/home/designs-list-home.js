import { useMemo, useState } from "react";
import { categories_raw } from "../../utils/data";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import LottieView from 'lottie-react-native';
import { ui } from "../../utils/styles";

export default function DesignsListHome() {
    const [categories, setCategories] = useState([])
    useMemo(() => setCategories(categories_raw), [categories]);

    return (
        <View style={styles.container}>
            <Text style={[ui.h2, ui.center]}>👇 Más diseños 👇</Text>
            {
                categories.length > 0 ?
                    <View style={styles.list}>

                        {categories.map(((item, i) => {
                            return (
                                <View key={i} style={styles.wrapper}>
                                    <Text style={[ui.h3, ui.bold]}>{item.name}</Text>
                                    {
                                        item.subcategories.map((subcategory, j) => {
                                            return (
                                                <View key={j} style={styles.row}>
                                                    <Link asChild href={{ pathname: "/item", params: { category: item.name, subcategory: subcategory.name, steps: subcategory.steps } }}>
                                                        <Pressable>
                                                            <View style={styles.item}>
                                                                <Image style={styles.rowImage} source={{ uri: subcategory.image }} />
                                                                <Text style={[ui.h4, ui.bold, styles.rowTitle]}>{subcategory.name}</Text>
                                                            </View>
                                                        </Pressable>
                                                    </Link>
                                                </View>
                                            )
                                        })
                                    }
                                </View>
                            )
                        }))}
                    </View>
                    :
                    <LottieView source={require("../../../assets/lottie/loading-animation.json")} loop={true} autoPlay={true} />
            }
        </View>
    )
}

const styles = StyleSheet.create({

    list: {
        width: "100%",
        flex: 1,
    },

    container: {
        gap: 8
    },

    wrapper: {
        marginVertical: 16
    },

    row: {
        marginVertical: 6,
        backgroundColor: "#fcc39f",
        borderRadius: 100,
        paddingRight: 16
    },

    item: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    rowImage: {
        width: 64,
        height: 64,
        borderRadius: 100,
        borderRightWidth: 3,
    },

    rowTitle: {
        paddingVertical: 12,
    },
})