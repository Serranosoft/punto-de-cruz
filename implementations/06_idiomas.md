# Idiomas de la aplicación

El selector dispone de 55 opciones: los 14 idiomas anteriores y 41 idiomas o variantes nuevos. Los catálogos anteriores se conservan. Cada catálogo nuevo contiene las 199 claves de la interfaz (8.159 traducciones nuevas), además de recursos nativos para el nombre de la aplicación y los permisos de iOS.

## Archivos

- `src/utils/supported-languages.js`: lista de idiomas, nombres nativos y resolución de preferencias.
- `src/utils/localizations.js`: importaciones estáticas de los diccionarios para Metro.
- `src/utils/locales/*.json`: traducciones de la interfaz, disponibles sin conexión.
- `languages/*.json` y `app.json`: nombres de aplicación, permisos y declaración de idiomas compatibles en Android/iOS.

## Selección y variantes

Se respeta primero la elección guardada. Si no hay una válida, se recorren los idiomas preferidos del dispositivo; el último recurso es español. La selección utiliza región y escritura, no solo el idioma base. El selector muestra los nombres nativos y el idioma activo se guarda en AsyncStorage.

- Chino: `zh-CN`, `zh-TW`, `zh-HK`; `Hans` se asocia con chino simplificado y `Hant` con tradicional. Hong Kong y Macao usan `zh-HK` salvo que se solicite explícitamente `Hans`.
- Portugués: se conserva `pt` y se añaden `pt-BR` y `pt-PT`, con vocabulario regional.
- Hebreo: código canónico `he-IL`, compatible con las preferencias antiguas `iw` e `iw-IL`.
- Filipino: `fil`, aceptando `tl`; noruego bokmål: `no-NO`, aceptando `nb`.
- Se aceptan también códigos base como `nl`, `mr`, `ml`, `kn`, `ne`, `si`, `my`, `km`, `el`, `cs`, `hu`, `sv`, `no`, `da` y `fi` para sus variantes registradas.

## Traducciones y alcance

Las traducciones nuevas partieron de traducción automática, pero después se realizó una segunda revisión sin API ni traductor externo. Se revisaron las 8.159 cadenas mediante controles estructurales y una auditoría semántica de cada catálogo. Se reescribieron con vocabulario de punto de cruz los términos que el traductor había interpretado fuera de contexto: patrones, hilos y madejas, densidad de la tela, bastidor, pasos, niveles, nombres de logros, ratón como animal y textos del conversor. También se corrigieron cadenas corruptas en jemer, birmano, checo y serbio, y se normalizaron las diferencias regionales. `pt-BR` reutiliza y adapta el portugués existente.

Una revisión profesional por hablantes nativos sigue siendo recomendable antes de publicar en mercados con idiomas de pocos recursos. No hace falta ninguna API de traducción para compilar ni utilizar la aplicación.

Los textos se incluyen en la aplicación; no se consulta ningún servicio de traducción durante su uso. Los nombres de idiomas respetan su dirección de escritura en el selector. No se ha rediseñado toda la navegación para reflejar su disposición en idiomas RTL.

La traducción cubre los textos de este repositorio. Los dibujos y PDF ya publicados y la página externa cargada por el conversor en WebView mantienen sus propios contenidos e idiomas.

## Comprobación

Ejecutar `npm run check:locales` para comprobar cobertura, duplicados, variables de interpolación, textos vacíos o sin traducir, recursos nativos y resolución de etiquetas de idioma. El control también rechaza marcadores de traducción corruptos, espacios accidentales, separadores de progreso inconsistentes y residuos en inglés asociados a errores del traductor externo. Las dos claves ausentes en algunos catálogos antiguos siguen resolviéndose mediante español; no se modifican esos catálogos.

El empaquetado se comprueba con `npx expo export --platform android --output-dir .expo/locale-validation`. La declaración de idiomas y los recursos nativos requieren una nueva compilación para aparecer en los ajustes del sistema. Una exportación de JavaScript no sustituye la revisión visual en un dispositivo, especialmente de fuentes y escrituras RTL.
