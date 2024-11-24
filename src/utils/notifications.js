import * as Notifications from "expo-notifications";

// Función para programar una notificación que se lance en los siguientes 10 segundos
export async function testNotification() {
    try {
        // Obtener la lista de notificaciones programadas
        const notificacionesProgramadas = await Notifications.getAllScheduledNotificationsAsync();

        const existeNotificacionProgramada = notificacionesProgramadas.some((notificacion) => {
            return notificacion.identifier === 'notificacion-5-sec';
        });

        // Si ya hay una notificación programada, no hagas nada
        if (existeNotificacionProgramada) {
            console.log('Ya hay una notificación programada para los proximos 10 segundos');
            return;
        }

        const notificacion = {
            identifier: "notificacion-5-sec",
            content: {
                title: '¿Has practicado hoy crochet?',
                body: '¡Empieza a elaborar los puntos mas comunes!',
            },
            trigger: {
                seconds: 5, // La hora a la que se lanzará la notificación
            },
        };

        // Programa la notificación
        await Notifications.scheduleNotificationAsync(notificacion);

        console.log('Notificación programada para dentro de 5 segundos.');
    } catch (error) {
        console.error('Error al programar la notificación:', error);
    }
};

export async function scheduleWeeklyNotification() {
    try {

        // Obtener la lista de notificaciones programadas
        const notificacionesProgramadas = await Notifications.getAllScheduledNotificationsAsync();

        const existeNotificacionProgramada = notificacionesProgramadas.some((notificacion) => {
            return notificacion.identifier === 'notificacion-semanal-miercoles';
        });

        // Si ya hay una notificación programada, no hagas nada
        if (existeNotificacionProgramada) {
            console.log('Ya hay una notificación programada para la próxima semana.');
            return;
        }

        const notificacion = {
            identifier: 'notificacion-semanal-miercoles',
            content: {
                title: '¿Has practicado hoy crochet?',
                body: '¡Empieza a elaborar los puntos mas comunes!',
            },
            trigger: {
                seconds: getLeftTimeToNextSaturday(),
                repeats: 'week',
            },
        };

        // Programa la notificación
        await Notifications.scheduleNotificationAsync(notificacion);

        console.log('Notificación programada para el próximo miercoles a las 16:00');
    } catch (error) {
        console.error('Error al programar la notificación:', error);
    }
};

export function getLeftTimeToNextSaturday() {
    const today = new Date();
    const currentDay = today.getDay();

    const daysUntilWednesday = 3 - currentDay;
    const nextWednesday = new Date(today);
    nextWednesday.setDate(today.getDate() + daysUntilWednesday);
    nextWednesday.setHours(16, 0, 0, 0);
    
    if (today > nextWednesday) {
        nextWednesday.setDate(nextWednesday.getDate() + 7); // Añade 7 días para el próximo miercoles
    }

    // Calcula la diferencia en segundos entre la fecha actual y el próximo miercoles a las 16:00
    const diff = Math.floor((nextWednesday - today) / 1000);

    return diff;
}


export async function getNotificationInfo() {
    const info = await Notifications.getAllScheduledNotificationsAsync();
}

export async function removeAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}