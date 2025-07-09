import { StyleSheet, Text, View } from "react-native";
import { ui } from "../../utils/styles";
import ArrowLeft from "../../components/arrow-left";
import ArrowRight from "../../components/arrow-right";
import { TouchableOpacity } from "react-native";
import { useContext } from "react";
import { LangContext } from "../../utils/LangContext";

export default function Progress({ current, qty, setCurrent, setAdTrigger }) {

    const { language } = useContext(LangContext);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={
                    [
                        styles.btnWrapper,
                        current < 2 && styles.disabled
                    ]
                }
                disabled={current < 2}
                onPress={() => {
                    setCurrent((current) => current - 1)
                    setAdTrigger((prev) => prev + 1);
                }}
            >
                <ArrowLeft />
            </TouchableOpacity>
            <View style={styles.pagination}>
                <Text style={ui.text}>{current}</Text>
                <Text style={ui.text}>{language.t("_itemProgress")}</Text>
                <Text style={ui.text}>{qty}</Text>
            </View>
            <TouchableOpacity
                style={
                    [
                        styles.btnWrapper,
                        current >= qty && styles.disabled
                    ]
                }
                onPress={() => {
                    setCurrent((current) => current + 1);
                    setAdTrigger((prev) => prev + 1);
                }}
                disabled={current >= qty}
            >
                <ArrowRight />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignSelf: "flex-end",
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        paddingHorizontal: 3,
        paddingVertical: 3,
        marginHorizontal: 16,
        backgroundColor: "#F0EFF6",
        borderRadius: 24,
    },

    btnWrapper: {
        width: 48,
        height: 48,
        borderRadius: 100,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },

    disabled: {
        backgroundColor: "#d8d7db",
    },

    pagination: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6
    }

})