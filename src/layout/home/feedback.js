import { StyleSheet, Text, View } from "react-native"
import { ui } from "../../utils/styles"
import { LangContext } from "../../utils/LangContext";
import { useContext } from "react";

export default function Feedback() {
    const { language } = useContext(LangContext);

    return (
        <View style={styles.container}>
            <Text style={[ui.h2, ui.center]}>🎀 {language.t("_homeFooterTitle")} 🎀</Text>
            <Text style={[ui.text, ui.center]}>{language.t("_homeFooterSubtitle")} 🌈🌈</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
        paddingBottom: 48
    }
})