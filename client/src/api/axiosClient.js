import axios from "axios";

import {
    clearAccessToken,
    getAccessToken,
    setAccessToken,
} from "./tokenStore";

const envBaseUrl = import.meta.env.VITE_API_BASE_URL;

const API_BASE_URL =
    envBaseUrl ||
    (typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://localhost:5000/api/v1"
        : "https://skillswap-ai-8ill.onrender.com/api/v1");

const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 30000, // 30 seconds connection timeout
    headers: {
        "Content-Type": "application/json",
    },
});

const refreshClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

/*
|--------------------------------------------------------------------------
| Request Cancellation Manager (AbortController)
|--------------------------------------------------------------------------
*/

const cancelControllers = new Map();

/**
 * Creates and tracks an AbortController signal for a given route/group key
 * @param {string} groupKey - Route or module group key (e.g. 'search', 'recommendations')
 */
export function getCancelSignal(groupKey = "global") {
    if (cancelControllers.has(groupKey)) {
        cancelControllers.get(groupKey).abort();
    }
    const controller = new AbortController();
    cancelControllers.set(groupKey, controller);
    return controller.signal;
}

/**
 * Abort all pending HTTP requests for a given group key
 * @param {string} groupKey
 */
export function cancelPendingRequests(groupKey = "global") {
    if (cancelControllers.has(groupKey)) {
        cancelControllers.get(groupKey).abort();
        cancelControllers.delete(groupKey);
    }
}

/*
|--------------------------------------------------------------------------
| Token Refresh Logic
|--------------------------------------------------------------------------
*/

let refreshPromise = null;

async function requestNewAccessToken() {
    if (!refreshPromise) {
        refreshPromise = refreshClient
            .post("/auth/refresh-token")
            .then((response) => {
                const accessToken = response.data?.data?.accessToken;

                if (!accessToken) {
                    throw new Error("Access token was not returned.");
                }

                setAccessToken(accessToken);
                return accessToken;
            })
            .catch((error) => {
                clearAccessToken();
                throw error;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
}

/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
*/

axiosClient.interceptors.request.use(
    (config) => {
        const accessToken = getAccessToken();

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/*
|--------------------------------------------------------------------------
| Response Interceptor (Token Refresh + Exponential Backoff Retry)
|--------------------------------------------------------------------------
*/

const MAX_RETRIES = 3;

axiosClient.interceptors.response.use(
    (response) => response,

    async (error) => {
        // Do not retry if request was explicitly canceled by AbortController
        if (axios.isCancel(error)) {
            return Promise.reject(error);
        }

        const originalRequest = error.config;
        if (!originalRequest) {
            return Promise.reject(error);
        }

        const statusCode = error.response?.status;

        const authUrls = [
            "/auth/register",
            "/auth/login",
            "/auth/verify-email",
            "/auth/resend-otp",
            "/auth/refresh-token",
            "/auth/logout",
        ];

        const isAuthRequest = authUrls.some((url) =>
            originalRequest.url?.includes(url)
        );

        // 1. Handle 401 Unauthorized token refresh
        if (statusCode === 401 && !originalRequest._retry && !isAuthRequest) {
            originalRequest._retry = true;

            try {
                const newAccessToken = await requestNewAccessToken();
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axiosClient(originalRequest);
            } catch (refreshError) {
                window.dispatchEvent(
                    new CustomEvent("skillswap:session-expired")
                );
                return Promise.reject(refreshError);
            }
        }

        // 2. Handle Exponential Backoff Retry for transient errors (Network failure, 502, 503, 504)
        const isNetworkError = !error.response && error.code !== "ECONNABORTED";
        const isTransientServerError = statusCode >= 502 && statusCode <= 504;
        const isGetRequest = (originalRequest.method || "get").toLowerCase() === "get";

        if ((isNetworkError || isTransientServerError) && (isGetRequest || originalRequest._retryable)) {
            originalRequest._retryCount = originalRequest._retryCount || 0;

            if (originalRequest._retryCount < MAX_RETRIES) {
                originalRequest._retryCount += 1;
                const backoffDelay = Math.pow(2, originalRequest._retryCount) * 1000; // 2s, 4s, 8s

                console.warn(
                    `🔄 [AXIOS RETRY] Transient error (${statusCode || error.message}). Retrying GET request (${originalRequest.url}) attempt ${originalRequest._retryCount}/${MAX_RETRIES} in ${backoffDelay}ms...`
                );

                await new Promise((resolve) => setTimeout(resolve, backoffDelay));
                return axiosClient(originalRequest);
            }
        }

        return Promise.reject(error);
    }
);

export function refreshAccessTokenRequest() {
    return requestNewAccessToken();
}

export default axiosClient;