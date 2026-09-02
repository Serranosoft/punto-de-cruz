import { ui } from "../utils/styles";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function LangListItem({ updateLanguage, acronym, nativeName, rtl, selected }) {
    function handlePress() {
        updateLanguage(acronym);
    }

    return (
        <TouchableOpacity
            onPress={handlePress}
            accessibilityRole="radio"
            accessibilityLabel={nativeName}
            accessibilityLanguage={acronym}
            accessibilityState={{ checked: selected === acronym }}
            style={[styles.option, selected === acronym && styles.selected]}
        >
            <Text style={[ui.text, { color: "#000", writingDirection: rtl ? "rtl" : "ltr" }]}>{nativeName}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    option: {
        padding: 12,
        minHeight: 48,
        justifyContent: "center",
    },

    selected: {
        backgroundColor: "#F7F0EC",
        
    }
})
