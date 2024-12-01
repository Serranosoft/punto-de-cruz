import { StyleSheet, Text, View, StatusBar, ScrollView } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ui } from "../src/utils/styles";
import { useEffect, useMemo, useState } from "react";
import { categories_raw } from "../src/utils/data";
import { scheduleWeeklyNotification } from "../src/utils/notifications";
import Bubble from "../src/components/bubble";
import ConverterHome from "../src/layout/home/converter-home";
import DesignsHome from "../src/layout/home/designs-home";
import DesignsListHome from "../src/layout/home/designs-list-home";
import Feedback from "../src/layout/home/feedback";

export default function Home() {

    const [categories, setCategories] = useState([])
    const router = useRouter();
    useMemo(() => setCategories(categories_raw), [categories]);
    useEffect(() => scheduleNotification(), []);

    function scheduleNotification() {
        scheduleWeeklyNotification();
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <Bubble style={{ position: "absolute", top: -200, left: -100, width: 300, height: 300, opacity: 0.75 }} />
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollInner}>
                <View>
                    <Text style={ui.h1}>Punto de cruz</Text>
                    <Text style={ui.muted}>Tenemos los mejores diseños de punto de cruz para ti</Text>
                </View>
                <DesignsHome />
                <ConverterHome />
                <DesignsListHome />
                <Feedback />
            </ScrollView>




            {/* <CrossStitchPattern /> */}




            {/* <View style={styles.grid}>
                    <Link style={[styles.box, { backgroundColor: "#00b6ff" }]} href={{ pathname: "/category", params: { name: clothes[clothes.length - 1].name, stepsLength: clothes[clothes.length - 1].steps } }} asChild>
                        <TouchableOpacity>
                            <Image source={{ uri: clothes[clothes.length - 1].image }} style={styles.icon} />
                            <View style={styles.boxContent}>
                                <Text style={[ui.h3, ui.bold]}>{clothes[clothes.length - 1].name}</Text>
                                <Text style={ui.muted}>{clothes[clothes.length - 1].steps} pasos a seguir</Text>
                            </View>
                        </TouchableOpacity>
                    </Link>

                    <View style={styles.group}>
                        <Link style={[styles.box, { backgroundColor: "#00d2eb" }]} href={{ pathname: "/category", params: { name: clothes[clothes.length - 2].name, stepsLength: clothes[clothes.length - 2].steps } }} asChild>
                            <TouchableOpacity>
                                <View style={styles.pill}>
                                    <Text style={[ui.muted, { color: "#fff" }]}>¡Tendencia!</Text>
                                </View>
                                <Image source={{ uri: clothes[clothes.length - 2].image }} style={styles.smallIcon} />
                                <View style={styles.boxContent}>
                                    <Text style={[ui.h4, ui.bold]}>{clothes[clothes.length - 2].name}</Text>
                                    <Text style={ui.muted}>{clothes[clothes.length - 1].steps} pasos a seguir</Text>
                                </View>
                            </TouchableOpacity>
                        </Link>

                        <Link style={[styles.box, { backgroundColor: "#00e7be" }]} href={{ pathname: "/category", params: { name: clothes[clothes.length - 3].name, stepsLength: clothes[clothes.length - 3].steps } }} asChild>
                            <TouchableOpacity>
                                <Image source={{ uri: clothes[clothes.length - 3].image }} style={styles.smallIcon} />
                                <View style={styles.boxContent}>
                                    <Text style={[ui.h4, ui.bold]}>{clothes[clothes.length - 3].name}</Text>
                                    <Text style={ui.muted}>{clothes[clothes.length - 1].steps} pasos a seguir</Text>
                                </View>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View> */}



            {/* <Text style={[ui.h3, { marginTop: 16 }]}>Aprende todos los puntos</Text>
                {
                    categories.length > 0 ?
                        <View style={styles.list}>
                            <FlatList
                                data={categories}
                                numColumns={1}
                                initialNumToRender={6}
                                renderItem={({ item, i }) => {
                                    return (
                                        <View key={i} style={styles.row}>
                                            <Link asChild href={{ pathname: "/category", params: { name: item.name, stepsLength: item.steps } }}>
                                                <Pressable>
                                                    <View style={styles.item}>
                                                        <Image transition={1000} style={styles.rowImage} source={item.image} placeholder={"LZLruhayXot8W?fQs*jt~8fQ=?js"} />
                                                        <Text style={[ui.h4, ui.bold, styles.rowTitle]}>{item.name}</Text>
                                                        <Text style={[ui.muted, { marginLeft: "auto" }]}>{item.steps} pasos</Text>
                                                    </View>
                                                </Pressable>
                                            </Link>
                                        </View>
                                    )
                                }}
                            />
                        </View>
                        :
                        <LottieView source={require("../assets/lottie/loading-animation.json")} loop={true} autoPlay={true} />
                } */}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: StatusBar.currentHeight + 32,
        backgroundColor: "#fff"
    },
    scroll: {
        flex: 1,
        paddingHorizontal: 20,
    },

    scrollInner: {
        gap: 56,

    },

    grid: {
        flexDirection: "row",
        gap: 8,
        height: 250,
    },

    box: {
        flex: 1,
        borderRadius: 16,
        paddingHorizontal: 8,
        paddingVertical: 12,
        justifyContent: "space-between"
    },

    boxContent: {
        alignItems: "flex-start",
    },

    icon: {
        width: 48,
        height: 48,
        borderRadius: 100,
    },

    smallIcon: {
        width: 32,
        height: 32,
        borderRadius: 100,
    },

    group: {
        flex: 1,
        gap: 8,
    },

    list: {
        width: "100%",
        flex: 1,
    },

    row: {
        marginVertical: 6,
        backgroundColor: "#e3f0ff",
        borderRadius: 100,
        paddingRight: 16
    },

    item: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    rowImage: {
        width: 56,
        height: 56,
        borderRadius: 100,
    },

    rowTitle: {
        paddingVertical: 12,
    },

    pill: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: "#FF7373",
        position: "absolute",
        top: -10,
        right: 10,
        borderRadius: 8,
    }
})