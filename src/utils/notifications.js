import * as Notifications from "expo-notifications";
import { userPreferences } from "./user-preferences";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WEEKLY_NOTIFICATION_ID = "notificacion";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

export async function getWeeklyNotificationEnabled() {
    const [savedPreference, permission] = await Promise.all([
        AsyncStorage.getItem(userPreferences.NOTIFICATION_PERMISSION),
        Notifications.getPermissionsAsync(),
    ]);
    const enabled = savedPreference === "true" && permission.granted;

    if (savedPreference === "true" && !permission.granted) {
        await AsyncStorage.setItem(userPreferences.NOTIFICATION_PERMISSION, "false");
    }

    return enabled;
}

export async function enableWeeklyNotification(language) {
    const currentPermission = await Notifications.getPermissionsAsync();

    if (!currentPermission.granted && currentPermission.canAskAgain === false) {
        return { enabled: false, shouldOpenSettings: true };
    }

    const permission = currentPermission.granted
        ? currentPermission
        : await Notifications.requestPermissionsAsync();

    if (!permission.granted) {
        await AsyncStorage.setItem(userPreferences.NOTIFICATION_PERMISSION, "false");
        return { enabled: false, shouldOpenSettings: false };
    }

    await AsyncStorage.setItem(userPreferences.NOTIFICATION_PERMISSION, "true");
    await scheduleWeeklyNotification(language);
    return { enabled: true, shouldOpenSettings: false };
}

export async function disableWeeklyNotification() {
    await AsyncStorage.setItem(userPreferences.NOTIFICATION_PERMISSION, "false");
    await Notifications.cancelScheduledNotificationAsync(WEEKLY_NOTIFICATION_ID).catch(() => {});
}

export async function scheduleWeeklyNotification(language) {
    try {

        const granted = await AsyncStorage.getItem(userPreferences.NOTIFICATION_PERMISSION);
        if (granted !== "true") {
            return;
        }

        if (!language?.t) {
            console.error('notifications.js: language object or .t method is missing');
            return;
        }

        // Recreate it so a language change also updates the notification copy.
        await Notifications.cancelScheduledNotificationAsync(WEEKLY_NOTIFICATION_ID).catch(() => {});

        const notification = {
            identifier: WEEKLY_NOTIFICATION_ID,
            content: {
                title: language.t("_notificationsTitle"),
                body: language.t("_notificationsBody"),
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                weekday: 4,
                hour: 12,
                minute: 0,
            },
        };

        // Programa la notificación
        await Notifications.scheduleNotificationAsync(notification);
    } catch (error) {
        console.error('Error al programar la notificación:', error);
    }
}
