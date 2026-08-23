const CLOUDINARY_IMAGE_BASE_URL = 'https://res.cloudinary.com/dvuvk6yrw/image/upload';

const PATTERN_PUBLIC_IDS = {
    'bebe-chico': [
        'patron_carnt3',
        'patron-3_c7fewl',
        'patron-4_fbedmy',
    ],
    'bebe-chica': [
        'patron_auqrto',
        'patron-2_yptuue',
        'patron-3_ygnmlv',
        'patron-4_lmmhfy',
    ],
    'bebe-recien-nacido': [
        'patron_rrdzsl',
        'patron-2_gvwti7',
        'patron-3_cdb24w',
        'patron-4_mgkano',
        'patron-5_s7ydut',
    ],
    'conjuntos-naturaleza': [
        'patron_k1kewu',
        'patron-2_l0yfeb',
        'patron-3_olei0a',
        'patron-4_axqwoe',
    ],
    'modernos-noche-estrellada': [
        'patron_ufn66y',
        'patron-2_gxwspd',
        'patron-3_uyj3c2',
        'patron-4_kiadul',
    ],
    'marcapaginas-floral': [
        'patron_rylx7t',
        'patron-2_li287d',
        'patron-3_dfzbou',
    ],
};

export function getPatternImages(patternSlug) {
    const publicIds = PATTERN_PUBLIC_IDS[patternSlug];
    return publicIds?.map(publicId => `${CLOUDINARY_IMAGE_BASE_URL}/${publicId}`) || [];
}

export function getPatternCover(patternSlug) {
    return getPatternImages(patternSlug)[0] || null;
}

export function getPatternStepCount(patternSlug) {
    return PATTERN_PUBLIC_IDS[patternSlug]?.length || 0;
}
