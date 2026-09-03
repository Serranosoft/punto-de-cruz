import { useContext } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LangContext } from '../src/utils/LangContext';
import Header from '../src/components/header';

const policy = {
    es: {
        title: 'Privacidad y datos',
        updated: 'Última actualización: 2 de septiembre de 2026',
        intro: 'Punto de Cruz no requiere una cuenta y no vende datos personales. Esta política explica qué información utiliza la aplicación y con qué finalidad.',
        sections: [
            ['Datos guardados en el dispositivo', 'Las preferencias de idioma y notificaciones, el progreso, los logros y el inventario se guardan localmente en el dispositivo. No se asocian a una cuenta remota.'],
            ['Conversión de imágenes', 'La fotografía seleccionada se lee y procesa localmente dentro del conversor integrado. La aplicación no la publica ni la comparte con otros usuarios. Solo se accede a Fotos cuando eliges una imagen o guardas un resultado.'],
            ['Publicidad', 'La aplicación utiliza Google AdMob y su plataforma de consentimiento. Según tu región y tus decisiones, Google puede tratar identificadores del dispositivo, dirección IP, interacciones con anuncios y datos de diagnóstico. En iOS, la publicidad personalizada solo utiliza el identificador publicitario cuando autorizas el seguimiento.'],
            ['Servicios externos', 'Cloudinary aloja imágenes estáticas de patrones; Vercel y cdnjs sirven el código del conversor; Molly Digital aloja archivos PDF; y Google presta los servicios de publicidad y consentimiento. Estos proveedores pueden recibir datos técnicos básicos, como la dirección IP, necesarios para entregar sus recursos.'],
            ['Notificaciones', 'Los recordatorios semanales son opcionales. Solo se programan después de pulsar la campana y aceptar el permiso del sistema, y se pueden desactivar desde la misma campana o desde Ajustes de iOS.'],
            ['Conservación y control', 'Puedes eliminar los datos locales desinstalando la aplicación. Los permisos de Fotos, notificaciones y seguimiento se pueden modificar en los Ajustes de iOS.'],
        ],
        google: 'Política de privacidad de Google',
        contact: 'Contacto: mollydigitalapps@gmail.com',
    },
    en: {
        title: 'Privacy and Data',
        updated: 'Last updated: September 2, 2026',
        intro: 'Punto de Cruz does not require an account and does not sell personal data. This policy explains what information the app uses and why.',
        sections: [
            ['Data stored on the device', 'Language and notification preferences, progress, achievements, and inventory are stored locally on the device. They are not linked to a remote account.'],
            ['Image conversion', 'The selected photo is read and processed locally inside the embedded converter. The app does not publish it or share it with other users. Photos access is only used when you choose an image or save a result.'],
            ['Advertising', 'The app uses Google AdMob and its consent platform. Depending on your region and choices, Google may process device identifiers, IP address, ad interactions, and diagnostic data. On iOS, personalized advertising only uses the advertising identifier when you authorize tracking.'],
            ['External services', 'Cloudinary hosts static pattern images; Vercel and cdnjs deliver the converter code; Molly Digital hosts PDF files; and Google provides advertising and consent services. These providers may receive basic technical data, such as the IP address, required to deliver their resources.'],
            ['Notifications', 'Weekly reminders are optional. They are only scheduled after you tap the bell and grant system permission, and can be disabled from the same bell or from iOS Settings.'],
            ['Retention and control', 'You can remove locally stored data by uninstalling the app. Photos, notification, and tracking permissions can be changed in iOS Settings.'],
        ],
        google: 'Google Privacy Policy',
        contact: 'Contact: mollydigitalapps@gmail.com',
    },
};

export default function Privacy() {
    const { language } = useContext(LangContext);
    const copy = language.locale?.startsWith('es') ? policy.es : policy.en;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ header: () => <Header title={copy.title} /> }} />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.updated}>{copy.updated}</Text>
                <Text style={styles.intro}>{copy.intro}</Text>

                {copy.sections.map(([title, body]) => (
                    <View key={title} style={styles.section}>
                        <Text style={styles.sectionTitle}>{title}</Text>
                        <Text style={styles.body}>{body}</Text>
                    </View>
                ))}

                <TouchableOpacity
                    style={styles.link}
                    accessibilityRole="link"
                    onPress={() => Linking.openURL('https://policies.google.com/privacy')}
                >
                    <Feather name="external-link" size={18} color="#d35400" />
                    <Text style={styles.linkText}>{copy.google}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.link}
                    accessibilityRole="link"
                    onPress={() => Linking.openURL('mailto:mollydigitalapps@gmail.com')}
                >
                    <Feather name="mail" size={18} color="#d35400" />
                    <Text style={styles.linkText}>{copy.contact}</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        padding: 20,
        paddingBottom: 48,
    },
    updated: {
        fontFamily: 'poppins-regular',
        color: '#777',
        fontSize: 12,
        marginBottom: 16,
    },
    intro: {
        fontFamily: 'poppins-medium',
        color: '#33251f',
        fontSize: 15,
        lineHeight: 23,
        marginBottom: 24,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f0e5de',
        padding: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontFamily: 'poppins-bold',
        color: '#7a2e00',
        fontSize: 16,
        marginBottom: 8,
    },
    body: {
        fontFamily: 'poppins-regular',
        color: '#4f443e',
        fontSize: 14,
        lineHeight: 21,
    },
    link: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
    },
    linkText: {
        flex: 1,
        fontFamily: 'poppins-medium',
        color: '#d35400',
        fontSize: 14,
    },
});
