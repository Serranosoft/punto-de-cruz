import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

const folderKey = 'pattern-books:download-directory';

async function androidFolder() {
    const saf = FileSystem.StorageAccessFramework;
    const stored = await AsyncStorage.getItem(folderKey);
    if (stored) {
        try {
            await saf.readDirectoryAsync(stored);
            return stored;
        } catch {
            await AsyncStorage.removeItem(folderKey);
        }
    }
    const permission = await saf.requestDirectoryPermissionsAsync();
    if (!permission.granted) return null;
    await AsyncStorage.setItem(folderKey, permission.directoryUri);
    return permission.directoryUri;
}

export async function downloadBookPdf(book, checkAccess) {
    if (!await checkAccess()) return null;
    const title = book.title.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').trim().slice(0, 120) || 'Libro';
    const name = `${title}.pdf`;
    if (Platform.OS === 'web') {
        const response = await fetch(book.pdfUrl);
        if (!response.ok) throw new Error(`PDF HTTP ${response.status}`);
        const blob = await response.blob();
        if (!await checkAccess()) return null;
        const uri = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = uri;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(uri), 60000);
        return { name };
    }

    const folder = Platform.OS === 'android' ? await androidFolder() : `${FileSystem.documentDirectory}Libros/`;
    if (!folder || !await checkAccess()) return null;
    const temporary = `${FileSystem.cacheDirectory}book-${book.id}-download.pdf`;
    let destination;
    let complete = false;
    try {
        const result = await FileSystem.downloadAsync(book.pdfUrl, temporary);
        if (result.status !== 200) throw new Error(`PDF HTTP ${result.status}`);
        if (!await checkAccess()) return null;
        if (Platform.OS === 'android') {
            // SAF writes run in native code; no sharing sheet or gallery permission.
            const bytes = await FileSystem.readAsStringAsync(temporary, { encoding: FileSystem.EncodingType.Base64 });
            if (!await checkAccess()) return null;
            destination = await FileSystem.StorageAccessFramework.createFileAsync(folder, name, 'application/pdf');
            await FileSystem.writeAsStringAsync(destination, bytes, { encoding: FileSystem.EncodingType.Base64 });
        } else {
            await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
            destination = `${folder}${name}`;
            await FileSystem.copyAsync({ from: temporary, to: destination });
        }
        complete = true;
        return { name, uri: destination };
    } finally {
        await FileSystem.deleteAsync(temporary, { idempotent: true }).catch(() => {});
        if (destination && !complete) await FileSystem.deleteAsync(destination, { idempotent: true }).catch(() => {});
    }
}
