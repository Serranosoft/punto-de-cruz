import { StyleSheet, Text, View } from "react-native";
import { ui } from "../../utils/styles";
import Button from "../../components/button";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from "expo-router";

export default function ConverterHome() {

    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={[ui.h2, ui.center]}>🤩 Tus fotos 🤩</Text>
            <View style={styles.box}>
                <View style={styles.wrapper}>
                    <Text style={[ui.text, ui.bold, { textAlign: "center", maxWidth: 250 }]}>Convierte tus fotos en punto de cruz</Text>
                    <Button
                        onClick={() => router.navigate("/converter")}
                        icon={<MaterialIcons name="menu-book" size={24} color="#fff" />}
                        text={"Convertir mis fotos"}
                    />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 16
    },
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