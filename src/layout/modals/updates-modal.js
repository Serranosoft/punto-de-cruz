import { useContext, useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LangContext } from '../../utils/LangContext';
import { APP, userPreferences } from '../../utils/user-preferences';
import { ui } from '../../utils/styles';
import Button from '../../components/button';


export default function UpdatesModal() {
    const [visible, setVisible] = useState(false);
    const { language } = useContext(LangContext);


    useEffect(() => {
        const checkIfSeen = async () => {
            const version = await AsyncStorage.getItem(userPreferences.CHANGELOG_VERSION);
            if (version !== APP.currentVersion) {
                setVisible(true);
            }
        };
        checkIfSeen();
    }, []);

    const closeModal = async () => {
        setVisible(false);
        await AsyncStorage.setItem(userPreferences.CHANGELOG_VERSION, APP.currentVersion);
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={[ui.h3, { color: "#000" }]}>🆕 {language.t("_updatesModalNews")}</Text>
                    <Text style={[ui.text, { color: "#000" }]}>• {language.t("_updatesModalV1_1")}</Text>
                    <Text style={[ui.text, { color: "#000" }]}>• {language.t("_updatesModalV1_2")}</Text>
                    <Text style={[ui.text, { color: "#000" }]}>• {language.t("_updatesModalV1_3")}</Text>
                    <Text style={[ui.text, { color: "#000" }]}>• {language.t("_updatesModalV1_4")}</Text>
                    <Button text={"Cerrar"} onClick={closeModal} />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 8,
        width: '80%',
        gap: 16
    },
});
