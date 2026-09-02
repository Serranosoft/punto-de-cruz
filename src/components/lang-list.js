import { ScrollView, StyleSheet, View } from "react-native";
import LangListItem from "./lang-list-item";
import { useContext } from "react";
import { LangContext } from "../utils/LangContext";
import { userPreferences } from "../utils/user-preferences";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supportedLanguages } from "../utils/supported-languages";

export default function LangList() {

    const { language, setLanguage } = useContext(LangContext);

    async function updateLanguage(acronym) {
        setLanguage(acronym);
        try {
            await AsyncStorage.setItem(userPreferences.LANGUAGE, acronym);
        } catch (e) {
            console.error("updateLanguage error:", e);
        }
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scroll} nestedScrollEnabled={true}>
                {
                    supportedLanguages.map((lang) => {
                        return (
                            <LangListItem key={lang.code} nativeName={lang.nativeName} acronym={lang.code} rtl={lang.rtl} updateLanguage={updateLanguage} selected={language.locale} />
                        )
                    })
                }
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 220,
        width: "100%",
    },

    scroll: {
        flex: 1,
        width: "100%",
        backgroundColor: "#fff",
    },


})
