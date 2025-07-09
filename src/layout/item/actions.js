import { StyleSheet, View } from "react-native";
import Pinch from "../../components/pinch";
import { Text } from "react-native";
import { ui } from "../../utils/styles";
import DoubleTap from "../../components/double-tap";
import { LangContext } from "../../utils/LangContext";
import { useContext } from "react";

export default function Actions() {

    const { language } = useContext(LangContext);

    return (
        <View style={styles.container}>
            <View style={styles.action}>
                <View style={styles.icon}>
                    <Pinch />
                </View>
                <Text style={ui.muted}>{language.t("_itemActionPinch")}</Text>
            </View>
            <View style={styles.action}>
                <View style={styles.icon}>
                    <DoubleTap />
                </View>
                <Text style={ui.muted}>{language.t("_itemActionDoublePress")}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignSelf: "flex-end",
        gap: 4,
        paddingHorizontal: 16        
    },
    
    action: {
        paddingHorizontal: 3,
        paddingRight: 6,
        paddingVertical: 3,
        borderRadius: 16,
        backgroundColor: "#F0EFF6",
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },

    icon: {
        width: 24,
        height: 24,
        borderRadius: 100,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    }
})