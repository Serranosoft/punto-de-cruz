import { Dimensions, StatusBar, StyleSheet, Text, View } from "react-native";
import Bubble from "../src/components/bubble";
import { useRef, useState } from "react";
import { Stack } from "expo-router";
import Button from "../src/components/button";
import ViewShot from "react-native-view-shot";
import { WebView } from 'react-native-webview';
import { convertToPdf, requestPermissions } from "../src/utils/media";
import { ui } from "../src/utils/styles";

const width = Dimensions.get("screen").width;

const MyWebComponent = ({ setColors, webviewKey }) => {
    return (
        <WebView
            key={webviewKey}
            source={{ uri: 'https://conversor-patron-de-cruz.vercel.app/' }}
            style={{ width: (width - 40), borderWidth: 3, borderColor: "red" }}
            setSupportMultipleWindows={false}
            onMessage={(event) => {
                if (event.nativeEvent.data === "keepAlive") {
                    console.log("keep alive");
                } else {
                    setColors(JSON.parse(event.nativeEvent.data))
                }
            }} />
    )
}

export default function Converter() {

    const [webviewKey, setWebviewKey] = useState(1);
    const [colors, setColors] = useState(null);
    const [renderColors, setRenderColors] = useState(false);

    const ref = useRef();

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                <Bubble style={{ position: "absolute", top: -200, left: -100, width: 300, height: 300, opacity: 0.75 }} />

                {
                    colors &&
                    <View style={[styles.row, { width: "100%", justifyContent: "space-between" }]}>
                        <Button
                            onClick={() => {
                                ref.current.capture().then(uri => {
                                    requestPermissions(uri)
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

                <ViewShot ref={ref} options={{ fileName: "Test", format: "jpg", quality: 0.9 }} style={{ flex: 1, backgroundColor: "#fff" }}>
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
                                <MyWebComponent {...{ setColors, webviewKey }} />
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
        paddingTop: StatusBar.currentHeight + 32,
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