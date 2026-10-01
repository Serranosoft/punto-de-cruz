import AsyncStorage from "@react-native-async-storage/async-storage";
import { userPreferences } from "./user-preferences";

export const VIP_ACCESS_DURATION_DAYS = 30;
export const VIP_ACCESS_DURATION_MS = VIP_ACCESS_DURATION_DAYS * 24 * 60 * 60 * 1000;

function normalizeExpiry(value) {
    const expiresAt = Number(value);
    return Number.isFinite(expiresAt) && expiresAt > 0 ? expiresAt : 0;
}

export async function getVipAccessStatus(now = Date.now()) {
    const storedExpiry = await AsyncStorage.getItem(userPreferences.VIP_ACCESS_EXPIRES_AT);
    const expiresAt = normalizeExpiry(storedExpiry);
    return {
        isActive: expiresAt > now,
        expiresAt,
        remainingMs: Math.max(0, expiresAt - now),
    };
}

export async function grantVipAccess(now = Date.now()) {
    const current = await getVipAccessStatus(now);
    const startsAt = Math.max(now, current.expiresAt);
    const expiresAt = startsAt + VIP_ACCESS_DURATION_MS;
    await AsyncStorage.setItem(
        userPreferences.VIP_ACCESS_EXPIRES_AT,
        expiresAt.toString()
    );
    return {
        isActive: true,
        expiresAt,
        remainingMs: expiresAt - now,
    };
}

export function formatVipExpiry(expiresAt, locale = "es") {
    if (!expiresAt) {
        return "";
    }

    try {
        return new Intl.DateTimeFormat(locale, {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(new Date(expiresAt));
    } catch {
        return new Date(expiresAt).toLocaleDateString();
    }
}
