export const categories_raw = [
    {
        name: "Sencillo",
        subcategories: [
            {
                name: "Marinero",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Sencillo/Marinero/patron",
                steps: 6
            },
            {
                name: "Nave espacial",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Sencillo/Nave espacial/patron",
                steps: 4
            },
            {
                name: "Planetas",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Sencillo/Planetas/patron",
                steps: 4
            },
            {
                name: "Torre Eiffel",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Sencillo/Torre Eiffel/patron-5",
                steps: 5
            }
        ]
    },
    {
        name: "Modernos",
        subcategories: [
            {
                name: "Mejores amigas",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Modernos/Mejores amigas/patron-62",
                steps: 4
            },
            {
                name: "Energia positiva",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Modernos/Energia positiva/patron-66",
                steps: 8
            },
            {
                name: "Corazon bff",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Modernos/Corazon bff/patron-74",
                steps: 8
            },
            {
                name: "Confeti de corazones",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Modernos/Confeti de corazones/patron",
                steps: 8
            }
        ]
    },
    {
        name: "Perros",
        subcategories: [
            {
                name: "Caniche",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Perros/Caniche/patron-38",
                steps: 8
            },
            {
                name: "Carlino",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Perros/Carlino/patron-46",
                steps: 8
            },
            {
                name: "Dalmata",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Perros/Dalmata/patron-54",
                steps: 8
            },
        ]
    },
    {
        name: "Navidad",
        subcategories: [
            {
                name: "Bola de nieve",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Navidad/Bola de nieve/patron-10",
                steps: 8
            },
            {
                name: "Adorno de navidad",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Navidad/Decoracion de nieve/patron-18",
                steps: 12
            },
            {
                name: "Merry christmas",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Navidad/Merry christmas/patron-30",
                steps: 8
            },
        ]
    },
    {
        name: "Halloween",
        subcategories: [
            {
                name: "Fantasma",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Halloween/Fantasma/patron",
                steps: 8
            },
            {
                name: "Gato de halloween",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Halloween/Gato de halloween/patron",
                steps: 8
            },
            {
                name: "Gorro de bruja",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Halloween/Gorro de bruja/patron",
                steps: 8
            },
        ]
    },
    {
        name: "Flores",
        subcategories: [
            {
                name: "Ramo redondo",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Flores/Ramo redondo/patron",
                steps: 8,
            },
            {
                name: "Sencillas",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Flores/Sencillas/patron",
                steps: 8,
            },
        ]
    },
    {
        name: "Animales",
        subcategories: [
            {
                name: "Abeja",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Animales/Abeja/patron-21",
                steps: 4,
            },
            {
                name: "Pajaro",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Animales/Pajaro/patron",
                steps: 5,
            },
            {
                name: "Panda",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Animales/Panda/patron",
                steps: 5,
            },
            {
                name: "Perro",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Animales/Perro/patron",
                steps: 5,
            },
            {
                name: "Ratón",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Animales/Raton/patron",
                steps: 5,
            },
            {
                name: "Tiburones",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Animales/Tiburones/patron",
                steps: 8,
            },
        ]
    },
    {
        name: "Abecedario",
        subcategories: [
            {
                name: "Basico",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Abecedario/Basico/patron",
                steps: 6,
            },
            {
                name: "Estilo romano",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Abecedario/Estilo romano/patron",
                steps: 6,
            },
        ]
    },
    {
        name: "Cocina",
        subcategories: [
            {
                name: "Pasteles",
                image: "https://res.cloudinary.com/dvuvk6yrw/image/upload/Cocina/Pasteles/patron-17",
                steps: 4,
            },
        ]
    }
]
export const category1 = [
    {
        name: "Sencillo"
    }
]

export const highlight = [
    {
        category: "Sencillo",
        data: categories_raw[0].subcategories[1]
    },
    {
        category: "Navidad",
        data: categories_raw[3].subcategories[1]
    },
    {
        category: "Perros",
        data: categories_raw[2].subcategories[2]
    }
]

