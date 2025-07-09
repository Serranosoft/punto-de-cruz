import { Dimensions, StyleSheet, View } from "react-native";
import Bubble from "../src/components/bubble";
import { useContext, useEffect, useRef, useState } from "react";
import { Stack } from "expo-router";
import Button from "../src/components/button";
import ViewShot from "react-native-view-shot";
import { WebView } from 'react-native-webview';
import { convertToPdf, requestPermissions } from "../src/utils/media";
import { LangContext } from "../src/utils/LangContext";
import Header from "../src/components/header";
import Constants from "expo-constants";
import { AdsContext } from "../src/utils/AdsContext";

const width = Dimensions.get("screen").width;

const MyWebComponent = ({ setColors, webviewKey, setShowOpenAd }) => {
    return (
        <WebView
            key={webviewKey}
            source={{ uri: 'https://conversor-patron-de-cruz.vercel.app/' }}
            style={{ width: (width - 40) }}
            setSupportMultipleWindows={false}
            onMessage={(event) => {
                if (event.nativeEvent.data === "keepAlive") {
                    console.log("keep alive");
                } else {
                    setShowOpenAd(false);
                    setColors(JSON.parse(event.nativeEvent.data))
                }
            }} />
    )
}

export default function Converter() {

    const { language } = useContext(LangContext);
    const { setShowOpenAd } = useContext(AdsContext);

    useEffect(() => {
        setShowOpenAd(false);
    }, [])

    const [webviewKey, setWebviewKey] = useState(1);
    const [colors, setColors] = useState(null);
    const [renderColors, setRenderColors] = useState(false);

    const ref = useRef();

    const messages = {
        PERMISSION_DENIED: language.t("_convertMediaPermissionDenied"),
        ALBUM_NAME: language.t("_convertMediaAlbum"),
        SUCCESS: language.t("_convertMediaSuccess"),
    }

    return (
        <>
            <Stack.Screen options={{ header: () => <Header title={language.t("_headerTitle")} /> }} />
            <View style={styles.container}>
                <Bubble style={{ position: "absolute", top: -200, left: -100, width: 300, height: 300, opacity: 0.75 }} />

                {
                    colors && 
                    <View style={[styles.row, { width: "100%", justifyContent: "space-between" }]}>
                        <Button
                            onClick={() => {
                                ref.current.capture().then(uri => {
                                    requestPermissions(uri, messages)
                                })
                            }}
                            disabled={renderColors}
                            small
                            text={"Descargar Imagen"}
                        />
                        <Button
                            onClick={() => {
                                ref.current.capture().then(uri => convertToPdf(uri))
                            }}
                            disabled={renderColors}
                            small
                            text={"Descargar PDF"}
                        />
                    </View>
                }

                <ViewShot ref={ref} options={{ fileName: "punto-de-cruz-colores", format: "jpg", quality: 0.9 }} style={{ flex: 1, backgroundColor: "#fff" }}>
                    {
                        <>
                            <View style={[styles.row, { display: renderColors ? "flex" : "none" }]}>
                                {
                                    colors && colors.map((color) => {
                                        return (
                                            <View style={{ backgroundColor: color, width: 50, height: 50 }}></View>
                                        )
                                    })
                                }
                                <Button
                                    onClick={() => {
                                        ref.current.capture().then(uri => convertToPdf(uri))
                                    }}
                                    text={"Descargar Colores"}
                                />
                            </View>
                            <View style={{ display: renderColors ? "none" : "flex" }}>
                                <MyWebComponent {...{ setColors, webviewKey, setShowOpenAd }} />
                            </View>
                        </>
                    }
                </ViewShot>

                {
                    colors &&
                    <View style={[styles.row, { justifyContent: "space-between" }]}>
                        <Button
                            onClick={() => {
                                setRenderColors(!renderColors);
                            }}
                            text={renderColors ? "Ver imagen" : "Ver colores"}
                        />
                        <Button
                            onClick={() => {
                                setWebviewKey((key) => key + 1);
                                setColors(null); 
                            }}
                            text={"Reiniciar"}
                        />
                    </View>
                }
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 12,
        paddingTop: Constants.statusBarHeight + 80,
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center"
    },

    row: {
        width: "100%",
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
    },

    column: {
        width: "100%",
        gap: 8,
    }
})