import { Platform } from "react-native";

// iOS uses the PostScript names embedded in the font files. Android uses
// the family aliases configured by the expo-font plugin in app.json.
export const fonts = Platform.select({
    ios: {
        regular: "Poppins-Regular",
        medium: "Poppins-Medium",
        bold: "Poppins-Bold",
    },
    default: {
        regular: "poppins-regular",
        medium: "poppins-medium",
        bold: "poppins-bold",
    },
});
