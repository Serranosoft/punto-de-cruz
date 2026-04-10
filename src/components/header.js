import { Image, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { components, padding, ui } from "../utils/styles"
import { useContext, useState } from "react";
import { LangContext } from "../utils/LangContext";
import { Menu, MenuDivider, MenuItem } from "react-native-material-menu";
import { router } from "expo-router";

export default function Header({ isHome, title }) {

    const { language } = useContext(LangContext);
    const insets = useSafeAreaInsets();

    const [visible, setVisible] = useState(false);
    const hideMenu = () => setVisible(false);
    const showMenu = () => setVisible(true);

    return (
        <View style={[styles.container, { paddingTop: insets.top + 5 }]}>
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
                        <MenuItem onPress={() => {
                            router.push("settings");
                            hideMenu();
                        }}>
                            <View style={components.row}>
                                <Image style={styles.img} source={require("../../assets/settings.png")} />
                                <Text style={[ui.muted, ui.bold, { marginBottom: -4 }]}>{language.t("_headerDropdownOption1")}</Text>
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
        width: "100%",
        paddingTop: insets.top + 5,
        paddingBottom: 15,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#f1f1f1",
        justifyContent: "space-between",
    },

    img: {
        width: 23,
        height: 23,
    },
})