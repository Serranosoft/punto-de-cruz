# Fase 1: Pestaña Inicio (Dashboard)

## Objetivo
Crear un punto de entrada principal (Dashboard) que actúe como un panel de control personalizado y dinámico, motivando al usuario a continuar bordando y ofreciendo inspiración constante.

## 1. Diseño y UX/UI
*   **Tipografía y Header:** Título de bienvenida grande (ej. "¡Hola, [Nombre]!"), usando familias tipográficas modernas (Poppins ya integrada) e integrando un saludo dependiente de la hora ("Buenos días", "Buenas tardes").
*   **Sección "Mi Bastidor":**
    *   **UI:** Una tarjeta de héroe (Hero Card) en la parte superior. Fondo con una imagen empañada (blur) del patrón en el que se trabaja.
    *   **Info:** Nombre del patrón, barra de progreso atractiva (0-100% basado en el step actual) y un texto sutil "*Última puntada: ayer*".
    *   **Action:** Botón flotante grande de "Continuar" para retomar inmediatamente el proyecto.
*   **Sección "Daily Inspiration":**
    *   **UI:** Scroll horizontal (`ScrollView` con `horizontal` y `showsHorizontalScrollIndicator={false}`) o una cuadrícula de 2x2.
    *   **Contenido:** Mostrar pequeños patrones gratuitos diarios, cambiando cada 24 horas. Para el desarrollador: Puede usarse lógica de fecha (seed math random) con la data actual de Cloudinary para no requerir un backend severo.
*   **Categorías Inteligentes:**
    *   Acceso rápido a colecciones "Para empezar hoy" (Iniciación), "Niveles Intermedios" y "Modo Experto".
*   **Accesibilidad (a11y):** Utilizar contrastes altos para textos superpuestos en imágenes de "Mi Bastidor". Agrupar elementos en lectores de pantalla para que al enfocar "Mi Bastidor" lea la tarjeta completa (título, progreso, y acción).

## 2. Detalles Técnicos de Implementación
*   **Almacenamiento Local (AsyncStorage y Context):** La app ya recoge el "step" de un `item`. Se debe implementar un sistema (ej. `Context API` o `AsyncStorage` vitaminado) para guardar temporalmente un objeto: `{ idPatron, lastStep, totalSteps, dateUpdated }`. Así, el Inicio sabrá qué pintar en "Mi Bastidor".
*   **Rendimiento:** Las imágenes del "Daily Inspiration" deben estar cacheadas utilizando `expo-image` para que la carga inicial de la app apenas sufra latencia (fast launch time).
*   **Gestión de Ads:** Adaptar la ubicación actual de los Adaptive Banners en esta nueva página sin romper el flujo estético. El banner puede estar justo antes de las categorías maestras o fijo debajó.

## 3. Próximos Pasos (Tareas Desarrollador)
- [ ] Definir el contrato de datos para "Mi Bastidor" en AsyncStorage.
- [ ] Crear el componente `<HeroCard />` con Reanimated para la barra de progreso animada al montarse.
- [ ] Mapear del archivo `data.js` un generador aleatorio por días para la sección inspiracional.
- [ ] Maquetar la pantalla general priorizando espacios limpios (WhiteSpace) para agrupar contenido.
