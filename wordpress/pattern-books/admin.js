(function ($) {
    function updateOrder() {
        $('#pdcr_image_ids').val($('#pdcr-pages li').map(function () { return $(this).attr('data-id'); }).get().join(','));
    }
    $(function () {
        $('#pdcr-pages').sortable({ update: updateOrder, cancel: 'button' });
        $('#pdcr-pages').on('click', '.pdcr-remove', function () { $(this).closest('li').remove(); updateOrder(); });
        $('#pdcr-add-pages').on('click', function () {
            var frame = wp.media({ title: 'Añadir páginas al libro', library: { type: 'image' }, button: { text: 'Añadir páginas' }, multiple: true });
            frame.on('select', function () {
                frame.state().get('selection').each(function (attachment) {
                    var image = attachment.toJSON();
                    var src = image.sizes && image.sizes.thumbnail ? image.sizes.thumbnail.url : image.url;
                    var item = $('<li>').attr('data-id', image.id);
                    item.append($('<img>').attr({ src: src, alt: image.title }));
                    item.append($('<button type="button" class="button pdcr-remove">').text('Quitar página'));
                    $('#pdcr-pages').append(item);
                });
                updateOrder();
            });
            frame.open();
        });
        $('#pdcr-select-pdf').on('click', function () {
            var frame = wp.media({ title: 'Seleccionar PDF del libro', library: { type: 'application/pdf' }, button: { text: 'Usar este PDF' }, multiple: false });
            frame.on('select', function () {
                var pdf = frame.state().get('selection').first().toJSON();
                $('#pdcr_pdf_id').val(pdf.id);
                $('#pdcr-pdf-name').text(pdf.title);
            });
            frame.open();
        });
    });
})(jQuery);
