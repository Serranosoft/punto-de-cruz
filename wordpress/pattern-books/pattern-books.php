<?php
/**
 * Plugin Name: Libros de patrones
 * Description: Libros de punto de cruz con imágenes ordenadas, PDF y catálogo público para la app.
 * Version: 1.1.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Text Domain: pattern-books
 */

defined('ABSPATH') || exit;

function pdcr_books_register() {
    register_post_type('pdcr_book', array(
        'labels' => array(
            'name' => 'Libros de patrones', 'singular_name' => 'Libro de patrones',
            'add_new_item' => 'Añadir libro de patrones', 'edit_item' => 'Editar libro de patrones',
            'all_items' => 'Todos los libros', 'menu_name' => 'Libros de patrones',
        ),
        'public' => true, 'show_in_rest' => true, 'rest_base' => 'pattern-books',
        'menu_icon' => 'dashicons-book-alt', 'menu_position' => 26,
        'supports' => array('title', 'thumbnail', 'page-attributes', 'custom-fields'),
        'rewrite' => array('slug' => 'libros-de-patrones'), 'has_archive' => true,
        'capability_type' => 'post', 'map_meta_cap' => true,
    ));
    $auth = function ($allowed, $key, $post_id) { return current_user_can('edit_post', $post_id); };
    foreach (array('pdcr_import_id', 'pdcr_source_url') as $key) {
        register_post_meta('pdcr_book', $key, array(
            'single' => true, 'type' => 'string', 'show_in_rest' => true,
            'sanitize_callback' => $key === 'pdcr_source_url' ? 'esc_url_raw' : 'sanitize_text_field',
            'auth_callback' => $auth,
        ));
    }
    register_post_meta('pdcr_book', 'pdcr_pdf_id', array(
        'single' => true, 'type' => 'integer', 'show_in_rest' => true,
        'sanitize_callback' => 'absint', 'auth_callback' => $auth,
    ));
    register_post_meta('pdcr_book', 'pdcr_image_ids', array(
        'single' => true, 'type' => 'array', 'default' => array(),
        'show_in_rest' => array('schema' => array('type' => 'array', 'items' => array('type' => 'integer'))),
        'sanitize_callback' => function ($ids) { return array_values(array_filter(array_map('absint', (array) $ids))); },
        'auth_callback' => $auth,
    ));
}
add_action('init', 'pdcr_books_register');

register_activation_hook(__FILE__, function () { pdcr_books_register(); flush_rewrite_rules(); });
register_deactivation_hook(__FILE__, 'flush_rewrite_rules');

function pdcr_book_catalog_entry($post) {
    $images = array();
    $ids = (array) get_post_meta($post->ID, 'pdcr_image_ids', true);
    foreach ($ids as $id) {
        $id = absint($id);
        if (!wp_attachment_is_image($id)) continue;
        $url = wp_get_original_image_url($id);
        $file = wp_get_original_image_path($id);
        $size = $file && is_file($file) ? wp_getimagesize($file) : false;
        if (!$size || !$url) continue;
        $images[] = array('id' => $id, 'order' => count($images) + 1, 'url' => $url, 'width' => $size[0], 'height' => $size[1]);
    }
    $pdf_id = absint(get_post_meta($post->ID, 'pdcr_pdf_id', true));
    $pdf_url = get_post_mime_type($pdf_id) === 'application/pdf' ? wp_get_attachment_url($pdf_id) : false;
    if (!$images || !$pdf_url) return null;
    $cover = wp_get_attachment_image_url(get_post_thumbnail_id($post->ID) ?: $images[0]['id'], 'medium_large');
    return array(
        'id' => (string) $post->ID,
        'importId' => get_post_meta($post->ID, 'pdcr_import_id', true),
        'title' => get_the_title($post),
        'sourceUrl' => get_post_meta($post->ID, 'pdcr_source_url', true),
        'wordpressUrl' => get_permalink($post), 'pdfUrl' => $pdf_url,
        'coverUrl' => $cover ?: $images[0]['url'],
        'pageCount' => count($images), 'images' => $images,
    );
}

add_action('rest_api_init', function () {
    register_rest_route('pattern-books/v1', '/books', array(
        'methods' => WP_REST_Server::READABLE,
        'permission_callback' => '__return_true',
        'callback' => function () {
            $posts = get_posts(array('post_type' => 'pdcr_book', 'post_status' => 'publish', 'numberposts' => -1, 'orderby' => array('menu_order' => 'ASC', 'ID' => 'ASC')));
            $books = array_values(array_filter(array_map('pdcr_book_catalog_entry', $posts)));
            return rest_ensure_response(array('books' => $books));
        },
    ));
});

// Reject invalid relationships before REST mutations. Drafts may be incomplete;
// published books must have a PDF and an ordered set of image attachments.
add_filter('rest_pre_insert_pdcr_book', function ($prepared, $request) {
    $meta = (array) $request->get_param('meta');
    $post_id = absint($request->get_param('id'));
    $ids = array_key_exists('pdcr_image_ids', $meta) ? $meta['pdcr_image_ids'] : (get_post_meta($post_id, 'pdcr_image_ids', true) ?: array());
    $pdf_id = array_key_exists('pdcr_pdf_id', $meta) ? absint($meta['pdcr_pdf_id']) : absint(get_post_meta($post_id, 'pdcr_pdf_id', true));
    foreach ((array) $ids as $id) {
        if (!wp_attachment_is_image(absint($id))) return new WP_Error('invalid_book_image', 'Una página no es una imagen válida.', array('status' => 400));
    }
    if ($pdf_id && get_post_mime_type($pdf_id) !== 'application/pdf') return new WP_Error('invalid_book_pdf', 'El archivo seleccionado no es un PDF.', array('status' => 400));
    $status = isset($prepared->post_status) ? $prepared->post_status : get_post_status($post_id);
    if ($status === 'publish' && (!$ids || !$pdf_id)) return new WP_Error('incomplete_book', 'Añade las imágenes y el PDF antes de publicar.', array('status' => 400));
    return $prepared;
}, 10, 2);

add_filter('the_content', function ($content) {
    if (get_post_type() !== 'pdcr_book' || !in_the_loop() || !is_main_query()) return $content;
    $book = pdcr_book_catalog_entry(get_post());
    if (!$book) return $content;
    $html = '<p><a href="' . esc_url($book['pdfUrl']) . '" download>Descargar ' . esc_html($book['title']) . ' en PDF</a></p>';
    foreach ($book['images'] as $image) {
        $html .= '<figure><a href="' . esc_url($image['url']) . '"><img loading="lazy" src="' . esc_url($image['url']) . '" alt="Página ' . absint($image['order']) . '" width="' . absint($image['width']) . '" height="' . absint($image['height']) . '" style="max-width:100%;height:auto"></a><figcaption>Página ' . absint($image['order']) . '</figcaption></figure>';
    }
    return $html;
});

add_action('add_meta_boxes_pdcr_book', function () {
    add_meta_box('pdcr_book_files', 'Páginas y PDF del libro', 'pdcr_book_metabox', 'pdcr_book', 'normal', 'high');
});

function pdcr_book_metabox($post) {
    wp_nonce_field('pdcr_save_book', 'pdcr_book_nonce');
    $ids = array_values((array) get_post_meta($post->ID, 'pdcr_image_ids', true));
    $pdf_id = absint(get_post_meta($post->ID, 'pdcr_pdf_id', true));
    echo '<p>Arrastra las páginas para cambiar su orden. El PDF se selecciona por separado.</p><ol id="pdcr-pages">';
    foreach ($ids as $id) {
        if (!$id) continue;
        echo '<li data-id="' . absint($id) . '">' . wp_get_attachment_image($id, 'thumbnail') . '<button type="button" class="button pdcr-remove">Quitar página</button></li>';
    }
    echo '</ol><input type="hidden" id="pdcr_image_ids" name="pdcr_image_ids" value="' . esc_attr(implode(',', array_filter($ids))) . '">';
    echo '<p><button type="button" id="pdcr-add-pages" class="button">Añadir imágenes</button></p>';
    echo '<p><input type="hidden" id="pdcr_pdf_id" name="pdcr_pdf_id" value="' . $pdf_id . '"><button type="button" id="pdcr-select-pdf" class="button">Seleccionar PDF</button> <span id="pdcr-pdf-name">' . esc_html($pdf_id ? get_the_title($pdf_id) : 'Sin PDF') . '</span></p>';
    echo '<p><label for="pdcr_source_url">Publicación original</label><br><input type="url" class="widefat" id="pdcr_source_url" name="pdcr_source_url" value="' . esc_attr(get_post_meta($post->ID, 'pdcr_source_url', true)) . '"></p>';
}

add_action('admin_enqueue_scripts', function () {
    $screen = get_current_screen();
    if (!$screen || $screen->post_type !== 'pdcr_book') return;
    wp_enqueue_media();
    wp_enqueue_script('pdcr-books-admin', plugins_url('admin.js', __FILE__), array('jquery', 'jquery-ui-sortable'), '1.0.0', true);
    wp_enqueue_style('pdcr-books-admin', plugins_url('admin.css', __FILE__), array(), '1.0.0');
});

add_action('save_post_pdcr_book', function ($post_id) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!isset($_POST['pdcr_book_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['pdcr_book_nonce'])), 'pdcr_save_book')) return;
    if (!current_user_can('edit_post', $post_id)) return;
    $ids = isset($_POST['pdcr_image_ids']) ? explode(',', sanitize_text_field(wp_unslash($_POST['pdcr_image_ids']))) : array();
    $ids = array_values(array_filter(array_map('absint', $ids), 'wp_attachment_is_image'));
    update_post_meta($post_id, 'pdcr_image_ids', $ids);
    $pdf_id = isset($_POST['pdcr_pdf_id']) ? absint($_POST['pdcr_pdf_id']) : 0;
    if ($pdf_id && get_post_mime_type($pdf_id) === 'application/pdf') update_post_meta($post_id, 'pdcr_pdf_id', $pdf_id);
    if (isset($_POST['pdcr_source_url'])) update_post_meta($post_id, 'pdcr_source_url', esc_url_raw(wp_unslash($_POST['pdcr_source_url'])));
    if ($ids) set_post_thumbnail($post_id, $ids[0]);
});

add_filter('manage_pdcr_book_posts_columns', function ($columns) {
    return array('cb' => $columns['cb'], 'title' => 'Libro', 'pdcr_order' => 'Orden', 'pdcr_pages' => 'Páginas', 'pdcr_pdf' => 'PDF', 'date' => 'Fecha');
});
add_action('manage_pdcr_book_posts_custom_column', function ($column, $post_id) {
    if ($column === 'pdcr_order') echo absint(get_post_field('menu_order', $post_id));
    if ($column === 'pdcr_pages') echo count(array_filter((array) get_post_meta($post_id, 'pdcr_image_ids', true)));
    if ($column === 'pdcr_pdf') {
        $url = wp_get_attachment_url(absint(get_post_meta($post_id, 'pdcr_pdf_id', true)));
        if ($url) echo '<a href="' . esc_url($url) . '">Ver PDF</a>';
    }
}, 10, 2);
add_action('pre_get_posts', function ($query) {
    if (is_admin() && $query->is_main_query() && $query->get('post_type') === 'pdcr_book' && !$query->get('orderby')) {
        $query->set('orderby', array('menu_order' => 'ASC', 'ID' => 'ASC'));
    }
});
