# Fase 0: Nueva Estructura de Navegación (Bottom Tabs)

## Objetivo
Transformar la navegación principal de la aplicación de un modelo stack/pantalla única a una estructura basada en **Bottom Tabs**. Esto mejorará drásticamente la UX al permitir un acceso rápido a las 5 secciones core descritas en el roadmap.

## 1. Diseño y UX/UI
*   **Aesthetic & Feel:** Diseño moderno, tipo "glassmorphism" o barra sólida inferior con bordes redondeados (border-radius superior), creando un efecto de "floculante" o elevación sutil mediante sombras (elevation en Android, shadowObject en iOS).
*   **Iconografía:** Uso de iconos claros y minimalistas (ej: Phosphor Icons o Feather).
    *   🏠 **Inicio:** Icono de casa.
    *   🔍 **Explorar:** Icono de lupa o compás.
    *   🛠️ **Herramientas:** Icono de regla/tijeras/bastidor.
    *   🧵 **Alijo:** Icono de ovillo de hilo o caja.
    *   👤 **Perfil:** Icono de usuario.
*   **Feedback Visual:** Al seleccionar una pestaña, el icono debe rellenarse de color activo (ej. `#ff9a5b` que usa actualmente la app) o debe haber una micro-animación mediante `react-native-reanimated` (ej: un pequeño efecto de rebote 'spring').
*   **Accesibilidad (a11y):** Cada pestaña debe tener un `accessibilityLabel` claro (ej. "Ir a Inicio", "Ir a Perfil") y un `accessibilityRole="tab"`. El área táctil mínima debe ser de **48x48 dp** previniendo toques accidentales.

## 2. Detalles Técnicos de Implementación
*   **Expo Router:** Se refactorizará el sistema de archivos actual dentro de `/app`.
    *   Se creará una carpeta `(tabs)` o similar para agrupar estas vistas.
    *   El `_layout.js` principal definirá el `<Tabs>` en lugar de un simple `<Stack>`.
    *   Las subrutas (ej: el visor de patrón `app/item.js` o el `app/converter.js` de la cámara) se mantendrán como pantallas Stack que irán "por encima" del Bottom Tab (modals o sub-stacks).
*   **Manejo de Estado (Global):** Mantener el estado de qué proyecto está activo en "Mi Bastidor" para que, independientemente por qué pestaña navegue el usuario, el progreso sea consistente.
*   **Animaciones:** Mantener a 60fps usando el hilo UI (`useAnimatedStyle`).

## 3. Próximos Pasos (Tareas Desarrollador)
- [ ] Mover las pantallas actuales a la estructura de Tabs o como subrutas escondiendo la barra inferior.
- [ ] Integrar los 5 componentes base (vacíos inicialmente o apuntando a vistas "Coming Soon", excepto Inicio y Herramientas que ya existen parcialmente).
- [ ] Configurar los estilos personalizados del TabBar (colores fondo, color inactivo/activo, ocultarlo al escribir con teclado mediante `tabBarHideOnKeyboard: true`).
