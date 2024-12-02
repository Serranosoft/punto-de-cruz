export const ui = {
    img: {
        aspectRatio: 1,
        width: 35,
    },
    text: {
        fontFamily: "poppins-regular",
        color: "#000",
        fontSize: 18,
    },
    muted: {
        fontFamily: "poppins-regular",
        color: "#404040",
        fontSize: 15,
    },
    bold: {
        fontFamily: "poppins-bold"
    },
    h1: {
        fontSize: 48,
        fontFamily: "poppins-bold",
        color: "#000",
    },
    h2: {
        fontFamily: "poppins-bold",
        color: "#000",
        fontSize: 27,
        letterSpacing: -0.5,
    },
    h3: {
        fontFamily: "poppins-medium",
        color: "#000",
        fontSize: 23,
        letterSpacing: -0.25
    },
    h4: {
        fontFamily: "poppins-medium",
        color: "#000",
        fontSize: 20,
    },
    center: {
        alignSelf: "center",
        textAlign: "center"
    }
}

export const layout = {
    flex: {
        flex: 1,
    },

    zIndex: {
        zIndex: 1,
    },

    row: {
        flexDirection: "row",
    },

    justifyBetween: {
        justifyContent: "space-between",
    },

    justifyCenter: {
        justifyContent: "center",
    },

    alignCenter: {
        alignItems: "center",
    }    
}

export const gap = {
    small: {
        gap: 8
    },

    medium: {
        gap: 16
    },

    big: {
        gap: 24
    }
}

export const radius = {
    small: {
        borderRadius: 8
    },
    medium: {
        borderRadius: 16
    },
    big: {
        borderRadius: 24
    }
}

export const padding = {
    smallHorizontal: {
        paddingHorizontal: 8
    },

    mediumHorizontal: {
        paddingHorizontal: 12
    },

    bigHorizontal: {
        paddingHorizontal: 16
    },

    smallVertical: {
        paddingVertical: 8,
    },
    mediumVertical: {
        paddingVertical: 12,
    },
    bigVertical: {
        paddingVertical: 16,
    },
    
    smallTop: {
        paddingTop: 8,
    },
    mediumTop: {
        paddingTop: 12,
    },
    bigTop: {
        paddingTop: 16,
    },

    smallBottom: {
        paddingBottom: 8,
    },
    mediumBottom: {
        paddingBottom: 12,
    },
    bigBottom: {
        paddingBottom: 16,
    },
}

export const components = {
    header: [
        layout.row, 
        layout.justifyBetween, 
        layout.alignCenter, 
        padding.mediumHorizontal,
        padding.mediumVertical, 
        gap.small
    ],

    row: [
        layout.row,
        layout.alignCenter,
        gap.medium,
    ],
}