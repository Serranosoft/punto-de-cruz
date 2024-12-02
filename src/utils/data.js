
export function content(language) {
    return [
        {
            name: language.t("_dataSencillo"),
            fetch: "Sencillo",
            subcategories: [
                {
                    name: language.t("_dataSencilloMarinero"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Sencillo/Marinero/patron",
                    steps: 6,
                    fetch: "Marinero"
                },
                {
                    name: language.t("_dataSencilloNaveEspacial"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Sencillo/Nave espacial/patron",
                    steps: 4,
                    fetch: "Nave Espacial"
                },
                {
                    name: language.t("_dataSencilloPlanetas"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Sencillo/Planetas/patron",
                    steps: 4,
                    fetch: "Planetas"
                },
                {
                    name: language.t("_dataSencilloTorreEiffel"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Sencillo/Torre Eiffel/patron-5",
                    steps: 5,
                    fetch: "Torre eiffel"
                }
            ]
        },
        {
            name: language.t("_dataModernos"),
            fetch: "Modernos",
            subcategories: [
                {
                    name: language.t("_dataModernosMejoresAmigas"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Modernos/Mejores amigas/patron-62",
                    steps: 4,
                    fetch: "Mejores amigas"
                },
                {
                    name: language.t("_dataModernosEnergiaPositiva"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Modernos/Energia positiva/patron-66",
                    steps: 8,
                    fetch: "Energia positiva"
                },
                {
                    name: language.t("_dataModernosCorazonBff"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Modernos/Corazon bff/patron-74",
                    steps: 8,
                    fetch: "Corazon bff"
                },
                {
                    name: language.t("_dataModernosConfetiDeCorazones"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Modernos/Confeti de corazones/patron",
                    steps: 8,
                    fetch: "Confeti de corazones"
                }
            ]
        },
        {
            name: language.t("_dataPerros"),
            fetch: "Perros",
            subcategories: [
                {
                    name: language.t("_dataPerrosCaniche"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Perros/Caniche/patron-38",
                    steps: 8,
                    fetch: "Caniche"
                },
                {
                    name: language.t("_dataPerrosCarlino"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Perros/Carlino/patron-46",
                    steps: 8,
                    fetch: "Carlino"
                },
                {
                    name: language.t("_dataPerrosDalmata"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Perros/Dalmata/patron-54",
                    steps: 8,
                    fetch: "Dalmata"
                },
            ]
        },
        {
            name: language.t("_dataNavidad"),
            fetch: "Navidad",
            subcategories: [
                {
                    name: language.t("_dataNavidadBolaDeNieve"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Navidad/Bola de nieve/patron-10",
                    steps: 8,
                    fetch: "Bola de nieve"
                },
                {
                    name: language.t("_dataNavidadAdornoDeNavidad"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Navidad/Decoracion de nieve/patron-18",
                    steps: 12,
                    fetch: "Adorno de navidad"
                },
                {
                    name: language.t("_dataNavidadMerryChristmas"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Navidad/Merry christmas/patron-30",
                    steps: 8,
                    fetch: "Merry Christmas"
                },
            ]
        },
        {
            name: language.t("_dataHalloween"),
            fetch: "Halloween",
            subcategories: [
                {
                    name: language.t("_dataHalloweenFantasma"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Halloween/Fantasma/patron",
                    steps: 8,
                    fetch: "Fantasma"
                },
                {
                    name: language.t("_dataHalloweenGatoDeHalloween"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Halloween/Gato de halloween/patron",
                    steps: 8,
                    fetch: "Gato de Halloween"
                },
                {
                    name: language.t("_dataHalloweenGorroDeBruja"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Halloween/Gorro de bruja/patron",
                    steps: 8,
                    fetch: "Gorro de Bruja"
                },
            ]
        },
        {
            name: language.t("_dataFlores"),
            fetch: "Flores",
            subcategories: [
                {
                    name: language.t("_dataFloresRamoRedondo"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Flores/Ramo redondo/patron",
                    steps: 8,
                    fetch: "Ramo redondo"
                },
                {
                    name: language.t("_dataFloresSencillas"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Flores/Sencillas/patron",
                    steps: 8,
                    fetch: "Sencillas"
                },
            ]
        },
        {
            name: language.t("_dataAnimales"),
            fetch: "Animales",
            subcategories: [
                {
                    name: language.t("_dataAnimalesAbeja"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Animales/Abeja/patron-21",
                    steps: 4,
                    fetch: "Abeja"
                },
                {
                    name: language.t("_dataAnimalesPajaro"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Animales/Pajaro/patron",
                    steps: 5,
                    fetch: "Pajaro"
                },
                {
                    name: language.t("_dataAnimalesPanda"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Animales/Panda/patron",
                    steps: 5,
                    fetch: "Panda"
                },
                {
                    name: language.t("_dataAnimalesPerro"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Animales/Perro/patron",
                    steps: 5,
                    fetch: "Perro"
                },
                {
                    name: language.t("_dataAnimalesRaton"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Animales/Raton/patron",
                    steps: 5,
                    fetch: "Raton"
                },
                {
                    name: language.t("_dataAnimalesTiburones"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Animales/Tiburones/patron",
                    steps: 8,
                    fetch: "Tiburones"
                },
            ]
        },
        {
            name: language.t("_dataAbecedario"),
            fetch: "Abecedario",
            subcategories: [
                {
                    name: language.t("_dataAbecedarioBasico"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Abecedario/Basico/patron",
                    steps: 6,
                    fetch: "Basico"
                },
                {
                    name: language.t("_dataAbecedarioEstiloRomano"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Abecedario/Estilo romano/patron",
                    steps: 6,
                    fetch: "Estilo romano"
                },
            ]
        },
        {
            name: language.t("_dataCocina"),
            fetch: "Cocina",
            subcategories: [
                {
                    name: language.t("_dataCocinaPasteles"),
                    image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Cocina/Pasteles/patron-17",
                    steps: 4,
                    fetch: "Pasteles"
                },
            ]
        }
    ]
}

export const category1 = [
    {
        name: "Sencillo"
    }
]

export function highlight(language) {
    return [
        {
            category: language.t("_dataSencillo"),
            fetch: content(language)[0].fetch,
            data: content(language)[0].subcategories[1]
        },
        {
            category: language.t("_dataNavidad"),
            fetch: content(language)[3].fetch,
            data: content(language)[3].subcategories[1]
        },
        {
            category: language.t("_dataPerros"),
            fetch: content(language)[2].fetch,
            data: content(language)[2].subcategories[2]
        }
    ]
}

