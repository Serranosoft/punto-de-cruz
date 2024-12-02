import { ui } from "../utils/styles";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function LangListItem({ updateLanguage, acronym, title, setSelected, selected }) {
    function handlePress() {
        updateLanguage(acronym);
        setSelected(acronym);
    }

    return (
        <TouchableOpacity onPress={handlePress} style={[styles.option, selected === acronym && styles.selected]}>
            <Text style={[ui.text, { color: "#000"}]}>{title}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    option: {
        padding: 12,
    },

    selected: {
        backgroundColor: "#F7F0EC",
        
    }
})