import { FlatList, StyleSheet, Text, View, StatusBar, TouchableOpacity, ScrollView, ImageBackground } from "react-native";
import { Link, Stack, useRouter } from "expo-router";
import { ui } from "../../utils/styles";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { highlight } from "../../utils/data";
import Button from "../../components/button";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function DesignsHome() {

    return (
        <View style={styles.container}>
            <Text style={[ui.h2, ui.center]}>💫 Populares 💫</Text>
            <View style={styles.grid}>
                <Link style={[styles.box]} href={{ pathname: "/item", params: { category: highlight[0].category, subcategory: highlight[0].data.name, steps: highlight[0].data.steps }}} asChild>
                    <TouchableOpacity>
                        <Image
                            style={{ position: "absolute", width: "100%", height: "100%", padding: 8, borderRadius: 24 }}
                            source={{ uri: highlight[0].data.image }}
                        />
                        <View style={styles.overlay} />
                        <View style={styles.boxInner}>
                            <View style={styles.boxBorder}>
                                <View style={styles.boxContent}>
                                    <Text style={[ui.h3, ui.bold, { color: "#fff" }]}>{highlight[0].data.name}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Link>

                <View style={styles.group}>
                    <Link style={[styles.box]} href={{ pathname: "/item", params: { category: highlight[1].category, subcategory: highlight[1].data.name, steps: highlight[1].data.steps } }} asChild>
                        <TouchableOpacity>
                            <View style={styles.pill}>
                                <Text style={[ui.muted, { color: "#fff" }]}>¡Tendencia!</Text>
                            </View>
                            <Image
                                style={{ position: "absolute", width: "100%", height: "100%", padding: 8, borderRadius: 24 }}
                                source={{ uri: highlight[1].data.image }}
                            />
                            <View style={styles.overlay} />
                            <View style={styles.boxInner}>
                                <View style={styles.boxBorder}>
                                    <View style={styles.boxContent}>
                                        <Text style={[ui.text, ui.bold, { color: "#fff" }]}>{highlight[1].data.name}</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Link>

                    <Link style={[styles.box]} href={{ pathname: "/item", params: { category: highlight[2].category, subcategory: highlight[2].data.name, steps: highlight[2].data.steps } }} asChild>
                        <TouchableOpacity>
                            <Image
                                style={{ position: "absolute", width: "100%", height: "100%", padding: 8, borderRadius: 24 }}
                                source={{ uri: highlight[2].data.image }}
                            />
                            <View style={styles.overlay} />
                            <View style={styles.boxInner}>
                                <View style={styles.boxBorder}>
                                    <View style={styles.boxContent}>
                                        <Text style={[ui.text, ui.bold, { color: "#fff" }]}>{highlight[2].data.name}</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
            <Button
                onClick={() => router.navigate("/converter")}
                icon={<MaterialIcons name="menu-book" size={24} color="#fff" />}
                text={"Ver todos los diseños"}
            />
        </View>
    )
}

const styles = StyleSheet.create({

    container: {
        gap: 24
    },

    grid: {
        flexDirection: "row",
        gap: 8,
        height: 250,
    },

    box: {
        flex: 1,
    },

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

    group: {
        flex: 1,
        gap: 8,
    },

    item: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
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