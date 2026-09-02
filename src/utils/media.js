import { Alert, Platform, ToastAndroid } from "react-native";
import * as MediaLibrary from 'expo-media-library';
import * as Print from 'expo-print';
import { File } from 'expo-file-system';
import { shareAsync } from 'expo-sharing';

export async function convertToPdf(image) {
    const base64Image = await new File(image).base64();
    const html = `
                    <html>
                      <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                      </head>
                      <body style="text-align: center;">
                        <img
                          src="data:image/jpeg;base64,${base64Image}"
                          style="width: 90vw;" />
                      </body>
                    </html>
                `;

    const { uri } = await Print.printToFileAsync({ html });

    await shareAsync(uri, { UTI: 'com.adobe.pdf', mimeType: 'application/pdf' });
};


/** Encargado de solicitar los permisos necesarios para almacenar el resultado en la galería del dispositivo */
export async function requestPermissions(conversion, messages) {
    try {
        // iOS only needs add-only access here. Requesting read access exposes the
        // user's whole library and prevents the write-only save flow from working
        // as intended when access is limited.
        const writeOnly = Platform.OS === "ios";
        const { status } = await MediaLibrary.requestPermissionsAsync(writeOnly, ["photo"]);
        if (status === "granted") {
            await save(conversion, messages);
        } else {
            showMessage(messages.PERMISSION_DENIED);
        }
    } catch (error) {
        console.warn("Could not request media-library permission", error);
        showMessage(messages.PERMISSION_DENIED);
    }
}

/** Almacenar en galería */
async function save(conversion, messages) {
    try {
        if (Platform.OS === "ios") {
            await MediaLibrary.saveToLibraryAsync(conversion);
            showMessage(messages.SUCCESS);
            return;
        }

        const asset = await MediaLibrary.createAssetAsync(conversion);
        let album = await MediaLibrary.getAlbumAsync(messages.ALBUM_NAME);
        if (!album) {
            album = await MediaLibrary.createAlbumAsync(messages.ALBUM_NAME, asset, false);
        } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
        showMessage(messages.SUCCESS);

    } catch (error) {
        console.warn("Could not save media to the library", error);
        showMessage(messages.PERMISSION_DENIED);
    }
}

function showMessage(message) {
    if (Platform.OS === "android") {
        ToastAndroid.showWithGravityAndOffset(message, ToastAndroid.LONG, ToastAndroid.BOTTOM, 25, 50);
    } else {
        Alert.alert(message);
    }
}
