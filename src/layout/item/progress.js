import { StyleSheet, Text, View } from "react-native";
import { useAnimatedStyle } from "react-native-reanimated";
import Animated from 'react-native-reanimated';
import { Link } from "expo-router";
import { ui } from "../../utils/styles";
import ArrowLeft from "../../components/arrow-left";
import ArrowRight from "../../components/arrow-right";
import { TouchableOpacity } from "react-native";

export default function Progress({ current, qty, setCurrent }) {



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
                onPress={() => setCurrent((current) => current - 1)}
            >
                <ArrowLeft />
            </TouchableOpacity>
            <View style={styles.pagination}>
                <Text style={ui.text}>{current}</Text>
                <Text style={ui.text}>de</Text>
                <Text style={ui.text}>{qty}</Text>
            </View>
            <TouchableOpacity
                style={
                    [
                        styles.btnWrapper,
                        current >= qty && styles.disabled
                    ]
                }
                onPress={() => setCurrent((current) => current + 1)}
                disabled={current >= qty}
            >
                <ArrowRight />
            </TouchableOpacity>
        </View>
        // <View style={{ gap: 3, marginHorizontal: 16 }}>
        //     <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        //         <Text style={[ui.text, ui.bold, {  marginLeft: 3 }]}>{current} / {qty} </Text>
        //         {
        //             current == qty ?
        //                 <Link href="/"><Text style={[ui.text, ui.bold, { fontSize: 13 }]}>¡Listo! Toca aquí para ver otra guía</Text></Link>
        //                 :
        //                 <Text style={[ui.text, ui.bold, { fontSize: 13 }]}>Desliza para ver el siguiente paso</Text>
        //         }
        //     </View>
        //     <View style={{ backgroundColor: "rgba(0,0,0,0.35)", height: 16, borderRadius: 16 }}>
        //         <Animated.View style={[animatedStyle, { backgroundColor: "#92C742", height: 16, borderRadius: 16 }]}></Animated.View>
        //     </View>
        // </View>
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