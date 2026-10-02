# Libros de patrones

La sección está en **Inicio y Explorar → Revistas y libros de punto de cruz**. Carga un catálogo público
de WordPress con las páginas en orden y un botón **Descargar PDF**.
Las imágenes y PDF de `out` no se incluyen en la aplicación: las imágenes se
cargan por URL y el PDF se guarda en la carpeta de descarga al solicitarlo. La app guarda una
copia del catálogo para poder mostrar los libros conocidos sin conexión.

## Generar la colección

```sh
npm install
npm run scrape:pattern-books
npm run check:pattern-books
```

El script consulta la búsqueda pública de
https://revistasgratisdemanualidades.blogspot.com/ y recorre sus páginas hasta
encontrar diez publicaciones cuyo título o etiquetas coinciden con punto de
cruz. Para cada publicación:

1. Crea `out/<título>/`, adaptando caracteres incompatibles con Windows.
2. Descarga las imágenes del artículo como `1.jpg`, `2.jpg`, etc. (o `.png`
   según el formato real), en el orden del HTML. Utiliza la resolución original
   de Blogger, excluye la miniatura duplicada de la plantilla y omite etiquetas
   `img` vacías que no contienen una imagen.
3. Crea `<título>.pdf` dentro de esa carpeta, con una imagen por página, en el
   mismo orden y sin recortar, deformar ni volver a comprimir los JPEG.
4. Guarda `metadata.json` con la publicación de origen, URLs, dimensiones y
   sumas SHA-256 de las imágenes. `out/catalog.json` registra la colección local.
   El scraping nunca genera referencias estáticas a estos archivos para Metro.

Los títulos repetidos reciben un sufijo derivado de la URL para evitar
sobrescrituras en Windows. Una ejecución posterior reutiliza las imágenes de
los libros completos si coinciden sus URLs y sumas de comprobación. Una
descarga fallida detiene el proceso; no se publica un PDF incompleto ni se
actualiza el catálogo local hasta terminar todos los libros.

Se admiten cuatro descargas simultáneas por libro, con tiempo límite y
reintentos acotados. El comando permite otro límite con `-- --limit N`; la
comprobación de esta entrega exige diez libros.

## Comprobaciones

`npm run check:pattern-books` comprueba las diez carpetas, la numeración,
las sumas de comprobación, los títulos y el número de páginas de cada PDF.
También compara cada JPEG incrustado con el archivo correspondiente, de modo
que verifica directamente el contenido y el orden del PDF. Para los PNG compara
los píxeles y, cuando existe, la transparencia. Se ha revisado el renderizado
de las 353 páginas y completado una exportación de Android con Metro.

Esta primera colección contiene **353 imágenes y 10 PDF**. Los originales y
los PDF ocupan aproximadamente **382 MiB en disco**, fuera del paquete móvil.
La visualización y la exportación móvil necesitan una compilación de Expo con
sus módulos nativos habituales. No se han creado commits.

## WordPress

`wordpress/pattern-books.zip` contiene el plugin de esta colección. Registra la
sección **Libros de patrones** con un icono de libro en el menú de administración.
Cada libro permite ordenar las páginas arrastrándolas, seleccionar su PDF,
editar el enlace de origen y asignar el orden del libro en Atributos de página.
El catálogo público es `/wp-json/pattern-books/v1/books` y la gestión por API
está en `/wp-json/wp/v2/pattern-books`.

La subida utiliza variables de entorno, sin guardar contraseñas en archivos:

```sh
# Configurar WP_URL, WP_USERNAME y WP_APP_PASSWORD en el entorno del terminal.
npm run upload:pattern-books
npm run check:wordpress-pattern-books
```

El script exige el plugin activo antes de subir nada. Crea cada libro en borrador,
sube las imágenes con nombres deterministas y numerados, las vincula al libro,
sube su PDF y publica el registro completo. Guarda un registro reanudable en
`out/wordpress-upload-state.json` y busca por identificadores deterministas para
evitar duplicados. Cada PDF e imagen queda asociado a su libro en Medios, con un
título que incluye el nombre del libro y el número de página.

Al terminar verifica las diez publicaciones y el orden, dimensiones y acceso
público de sus archivos. Solo después configura `src/utils/pattern-books-config.js`
con la URL pública del catálogo. `EXPO_PUBLIC_PATTERN_BOOKS_URL` permite reemplazar
esa URL al compilar; nunca debe contener credenciales. `out/wordpress-catalog.json`
guarda la respuesta verificada. Los archivos y registros de `out` están ignorados
por Git.

La colección inicial se publicó en **https://mollydigital.manu-scholz.com/**:
**10 libros, 353 imágenes y 10 PDF**, agrupados por libro y con las páginas
ordenadas. El plugin ya estaba activo al iniciar la importación. El acceso al
catálogo y a los 363 archivos se ha comprobado sin credenciales, con dimensiones,
longitudes de archivo y tipos MIME coincidentes con los originales.

El catálogo configurado en la app es
`https://mollydigital.manu-scholz.com/wp-json/pattern-books/v1/books`.
La administración está en
`https://mollydigital.manu-scholz.com/wp-admin/edit.php?post_type=pdcr_book`.
Las credenciales de aplicación se usan solo para la API y no se guardan en
código ni en los registros de subida. La exportación Android se ha comprobado
sin imágenes ni PDF de libros dentro del paquete.

Después de verificar los 363 archivos en WordPress, se ha eliminado la carpeta
local `out` a petición del usuario. La app funciona sin ella. Los comandos de
comprobación de archivos locales y de subida requieren volver a generar el archivo local
con `npm run scrape:pattern-books`; no son necesarios para compilar ni usar la app.
`npm run check:wordpress-pattern-books` comprueba la colección remota actual sin
necesitar `out` ni credenciales de WordPress.

## Desbloqueo por libro

La tarjeta de Inicio conserva su diseño, con el naranja primario `#d35400`,
icono de libro y enlace a la colección. La antigua ruta `/vip-patterns` redirige
a la colección: se ha retirado el desbloqueo general VIP.

Cada libro requiere completar su propio anuncio recompensado. Se reutiliza la
unidad configurada `ca-app-pub-3738413299329691/1772975531`, con anuncios de prueba
en desarrollo. Solo el evento nativo `EARNED_REWARD` concede acceso a **las imágenes
y al PDF de ese libro durante 30 días**, contados desde la recompensa. No se
acumulan días ni se desbloquean otros libros. La portada es una vista previa.

La fecha de caducidad se guarda en AsyncStorage por catálogo e identificador de
importación del libro (o ID como alternativa). Persiste al cerrar y reabrir la app
en el mismo dispositivo. Se comprueba al entrar, al volver del segundo plano y
con un temporizador de caducidad. La pantalla de detalle también protege entradas
directas. El PDF comprueba de nuevo el acceso antes de descargar y de guardar.
Un anuncio cerrado antes de la recompensa, errores de anuncios y errores al guardar
mantienen el libro bloqueado. Los eventos de recompensa repetidos se consumen una vez.

El bloqueo se aplica dentro de la app. Los archivos de WordPress siguen siendo
públicos por URL, y un PDF ya exportado no se puede retirar al caducar el acceso.
Reinstalar la app o borrar sus datos elimina los desbloqueos locales.

`npm run check:pattern-book-access` verifica persistencia, independencia de libros,
caducidad exacta, anuncios incompletos/fallidos, eventos repetidos, errores de
almacenamiento, el bloqueo de la pantalla y la caducidad durante una descarga.
La entrega de anuncios y los eventos nativos deben comprobarse en una compilación
instalada en dispositivo; las pruebas automatizadas utilizan eventos simulados.

## Volúmenes y descarga directa

Los cinco libros con más de 25 páginas se han dividido en **13 volúmenes de hasta
25 páginas**, conservando todas las imágenes y su orden. Los otros cinco libros
se mantienen completos. La colección pasa a **18 entradas, 353 imágenes y 18 PDF**.
Cada volumen usa el título original seguido de `- Volumen N`, la misma portada
de su serie y un PDF con únicamente sus páginas. No se repiten imágenes ni se
añade la portada como una página extra en los volúmenes posteriores.

Cada volumen se desbloquea por separado durante 30 días. El volumen 1 mantiene
el identificador del libro original; los posteriores tienen identificadores
propios. La tarjeta de Inicio ya no incluye la badge «Un anuncio por libro».
Se ha retirado el enlace a la publicación original de la app y vaciado ese campo
en los registros publicados de WordPress. Los metadatos del scraping conservan
su origen para administración, sin mostrar un enlace en la app.

En Android, la primera descarga solicita acceso a una carpeta mediante el selector
del sistema. La app recuerda esa carpeta para las siguientes descargas y guarda
el PDF directamente, sin menú de compartir. Si se revoca el permiso, vuelve a
solicitar la carpeta. Cancelar el selector no descarga nada. En iOS se guarda en
`Archivos → En mi iPhone → Punto de Cruz → Libros`; la visibilidad de esa carpeta
requiere una nueva compilación con `UIFileSharingEnabled` y
`LSSupportsOpeningDocumentsInPlace`. En web se descarga mediante un archivo Blob.
Los archivos temporales de descarga se eliminan al terminar o fallar.

La división de la colección se prepara y publica de manera reanudable con:

```sh
npm run split:wordpress-pattern-books -- --prepare
# Con WP_USERNAME y WP_APP_PASSWORD definidos en el entorno:
npm run split:wordpress-pattern-books -- --apply
```

El plan, la copia del catálogo original y el registro de subida se guardan en
`tmp/pattern-book-volumes`, ignorado por Git. La preparación copia páginas del PDF
original sin recomprimir las imágenes y verifica contenido y orden. La revisión
de esta colección también ha comparado píxel a píxel el renderizado de las **258
páginas repartidas entre volúmenes** con sus originales. La publicación verifica
las sumas SHA-256 de todos los PDFs nuevos descargándolos por su URL pública.
Los archivos originales de WordPress se conservan, pero las entradas de la app
apuntan a los PDFs de cada volumen. No se ha creado ningún commit.

## Ampliar las imágenes

Al tocar una página desbloqueada se abre un visor a pantalla completa con la imagen
original, sin reducir su resolución al tamaño de la miniatura. Permite pellizcar
para ampliar hasta 8×, doble toque para alternar el zoom, arrastrar, botones de
ampliar/reducir/restablecer y navegación entre páginas. Solo carga una página en
el visor cada vez y restablece el zoom al cambiar de página. Incluye estados de
carga y error con reintento, controles accesibles y cierre con el botón Atrás de
Android. Utiliza la biblioteca de zoom y gestos ya instalada, con su propia raíz
de gestos dentro del modal. El acceso se comprueba antes de abrir o cambiar de
página; al caducar se cierra el visor y vuelve a mostrarse el bloqueo del libro.
