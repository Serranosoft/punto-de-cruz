import { Dimensions, StyleSheet, View, TouchableOpacity, Text, ScrollView } from "react-native";
import { useContext, useEffect, useRef, useState } from "react";
import { Stack } from "expo-router";
import ViewShot from "react-native-view-shot";
import { WebView } from 'react-native-webview';
import { convertToPdf, requestPermissions } from "../src/utils/media";
import { LangContext } from "../src/utils/LangContext";
import Header from "../src/components/header";
import Constants from "expo-constants";
import { AdsContext } from "../src/utils/AdsContext";
import { Feather } from '@expo/vector-icons';
import { AchievementsContext } from '../src/utils/AchievementsContext';

const width = Dimensions.get("screen").width;

const MyWebComponent = ({ setColors, webviewKey, setShowOpenAd }) => {
    return (
        <WebView
            key={webviewKey}
            source={{ uri: 'https://conversor-patron-de-cruz.vercel.app/' }}
            style={{ width: (width), flex: 1 }}
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
    const { unlockAchievement } = useContext(AchievementsContext);

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
        <View style={styles.container}>
            <Stack.Screen options={{ header: () => <Header title={language.t("_toolsConvTitle")} /> }} />
            
            <View style={styles.contentWrapper}>
                <ViewShot ref={ref} options={{ fileName: "punto-de-cruz-colores", format: "jpg", quality: 0.9 }} style={styles.shotContainer}>
                    {renderColors ? (
                        <View style={styles.colorsView}>
                            <ScrollView contentContainerStyle={styles.colorsGrid}>
                                {colors && colors.map((color, idx) => (
                                    <View key={idx} style={{ backgroundColor: color, width: 40, height: 40, borderRadius: 20, margin: 4, borderWidth: 1, borderColor: '#eee' }} />
                                ))}
                            </ScrollView>
                        </View>
                    ) : (
                        <MyWebComponent {...{ setColors, webviewKey, setShowOpenAd }} />
                    )}
                </ViewShot>
            </View>

            {/* Bottom Controls Panel */}
            {colors && (
                <View style={styles.controlsContainer}>
                    <View style={styles.actionsRow}>
                        <TouchableOpacity 
                            style={[styles.actionBtn, renderColors && styles.actionBtnDisabled]} 
                            disabled={renderColors}
                            onPress={() => {
                                unlockAchievement('hacedor');
                                ref.current.capture().then(uri => {
                                    requestPermissions(uri, messages)
                                })
                            }}
                        >
                            <Feather name="image" size={20} color={renderColors ? "#aaa" : "#fff"} />
                            <Text style={[styles.actionText, renderColors && { color: "#aaa" }]}>{language.t('_convJpgBtn')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.actionBtn, renderColors && styles.actionBtnDisabled]} 
                            disabled={renderColors}
                            onPress={() => {
                                unlockAchievement('hacedor');
                                ref.current.capture().then(uri => convertToPdf(uri))
                            }}
                        >
                            <Feather name="file-text" size={20} color={renderColors ? "#aaa" : "#fff"} />
                            <Text style={[styles.actionText, renderColors && { color: "#aaa" }]}>{language.t('_convPdfBtn')}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.secondaryRow}>
                        <TouchableOpacity 
                            style={styles.outlineBtn}
                            onPress={() => setRenderColors(!renderColors)}
                        >
                            <Feather name={renderColors ? "eye-off" : "droplet"} size={18} color="#d35400" />
                            <Text style={styles.outlineText}>{renderColors ? language.t('_convViewPattern') : language.t('_convViewColors')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.outlineBtn, { borderColor: '#e74c3c' }]}
                            onPress={() => {
                                setWebviewKey((key) => key + 1);
                                setColors(null); 
                                setRenderColors(false);
                            }}
                        >
                            <Feather name="refresh-cw" size={18} color="#e74c3c" />
                            <Text style={[styles.outlineText, { color: '#e74c3c' }]}>{language.t('_convRestart')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
        paddingTop: Constants.statusBarHeight + 64,
    },
    contentWrapper: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    shotContainer: {
        flex: 1,
        backgroundColor: "#fff"
    },
    colorsView: {
        flex: 1,
        padding: 16,
    },
    colorsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    controlsContainer: {
        paddingHorizontal: 20,
        paddingBottom: 32,
        backgroundColor: '#f8f9fa',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    actionBtn: {
        flex: 1,
        backgroundColor: '#d35400',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 8,
    },
    actionBtnDisabled: {
        backgroundColor: '#e1e3e8',
    },
    actionText: {
        fontFamily: 'poppins-medium',
        color: '#fff',
        fontSize: 14,
    },
    secondaryRow: {
        flexDirection: 'row',
        gap: 12,
    },
    outlineBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#fae5d3',
        borderRadius: 12,
        gap: 8,
        backgroundColor: '#fff'
    },
    outlineText: {
        fontFamily: 'poppins-medium',
        color: '#d35400',
        fontSize: 13,
    }
})