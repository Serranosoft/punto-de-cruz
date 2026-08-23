import { ActivityIndicator, StyleSheet, View, TouchableOpacity, Text, ScrollView, useWindowDimensions } from "react-native";
import { useContext, useEffect, useRef, useState } from "react";
import { Stack } from "expo-router";
import ViewShot from "react-native-view-shot";
import { WebView } from 'react-native-webview';
import { convertToPdf, requestPermissions } from "../src/utils/media";
import { LangContext } from "../src/utils/LangContext";
import Header from "../src/components/header";
import { AdsContext } from "../src/utils/AdsContext";
import { Feather } from '@expo/vector-icons';
import { AchievementsContext } from '../src/utils/AchievementsContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CONVERSION_STARTED_MESSAGE = "conversionStarted";

const injectedConverterStyles = `
    (function () {
        if (!document.getElementById('cross-stitch-app-styles')) {
            const style = document.createElement('style');
            style.id = 'cross-stitch-app-styles';
            style.textContent = \`
                html, body {
                    width: 100%;
                    max-width: 100%;
                    min-width: 0;
                    overflow-x: hidden;
                    background: #fff;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                }

                section,
                section > div,
                .toolbar,
                .content {
                    width: 100%;
                    max-width: 100%;
                    min-width: 0;
                }

                .toolbar {
                    justify-content: stretch;
                    align-content: start;
                    gap: 16px;
                    margin: 0;
                    padding: 20px;
                }

                .toolbar div,
                .toolbar .column,
                .toolbar .row {
                    width: 100%;
                    max-width: 100%;
                    min-width: 0;
                }

                .toolbar label {
                    min-width: 0;
                    max-width: 100%;
                    font-size: 14px;
                    line-height: 20px;
                    white-space: normal;
                    overflow-wrap: anywhere;
                }

                .toolbar .row label {
                    flex: 1;
                }

                .toolbar button,
                .toolbar select {
                    display: block;
                    width: 100%;
                    max-width: 100%;
                    min-width: 0;
                    min-height: 48px;
                    margin: 0;
                    border-radius: 12px;
                    font-size: 16px;
                    line-height: 22px;
                }

                .toolbar button {
                    padding: 12px 16px;
                    white-space: normal;
                    overflow-wrap: anywhere;
                }

                .toolbar select {
                    padding: 10px 42px 10px 14px;
                }

                img,
                svg,
                #colors {
                    max-width: 100%;
                }

                #colors {
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 10px;
                    padding: 0 12px 12px;
                }

                #colors div {
                    min-width: 0;
                    height: 72px;
                }

                @media (max-width: 340px) {
                    .toolbar {
                        gap: 12px;
                        padding: 16px;
                    }

                    .toolbar label {
                        font-size: 13px;
                        line-height: 18px;
                    }
                }
            \`;
            document.head.appendChild(style);
        }

        if (!window.__crossStitchLoadingListenerAdded) {
            window.__crossStitchLoadingListenerAdded = true;
            window.addEventListener('fileOk', function () {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage('${CONVERSION_STARTED_MESSAGE}');
                }
            });
        }

        true;
    })();
`;

const MyWebComponent = ({ setColors, webviewKey, setShowOpenAd, setIsPageLoading, setIsConverting }) => {
    return (
        <WebView
            key={webviewKey}
            source={{ uri: 'https://conversor-patron-de-cruz.vercel.app/' }}
            style={styles.webView}
            injectedJavaScript={injectedConverterStyles}
            setSupportMultipleWindows={false}
            onLoadStart={() => setIsPageLoading(true)}
            onLoadEnd={() => setIsPageLoading(false)}
            onError={() => {
                setIsPageLoading(false);
                setIsConverting(false);
            }}
            onHttpError={() => {
                setIsPageLoading(false);
                setIsConverting(false);
            }}
            onMessage={(event) => {
                const message = event.nativeEvent.data;

                if (message === "keepAlive") {
                    return;
                } else if (message === CONVERSION_STARTED_MESSAGE) {
                    setIsConverting(true);
                } else {
                    try {
                        setShowOpenAd(false);
                        setColors(JSON.parse(message));
                        setIsConverting(false);
                    } catch (e) {
                        console.error('onMessage parse error:', e);
                    }
                }
            }} />
    )
}

export default function Converter() {

    const { language } = useContext(LangContext);
    const { setShowOpenAd } = useContext(AdsContext);
    const { unlockAchievement } = useContext(AchievementsContext);
    const insets = useSafeAreaInsets();
    const { width: screenWidth } = useWindowDimensions();

    useEffect(() => {
        setShowOpenAd(false);
    }, [])

    const [webviewKey, setWebviewKey] = useState(1);
    const [colors, setColors] = useState(null);
    const [renderColors, setRenderColors] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isConverting, setIsConverting] = useState(false);
    const isCompact = screenWidth < 360;

    const ref = useRef();

    const messages = {
        PERMISSION_DENIED: language.t("_convertMediaPermissionDenied"),
        ALBUM_NAME: language.t("_convertMediaAlbum"),
        SUCCESS: language.t("_convertMediaSuccess"),
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ header: () => <Header title={language.t("_toolsConvTitle")} /> }} />
            
            <View style={[
                styles.contentWrapper,
                !colors && [
                    styles.initialContentWrapper,
                    isCompact && styles.initialContentWrapperCompact
                ]
            ]}>
                <ViewShot ref={ref} options={{ fileName: "punto-de-cruz-colores", format: "jpg", quality: 0.9 }} style={styles.shotContainer}>
                    <MyWebComponent {...{
                        setColors,
                        webviewKey,
                        setShowOpenAd,
                        setIsPageLoading,
                        setIsConverting
                    }} />

                    {renderColors && (
                        <View style={styles.colorsView}>
                            <ScrollView contentContainerStyle={styles.colorsGrid}>
                                {colors && colors.map((color, idx) => (
                                    <View key={idx} style={{ backgroundColor: color, width: 40, height: 40, borderRadius: 20, margin: 4, borderWidth: 1, borderColor: '#eee' }} />
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </ViewShot>

                {(isPageLoading || isConverting) && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#d35400" />
                        <Text accessibilityLiveRegion="polite" style={styles.loadingText}>
                            {isConverting ? language.t('_convLoadingPattern') : language.t('_convLoadingTool')}
                        </Text>
                    </View>
                )}
            </View>

            {/* Bottom Controls Panel */}
            {colors && (
                <View style={[
                    styles.controlsContainer,
                    { paddingBottom: Math.max(insets.bottom, 20) }
                ]}>
                    <View style={[styles.actionsRow, isCompact && styles.controlsRowCompact]}>
                        <TouchableOpacity 
                            style={[styles.actionBtn, renderColors && styles.actionBtnDisabled]} 
                            disabled={renderColors}
                            onPress={() => {
                                unlockAchievement('hacedor');
                                ref.current.capture().then(uri => {
                                    requestPermissions(uri, messages)
                                }).catch(console.error);
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
                                ref.current.capture()
                                    .then(uri => convertToPdf(uri))
                                    .catch(console.error);
                            }}
                        >
                            <Feather name="file-text" size={20} color={renderColors ? "#aaa" : "#fff"} />
                            <Text style={[styles.actionText, renderColors && { color: "#aaa" }]}>{language.t('_convPdfBtn')}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.secondaryRow, isCompact && styles.controlsRowCompact]}>
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
                                setIsPageLoading(true);
                                setIsConverting(false);
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
    },
    contentWrapper: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        margin: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e1e3e8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    initialContentWrapper: {
        flex: 0,
        height: 280,
    },
    initialContentWrapperCompact: {
        height: 300,
    },
    shotContainer: {
        flex: 1,
        backgroundColor: "#fff"
    },
    webView: {
        flex: 1,
        width: '100%',
        backgroundColor: '#fff',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
    },
    loadingText: {
        maxWidth: 240,
        fontFamily: 'poppins-medium',
        color: '#555',
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },
    colorsView: {
        ...StyleSheet.absoluteFillObject,
        padding: 16,
        backgroundColor: '#fff',
    },
    colorsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    controlsContainer: {
        paddingHorizontal: 20,
        backgroundColor: '#f8f9fa',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    actionBtn: {
        flex: 1,
        minWidth: 0,
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
        flexShrink: 1,
        fontFamily: 'poppins-medium',
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
    },
    secondaryRow: {
        flexDirection: 'row',
        gap: 12,
    },
    outlineBtn: {
        flex: 1,
        minWidth: 0,
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
        flexShrink: 1,
        fontFamily: 'poppins-medium',
        color: '#d35400',
        fontSize: 13,
        textAlign: 'center',
    },
    controlsRowCompact: {
        flexDirection: 'column',
    }
})
