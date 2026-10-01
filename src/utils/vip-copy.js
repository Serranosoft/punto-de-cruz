const copy = {
    es: {
        title: "Patrones VIP",
        badge: "CLUB VIP · 30 DÍAS",
        homeTitle: "Patrones que no encontrarás en otro sitio",
        homeLocked: "Desbloquea la colección durante 30 días viendo un anuncio.",
        homeActive: "Tu acceso VIP está activo hasta el %{date}.",
        homeCtaLocked: "Descubrir VIP",
        homeCtaActive: "Entrar a la colección",
        lockedEyebrow: "UNA RECOMPENSA, UN MES COMPLETO",
        lockedTitle: "Tu rincón más exclusivo",
        lockedDescription: "Ve un único anuncio recompensado y disfruta de todos los patrones VIP durante 30 días.",
        benefitOne: "Patrones exclusivos y ediciones especiales",
        benefitTwo: "Acceso completo durante 30 días",
        benefitThree: "Sin suscripciones ni renovación automática",
        unlockButton: "Ver anuncio y desbloquear 30 días",
        loadingAd: "Preparando anuncio…",
        adUnavailableTitle: "Anuncio aún no disponible",
        adUnavailableBody: "Estamos preparando el anuncio. Inténtalo de nuevo en unos segundos.",
        missingIdTitle: "Configuración pendiente",
        missingIdBody: "Falta añadir el ID de producción del anuncio recompensado.",
        rewardTitle: "¡VIP desbloqueado!",
        rewardBody: "Ya tienes acceso a los patrones VIP durante 30 días.",
        activeBadge: "ACCESO ACTIVO",
        activeUntil: "Disponible hasta el %{date}",
        comingSoonTitle: "Estamos bordando algo especial",
        comingSoonBody: "Tus primeros patrones VIP aparecerán aquí muy pronto. Tu sistema de acceso ya está listo.",
        noReward: "El acceso se activa al completar el anuncio.",
    },
    en: {
        title: "VIP Patterns",
        badge: "VIP CLUB · 30 DAYS",
        homeTitle: "Patterns you won't find anywhere else",
        homeLocked: "Unlock the collection for 30 days by watching one ad.",
        homeActive: "Your VIP access is active until %{date}.",
        homeCtaLocked: "Discover VIP",
        homeCtaActive: "Open the collection",
        lockedEyebrow: "ONE REWARD, A FULL MONTH",
        lockedTitle: "Your most exclusive corner",
        lockedDescription: "Watch one rewarded ad and enjoy every VIP pattern for 30 days.",
        benefitOne: "Exclusive patterns and special editions",
        benefitTwo: "Full access for 30 days",
        benefitThree: "No subscription or automatic renewal",
        unlockButton: "Watch an ad and unlock 30 days",
        loadingAd: "Preparing ad…",
        adUnavailableTitle: "Ad not available yet",
        adUnavailableBody: "The ad is being prepared. Please try again in a few seconds.",
        missingIdTitle: "Configuration pending",
        missingIdBody: "The production rewarded ad unit ID still needs to be added.",
        rewardTitle: "VIP unlocked!",
        rewardBody: "You now have access to VIP patterns for 30 days.",
        activeBadge: "ACTIVE ACCESS",
        activeUntil: "Available until %{date}",
        comingSoonTitle: "We're stitching something special",
        comingSoonBody: "Your first VIP patterns will appear here soon. The access system is ready.",
        noReward: "Access is activated after completing the ad.",
    },
};

export function getVipCopy(locale = "es") {
    return locale?.toLowerCase().startsWith("es") ? copy.es : copy.en;
}

export function interpolateVipCopy(text, values = {}) {
    return Object.entries(values).reduce(
        (result, [key, value]) => result.replace(`%{${key}}`, value),
        text
    );
}
