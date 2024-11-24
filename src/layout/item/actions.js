import { StyleSheet, View } from "react-native";
import Pinch from "../../components/pinch";
import { Text } from "react-native";
import { ui } from "../../utils/styles";
import DoubleTap from "../../components/double-tap";

export default function Actions() {
    return (
        <View style={styles.container}>
            <View style={styles.action}>
                <View style={styles.icon}>
                    <Pinch />
                </View>
                <Text style={ui.muted}>Arrastrar (Zoom)</Text>
            </View>
            <View style={styles.action}>
                <View style={styles.icon}>
                    <DoubleTap />
                </View>
                <Text style={ui.muted}>Doble pulsación (Zoom)</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignSelf: "flex-end",
        gap: 4
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