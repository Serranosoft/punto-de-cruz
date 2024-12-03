import { Image, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native"
import { components, ui } from "../utils/styles"
import { useContext, useState } from "react";
import { LangContext } from "../utils/LangContext";
import { Menu, MenuDivider, MenuItem } from "react-native-material-menu";
import { router } from "expo-router";

export default function Header({ isHome, title }) {

    const { language } = useContext(LangContext);

    const [visible, setVisible] = useState(false);
    const hideMenu = () => setVisible(false);
    const showMenu = () => setVisible(true);

    return (
        <View style={styles.container}>
            {
                isHome ?
                    <Menu
                        visible={visible}
                        onRequestClose={hideMenu}
                        anchor={(
                            <TouchableWithoutFeedback onPress={showMenu}>
                                <Image source={require("../../assets/more.png")} style={styles.img} />
                            </TouchableWithoutFeedback>
                        )}>
                        <MenuDivider />
                        <MenuItem onPress={() => router.push("settings")}>
                            <View style={components.row}>
                                <Image style={styles.img} source={require("../../assets/settings.png")} />
                                <Text>{language.t("_headerDropdownOption2")}</Text>
                            </View>
                        </MenuItem>
                    </Menu>
                    :
                    <TouchableWithoutFeedback onPress={() => router.back()}>
                        <Image source={require("../../assets/back.png")} style={styles.img} />
                    </TouchableWithoutFeedback>
            }
            <Text style={[ui.muted, ui.bold, { marginBottom: -4, color: "#000" }]}>{title || language.t("_headerTitle")}</Text>
        </View>
    )
}

const styles = StyleSheet.create({

    container: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        width: "90%",
        height: 50,
        alignSelf: "center",
        position: "absolute",
        justifyContent: "space-between",
        top: 56,
        backgroundColor: "#F7F0EC",
        borderRadius: 100,
        borderWidth: 3,
        borderColor: "rgba(255, 154, 91, 0.75)",
    },

    img: {
        width: 23,
        height: 23,
    },
})