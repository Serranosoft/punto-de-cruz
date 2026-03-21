# Fase 3: Pestaña Herramientas (Calculadora y Conversor)

## Objetivo
Centralizar herramientas técnicas imprescindibles para que la app pase de ser "una galería de fotos" a una **herramienta utilitaria integral**. Esto incluye calculadoras de cortes de tela y un renovado sistema de conversión imagen -> patrón.

## 1. Diseño y UX/UI
*   **Interfaz de Utilidad:** Dividir visualmente la sección en "Tarjetas de Herramientas".
*   **Herramienta 1: Calculadora de Tela (Nueva)**
    *   Formulario elegante:
        *   Input 1: Ancho en cruces (ej. 100).
        *   Input 2: Alto en cruces (ej. 120).
        *   Select/Dropdown: Count de la tela (Aida 14, 16, 18, 28, etc.).
        *   Slider/Input opcional: Margen adicional deseado de tela (para el enmarcado, ej. 5cm por lado).
    *   El resultado debe calcularse en vivo (Reactively) bajo el formulario. Mostrará: "Necesitas un trozo de tela de X cm x Y cm".
*   **Herramienta 2: Conversor Avanzado (Mejora del Actual)**
    *   Actualmente corre en un WebView con comportamientos de UX dudosos en carga.
    *   Proveer un proceso *Paso a Paso* guiado.
    *   Paso 1: Selector de Imagen (Nativo usando `expo-image-picker`).
    *   Paso 2: WebView invisible o visor mejorado que procese la imagen sin que el usuario sufra la inestabilidad de la web incrustada.
    *   Se requiere rediseñar los botones (Ver imagen, Descargar Colores) para que sean nativos y más fluidos.
*   **Teclados apropiados:** En el caso de la calculadora, invocar siempre el teclado numérico (`keyboardType="numeric"`) en iOS y Android.

## 2. Detalles Técnicos de Implementación
*   **Formulas de bordado:** Convertir cruces a centímetros. `(Cruces / Tela Count) * 2.54 = Centímetros`. Sumar a esto `(márgenes * 2)`.
*   **Refactor del Conversor:** 
    *   Mover el componente actual `app/converter.js` a esta pestaña.
    *   Optimizar el puente (postMessage). Manejar la inyección de la URL de la imagen (del `expo-image-picker` nativo en base64 o URL subida a un AWS/Cloudinary temporal, dependiendo de cómo lo procese Vercel) para que el paso entre App -> WebView sea invisible.
    *   O bien, migrar la lógica JavaScript del transformador de imágenes (canvas logic) directamente a un módulo nativo local sin depender de carga remota (sería el "Sacro Grial" a largo plazo).

## 3. Próximos Pasos (Tareas Desarrollador)
- [ ] Definir UI/UX general de Listado de Herramientas frente a acceder a cada una.
- [ ] Programar un componente limpio de inputs para la calculadora y atar el cálculo derivado a un hook (`useMemo`).
- [ ] Diagnosticar los fallos del servidor/WebView de Vercel (converter) y encapsular las llamadas dentro de vistas nativas simulando un flujo "mágico" al usuario.
- [ ] Solicitar permisos de almacenamiento con explicaciones amistosas (como requiere la App Store Guideline 5.1.1 tratada previamente) antes del guardado de PDFs creados.
