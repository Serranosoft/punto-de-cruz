import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ui } from '../../utils/styles';
import Button from '../../components/button';

export default function PdfDownload({ language, onDownload }) {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.iconCircle}>
                    <Feather name="award" size={50} color="#c44601" />
                </View>
                
                <View style={styles.textContainer}>
                    <Text style={[ui.h3, ui.center, styles.title]}>
                        {language.t("_itemPdfSuccessTitle")}
                    </Text>
                    <Text style={[ui.muted, ui.center, styles.subtitle]}>
                        {language.t("_itemPdfSuccessSubtitle")}
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.actionContainer}>
                    <Text style={[ui.text, ui.center, styles.actionText]}>
                        {language.t("_itemPdfTitle")}
                    </Text>
                    <Button 
                        icon={<Feather name="download" size={20} color="#fff" />}
                        text={language.t("_itemPdfButton")}
                        onClick={onDownload}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    card: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fff5f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#ffece0',
    },
    textContainer: {
        gap: 8,
        marginBottom: 24,
    },
    title: {
        color: '#2d3436',
    },
    subtitle: {
        fontSize: 14,
        lineHeight: 20,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#f0f0f0',
        marginBottom: 24,
    },
    actionContainer: {
        width: '100%',
        gap: 16,
    },
    actionText: {
        fontSize: 16,
        color: '#636e72',
    }
});
