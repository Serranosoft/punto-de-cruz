# Fase 5: Pestaña Perfil (Logros y Ajustes)

## Objetivo
Fomentar la retención de usuarios mediante la gamificación, visualizar un resumen de vida útil en la aplicación, y presentar de forma clara los ajustes y traducciones del sistema.

## 1. Diseño y UX/UI
*   **Cabecera de Perfil:** Avatar ilustrativo (se podría permitir elegir entre avatares tipo mascota de lanas/bastidores para no hacer sign in real), "Nivel del Bordador" (ej. "Principiante", "Maestro Costurero"), y un indicador de progreso de experiencia general al estilizado RPG.
*   **Vitrina de Logros:**
    *   Una grilla de medallas circulares bloqueadas en escala de grises.
    *   Al desbloquearse, revelan animaciones Lottie de medallas ganadas.
    *   Posibles logros a crear (Top 10):
        1. **Primera Puntada:** Completar tu primer paso en cualquier patrón de la app.
        2. **Coleccionista:** Añade más de 20 madejas distintas al alijo de hilos.
        3. **Noctámbulo:** Abrir un patrón pasadas las 10 de la noche.
        4. **Constancia:** Acceder a la app 7 días consecutivos (Daily streak).
        5. **Comprador Compulsivo:** Genera una lista de la compra de más de 10 colores.
        6. **Hacedor de Patrones:** Transforma una foto usando el Conversor.
        7. **Perfeccionista:** Guarda tu primer patrón PDF personalizado importado de fuera.
        8. **El Circo Máximo:** Ver en modo guía todos los patrones de la categoría "Bebé - Circo".
        9. **Artista de Gato:** Completa (terminar los pasos) el patrón del "Gato de Halloween".
        10. **Matemático del Hilo:** Calcula tu primer trozo de tela con la Calculadora Avanzada.
*   **Proyectos Completados:** Un pequeño histórico de aquellos ítems que han llegado a 100% en el visor de pasos "Mi Bastidor". Si llegó al final, se etiqueta.

## 2. Detalles Técnicos de Implementación
*   **Listener de Eventos:** El sistema de logros no puede estar atado únicamente a los componentes UI de esta pestaña. Debería funcionar mediante la emisión/suscripción global de eventos (ej. injectando un Hook Context en toda la app):
    *   Al ejecutar `calcFabric()`, llamar internamente a `logAchievement("calculator_first_use")`.
    *   Un interceptor evalúa si el logro no estaba desbloqueado localmente; si asiente, lanza un 'Toast Notification' de medalla in-app global 🏅.
*   **Configuración actual:** Mover los elementos de UI actuales de `app/settings.js` (cambio de idiomas con localizations y i18n) en una "ZONA DE AJUSTES" debajo de la gamificación en formato menú modal inferior (BottomSheet) o al final del ScrollView.
*   **Accesibilidad (a11y):** Los lectores deben enumerar claramente cuántos logros siguen bloqueados vs desbloqueados. Añadir "Label" y "Hint" a cada medalla para narrar "Maestro Costurero. Medalla adquirida por usar...".

## 3. Próximos Pasos (Tareas Desarrollador)
- [ ] Definir el Schema de usuario global persistente (Preferencias, Logros_Desbloqueados, Proyectos_Terminados).
- [ ] Maquetar la pantalla general del Perfil.
- [ ] Implementar librería Toast in-app no disruptiva pero llamativa en notificaciones y engarzar la lógica global de validación de logros en cada acción relevante.
- [ ] Refactorizar y trasladar la hoja "Settings" originaria a este tab, reduciendo así accesos directos redundantes en stacks.
