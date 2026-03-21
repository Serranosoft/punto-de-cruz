# Fase 4: Pestaña Inventario (El Alijo del Bordador)

## Objetivo
Resolver un gran de dolor en los aficionados al punto de cruz: la gestión de suministros. Permitirá a los usuarios guardar la cantidad y tipo de hilos (DMC, Anchor) que poseen, además de subir/crear y organizar sus PDF de patrones externos o creados.

## 1. Diseño y UX/UI
*   **Gestión de Hilos (Inventory Tool):**
    *   Una lista con buscador donde puedes teclear un código DMC (ej: "310" negro).
    *   Añadir/Restar unidades de madejas poseídas o longitudes.
    *   El código visual de la lista debe mostrar el color real (un pequeño cuadro relleno del HEX correspondiente al estándar DMC).
*   **Lista de la Compra:**
    *   Si voy a empezar un patrón que requiere DMC 310 y 666 pero me falta el 666 en inventario, un botón automático debería agregar el 666 a una "Shopping List". Esta Lista tendrá funcionalidad de checkbox tipo To-Do list al ir a mercerías.
*   **Sección Patrones Creados / Importados:**
    *   Permitir almacenar patrones propios.
    *   Punto de acceso para "Crear manual" / "Subir PDF".
    *   Visualmente usar tarjetas similares a "Explorar" pero etiquetadas como *Personales*.

## 2. Detalles Técnicos de Implementación
*   **Bases de Datos Locales:** Para este Alijo, `AsyncStorage` puede quedarse lento si la BD de hilos es grande o el usuario guarda cientos de registros.
    *   Integrar **`expo-sqlite`** (SQLite local) garantizando una arquitectura robusta o al menos un wrapper serializado rápido.
*   **Tabla de equivalencias:** Proveer un JSON pre-cargado estático que relacione los 'Códigos DMC' -> 'Nombres' -> 'Código Hexadecimal'. Esto es clave para que los colores se rendericen bien.
*   **Lector de PDFs:** 
    *   El usuario subirá un PDF propio de la web (o de Etsy). Usando `expo-document-picker` obtener el archivo en local.
    *   Integración robusta de visor de PDFs (recordar los crasheos anteriores con los re-renders por hook de Gestos al incrustar el visor). Manejar un canvas para gestos de Pan/Pinch en PDFs importados.

## 3. Próximos Pasos (Tareas Desarrollador)
- [ ] Configurar base de datos (SQLite / AsyncStorage + Context) pre-cargada con los colores base DMC (>400 matices de colores disponibles públicamente).
- [ ] Desarrollar la vista de Búsqueda de Hilos y los stepper (+ / -) para inventario.
- [ ] Desarrollar componente "Shopping List" para checklist rápido.
- [ ] Explorar y conectar un visualizador nativo seguro de archivos PDF / Documentos, lidiando con FileSystem (`expo-file-system`) base64 encoding o uri temporal de lectura en caché.
