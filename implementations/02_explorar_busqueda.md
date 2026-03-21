# Fase 2: Pestaña Explorar (Catálogo y Búsqueda)

## Objetivo
Proporcionar un motor de búsqueda potente y visual donde los usuarios puedan descubrir patrones entre todas las categorías, ordenar por dificultad, temática y tamaño. Esta será la librería integral de diseños.

## 1. Diseño y UX/UI
*   **Barra de Búsqueda:** Superior, siempre visible con efecto sticky. Placeholder "Buscar patrones, animales, navidad...".
*   **Filtros Rápidos (Pills):** Debajo de la búsqueda, una fila de botones tipo "Pill" (cápsula) horizontales para filtrar rápidamente: `[Todas] [Animales] [Fácil] [Navidad] [Grandes]`.
*   **Grid de Visualización:**
    *   Layout tipo mosaico (Masonry) o una cuadrícula (2 columnas) con separaciones adecuadas (min 16dp).
    *   **Card UI:** Imagen destacada optimizada, título abajo y una pequeña insignia (badge) indicando la dificultad (verde=sencillo, rojo=experto) y la cantidad de colores aproximada.
*   **Empty States y Skeleton:** 
    *   Si no hay resultados, mostrar una ilustración lottie descriptiva ("No encontramos ese patrón") con un CTA "Ver Categorías".
    *   Mientras cargan los fetch a Cloudinary, mostrar "Skeleton loaders" en vez de secos Spinners giratorios.

## 2. Detalles Técnicos de Implementación
*   **Rendimiento (Core Native Principle):** 
    *   Al no existir grandes listas masivas, una correcta implementación de `FlatList` memoizada será totalmente suficiente para el listado general evitando complicaciones externas.
    *   Manejo correcto de imágenes usando `expo-image` con preajuste en baja resolución `blurhash` mientras descarga.
*   **Lógica de Buscador:** El filtrado inicial puede ser *Client-side* puesto que todo el inventario JSON cabrá en memoria fácilmente. Crear una función de debounce para la barra de búsqueda que no filtre en cada pulsación, sino 300ms después de que el usuario pare de escribir.
*   **Enlazado Profundo (Routing):** El click en una Card redirigirá al componente actual `app/item.js` pasando `category`, `subcategory`, y `steps` como `useLocalSearchParams()`.

## 3. Próximos Pasos (Tareas Desarrollador)
- [ ] Refactorizar el acceso al JSON de `data.js` para extraer una lista aplanada global de todos los patrones si no existe un endpoint maestro en Cloudinary.
- [ ] Desarrollar `SearchInput` con gestión de auto-enfoque y botones para limpiar texto.
- [ ] Implementar `FlatList` con optimizaciones de memoizado para la vista de rejilla bidimensional.
- [ ] Conectar la navegación a la vista `item` detallada manteniendo animaciones de paso a paso.
