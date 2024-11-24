import { StyleSheet } from "react-native";
import LottieView from 'lottie-react-native';
import { View } from "react-native";
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
export default function Card({ steps, images, current }) {

    return (
        <>
            {steps || images ?

                <View style={styles.wrapper}>
                    <View style={styles.card}>
                        <View style={{ width: "100%", height: 325 }} >
                            {images[current] &&
                                <ImageZoom
                                    onResetAnimationEnd={false}
                                    minScale={1}
                                    maxScale={3}
                                    uri={images[current]}
                                    isDoubleTapEnabled
                                />
                            }
                        </View>
                    </View>
                </View>

                :
                <LottieView source={require("../../../assets/lottie/loading-animation.json")} style={styles.lottie} loop={true} autoPlay={true} />
            }
        </>
    )

}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: "space-around",
        alignItems: "center",
    },
    card: {
        width: "100%",
        paddingVertical: 8,
        gap: 24,
    },
})