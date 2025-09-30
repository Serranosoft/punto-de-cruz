import * as Notifications from "expo-notifications";

export async function scheduleWeeklyNotification(language) {
    try {

        // Obtener la lista de notificaciones programadas
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

        const exists = scheduledNotifications.some((notificacion) => {
            return notificacion.identifier === 'notificacion-semanal-miercoles';
        });

        // Si ya hay una notificación programada, no hagas nada
        if (exists) {
            console.log('Ya hay una notificación programada para la próxima semana.');
            return;
        }

        console.log(language)
        const notification = {
            identifier: "notificacion-semanal-miercoles",
            content: {
                title: language.t("_notificationTitle"),
                body: language.t("_notificationBody"),
            },
            trigger: {
                seconds: getLeftTimeToNextWednesday(),
                repeats: true,
            },
        };

        // Programa la notificación
        await Notifications.scheduleNotificationAsync(notification);
    } catch (error) {
        console.error('Error al programar la notificación:', error);
    }
};

export function getLeftTimeToNextWednesday() {
    const today = new Date();
    const currentDay = today.getDay();

    const daysUntilWednesday = 3 - currentDay;
    const nextWednesday = new Date(today);
    nextWednesday.setDate(today.getDate() + daysUntilWednesday);
    nextWednesday.setHours(16, 0, 0, 0);
    
    if (today > nextWednesday) {
        nextWednesday.setDate(nextWednesday.getDate() + 7);
    }

    const diff = Math.floor((nextWednesday - today) / 1000);
    return diff;
}