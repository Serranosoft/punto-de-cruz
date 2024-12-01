import { SplashScreen, Stack } from "expo-router";
import { View, StatusBar, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import * as Notifications from 'expo-notifications';
import { DataContext } from "../src/utils/DataContext";

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

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            <DataContext.Provider value={{ favorites: favorites, setFavorites: setFavorites }}>
                <GestureHandlerRootView style={styles.wrapper}>
                    <Stack />
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