import { StyleSheet, Text, View } from "react-native";
import { gap, ui } from "../../utils/styles";
import Button from "../../components/button";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from "expo-router";
import { LangContext } from "../../utils/LangContext";
import { useContext } from "react";

export default function ConverterHome() {

    const { language } = useContext(LangContext);
    const router = useRouter();

    return (
        <View style={gap.medium}>
            <Text style={[ui.h2, ui.center]}>🤩 {language.t("_homeYourPhotos")} 🤩</Text>
            <View style={styles.box}>
                <View style={styles.wrapper}>
                    <Text style={[ui.text, ui.bold, ui.center, { maxWidth: 250 }]}>{language.t("_homeConvertInfo")}</Text>
                    <Button
                        onClick={() => router.navigate("/converter")}
                        icon={<MaterialIcons name="menu-book" size={24} color="#fff" />}
                        text={language.t("_homeConvertPhotos")}
                    />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    box: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ff9a5b",
        borderRadius: 24,
        padding: 8
    },
    wrapper: {
        width: "100%",
        borderWidth: 4,
        borderColor: "#fff",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        gap: 8
    }
})