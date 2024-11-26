import { ToastAndroid } from "react-native";
import * as MediaLibrary from 'expo-media-library';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { shareAsync } from 'expo-sharing';

const ALBUM_NAME = "Punto de cruz";
const PERMISSION_DENIED = "Permiso denegado"
const SUCCESS = "Imagen guardada en la galería"




export async function convertToPdf(image) {
    const base64Image = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
    });
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

    await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
};


/** Encargado de solicitar los permisos necesarios para almacenar el resultado en la galería del dispositivo */
export async function requestPermissions(conversion) {
    try {
        const { status } = await MediaLibrary.requestPermissionsAsync(false, ["photo"]);
        if (status === "granted") {
            save(conversion);
        } else {
            ToastAndroid.showWithGravityAndOffset(PERMISSION_DENIED, ToastAndroid.LONG, ToastAndroid.BOTTOM, 25, 50);
        }
    } catch (error) {
        ToastAndroid.showWithGravityAndOffset(PERMISSION_DENIED, ToastAndroid.LONG, ToastAndroid.BOTTOM, 25, 50);
    }
}

/** Almacenar en galería */
async function save(conversion) {
    try {
        const asset = await MediaLibrary.createAssetAsync(conversion);
        let album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
        if (!album) {
            album = await MediaLibrary.createAlbumAsync(ALBUM_NAME, asset, false);
        } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }

        ToastAndroid.showWithGravityAndOffset(SUCCESS, ToastAndroid.LONG, ToastAndroid.BOTTOM, 25, 50);

    } catch (error) {
        ToastAndroid.showWithGravityAndOffset(PERMISSION_DENIED, ToastAndroid.LONG, ToastAndroid.BOTTOM, 25, 50);
    }
}