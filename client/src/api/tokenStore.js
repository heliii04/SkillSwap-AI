let accessToken = typeof window !== "undefined" ? localStorage.getItem("skillswap_access_token") : null;

export function getAccessToken() {
    if (!accessToken && typeof window !== "undefined") {
        accessToken = localStorage.getItem("skillswap_access_token");
    }
    return accessToken;
}

export function setAccessToken(token) {
    accessToken = token || null;
    if (typeof window !== "undefined") {
        if (token) {
            localStorage.setItem("skillswap_access_token", token);
            localStorage.setItem("skillswap_has_session", "true");
        } else {
            localStorage.removeItem("skillswap_access_token");
            localStorage.removeItem("skillswap_has_session");
        }
    }
}

export function clearAccessToken() {
    accessToken = null;
    if (typeof window !== "undefined") {
        localStorage.removeItem("skillswap_access_token");
        localStorage.removeItem("skillswap_has_session");
    }
}

export function hasSessionHint() {
    if (typeof window === "undefined") return false;
    return Boolean(
        localStorage.getItem("skillswap_has_session") ||
        localStorage.getItem("skillswap_access_token")
    );
}