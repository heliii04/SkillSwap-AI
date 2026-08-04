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
        } else {
            localStorage.removeItem("skillswap_access_token");
        }
    }
}

export function clearAccessToken() {
    accessToken = null;
    if (typeof window !== "undefined") {
        localStorage.removeItem("skillswap_access_token");
    }
}