import { ScrollView, StyleSheet, Text, View } from "react-native";
import { layout, padding, ui } from "../src/utils/styles";
import { useContext } from "react";
import LangList from "../src/components/lang-list";
import { LangContext } from "../src/utils/LangContext";
import { Stack } from "expo-router";
import Header from "../src/components/header";
import Constants from "expo-constants";

export default function Settings() {

    const { language } = useContext(LangContext);

    return (
        <View style={[layout.flex, padding.bigHorizontal, { paddingTop: Constants.statusBarHeight + 64, backgroundColor: "#fff" }]}>
            <Stack.Screen options={{ header: () => <Header title={language.t("_settingsTitle")} /> }} />
            <ScrollView style={{ flex: 1 }}>
                <View style={styles.box}>
                    <Text style={[ui.h4, ui.black]}>{language.t("_settingsApp")}</Text>
                    <Text style={[ui.text, ui.black]}>{language.t("_settingsLang")}</Text>
                    <LangList />
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({

    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 8,
        paddingBottom: 16,
        borderBottomWidth: 2,
        borderBottomColor: "#f0f0f0"
    },

    column: {
        alignItems: "flex-start",
        marginVertical: 8,
    },

    switch: {
        transform: [{ scale: 1.3 }]
    },

    box: {
        gap: 12,
        backgroundColor: "#ff9a5b",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginVertical: 16
    },

    typoItem: {
        width: 120,
        position: "relative",
        height: 80,
        backgroundColor: "#fff",
        elevation: 5,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
        marginRight: 8
    },

    typoImg: {
        width: "90%",
        height: "90%",
        resizeMode: "contain",
    },

    typoSelected: {
        borderWidth: 3,
        // borderColor: colors.dark
    },

    btn: {
        width: "100%",
        borderRadius: 100,
        borderWidth: 2,
        // borderColor: colors.dark,
        padding: 8,
    }
})