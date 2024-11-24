import { SplashScreen, Stack } from "expo-router";
import { View, StatusBar, StyleSheet, Pressable, Image } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import * as Notifications from 'expo-notifications';
import { DataContext } from "../src/utils/DataContext";
import { ui } from "../src/utils/styles";
import { getAllFavorites, initDb } from "../src/utils/storage";

SplashScreen.preventAutoHideAsync();
export default function Layout() {

    // Carga de fuentes.
    const [fontsLoaded] = useFonts({
        "poppins-regular": require("../assets/fonts/Poppins-Regular.ttf"),
        "poppins-medium": require("../assets/fonts/Poppins-Medium.ttf"),
        "poppins-bold": require("../assets/fonts/Poppins-Bold.ttf")
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    useEffect(() => {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: false,
                shouldSetBadge: false,
            }),
        });
    }, [])


    useEffect(() => {
        init();
    }, []);

    async function init() {
        await initDb();
    }

    const [favorites, setFavorites] = useState([]);
    useEffect(() => {
        async function getFavorites() {
            const result = await getAllFavorites();
            if (result) setFavorites(result);
        }
        getFavorites();
    }, [])

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            <DataContext.Provider value={{ favorites: favorites, setFavorites: setFavorites }}>
                <GestureHandlerRootView style={styles.wrapper}>
                    <Stack />
                    {/* <Pressable onPress={() => router.push("/favorites")} style={ui.floatingWrapper}>
                        <Image style={ui.floatingImg} source={require("../assets/favorites.png")} />
                    </Pressable> */}
                </GestureHandlerRootView>
            </DataContext.Provider>
            <StatusBar style="light" />
        </View >
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
        justifyContent: "center",
    },
    wrapper: {
        flex: 1,
        width: "100%",
        alignSelf: "center",
        justifyContent: "center",
    },
})