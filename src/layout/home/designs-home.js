import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { gap, layout, padding, ui } from "../../utils/styles";
import { Image } from "expo-image";
import { useContext } from "react";
import { LangContext } from "../../utils/LangContext";
import { highlight } from "../../utils/data";

export default function DesignsHome({ setAdTrigger }) {

    const { language } = useContext(LangContext);

    return (
        <View style={[gap.big, padding.bigHorizontal]}>
            <Text style={[ui.h2, ui.center]}>💫 {language.t("_homePopular")} 💫</Text>
            <View style={[layout.row, gap.small, { height: 250 }]}>
                <Link style={layout.flex} href={{ pathname: "/item", params: { categoryFetch: highlight(language)[0].fetch, subcategoryFetch: highlight(language)[0].data.fetch, category: highlight(language)[0].category, subcategory: highlight(language)[0].data.name, steps: highlight(language)[0].data.steps }}} asChild>
                    <TouchableOpacity onPress={() => setAdTrigger((prev) => prev + 1)}>
                        <View style={styles.pill}>
                                <Text style={[ui.muted, { color: "#fff" }]}>{language.t("_homeTrend")}</Text>
                            </View>
                        <Image
                            style={{ position: "absolute", width: "100%", height: "100%", padding: 8, borderRadius: 24 }}
                            source={{ uri: highlight(language)[0].data.image }}
                        />
                        <View style={styles.overlay} />
                        <View style={styles.boxInner}>
                            <View style={styles.boxBorder}>
                                <View style={styles.boxContent}>
                                    <Text style={[ui.h3, ui.bold, { color: "#fff" }]}>{highlight(language)[0].data.name}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Link>

                <View style={[layout.flex, gap.small]}>
                    <Link style={layout.flex} href={{ pathname: "/item", params: { categoryFetch: highlight(language)[1].fetch, subcategoryFetch: highlight(language)[1].data.fetch, category: highlight(language)[1].category, subcategory: highlight(language)[1].data.name, steps: highlight(language)[1].data.steps } }} asChild>
                        <TouchableOpacity onPress={() => setAdTrigger((prev) => prev + 1)}>
                            <Image
                                style={{ position: "absolute", width: "100%", height: "100%", padding: 8, borderRadius: 24 }}
                                source={{ uri: highlight(language)[1].data.image }}
                            />
                            <View style={styles.overlay} />
                            <View style={styles.boxInner}>
                                <View style={styles.boxBorder}>
                                    <View style={styles.boxContent}>
                                        <Text style={[ui.text, ui.bold, { color: "#fff" }]}>{highlight(language)[1].data.name}</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Link>

                    <Link style={layout.flex} href={{ pathname: "/item", params: { categoryFetch: highlight(language)[2].fetch, subcategoryFetch: highlight(language)[2].data.fetch, category: highlight(language)[2].category, subcategory: highlight(language)[2].data.name, steps: highlight(language)[2].data.steps } }} asChild>
                        <TouchableOpacity onPress={() => setAdTrigger((prev) => prev + 1)}>
                            <Image
                                style={{ position: "absolute", width: "100%", height: "100%", padding: 8, borderRadius: 24 }}
                                source={{ uri: highlight(language)[2].data.image }}
                            />
                            <View style={styles.overlay} />
                            <View style={styles.boxInner}>
                                <View style={styles.boxBorder}>
                                    <View style={styles.boxContent}>
                                        <Text style={[ui.text, ui.bold, { color: "#fff" }]}>{highlight(language)[2].data.name}</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({

    overlay: {
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 24
    },

    boxInner: {
        flex: 1,
        padding: 8,
    },

    boxBorder: {
        borderWidth: 4,
        borderColor: "#fff",
        borderRadius: 16,
        padding: 8,
        flex: 1,
        justifyContent: "flex-end",
    },

    boxContent: {
        alignItems: "flex-start",
    },

    pill: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: "#c44601",
        position: "absolute",
        top: -10,
        right: 16,
        borderRadius: 8,
        zIndex: 1
    }
})