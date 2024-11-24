import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { ui } from "../utils/styles";

export default function Button({ icon, text, onClick, disabled }) {
    return (
        <TouchableOpacity style={[styles.button, disabled && styles.disabled]} onPress={onClick} disabled={disabled}>
            {icon}
            <Text style={[ui.text, styles.buttonText]}>{text}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({

    button: {
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: "#c44601",
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 8,

        shadowColor: "#efedff",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },

    buttonText: {
        marginBottom: -4,
        color: "#fff",
    },

    disabled: {
        backgroundColor: "#777586"
    }
})