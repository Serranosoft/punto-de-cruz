import { useContext } from "react";
import { content } from "../../utils/data";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import LottieView from 'lottie-react-native';
import { components, gap, padding, ui } from "../../utils/styles";
import { LangContext } from "../../utils/LangContext";

export default function DesignsListHome() {
    
    const { language } = useContext(LangContext);

    return (
        <View style={gap.small}>
            <Text style={[ui.h2, ui.center]}>👇 {language.t("_homeMyDesigns")} 👇</Text>
            {
                content(language).length > 0 ?
                    <View style={styles.list}>

                        {content(language).map(((item, i) => {
                            return (
                                <View key={i} style={padding.mediumVertical}>
                                    <Text style={[ui.h3, ui.bold]}>{item.name}</Text>
                                    {
                                        item.subcategories.map((subcategory, j) => {
                                            return (
                                                <View key={j} style={styles.row}>
                                                    <Link asChild href={{ pathname: "/item", params: { categoryFetch: item.fetch, subcategoryFetch: subcategory.fetch, category: item.name, subcategory: subcategory.name, steps: subcategory.steps } }}>
                                                        <Pressable>
                                                            <View style={components.row}>
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