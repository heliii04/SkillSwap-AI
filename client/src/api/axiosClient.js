import axios from "axios";

import {
    clearAccessToken,
    getAccessToken,
    setAccessToken,
} from "./tokenStore";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error(
        "VITE_API_BASE_URL is missing in frontend .env file."
    );
}

const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 90000,
    headers: {
        "Content-Type": "application/json",
    },
});

const refreshClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 90000,
    headers: {
        "Content-Type": "application/json",
    },
});

let refreshPromise = null;

async function requestNewAccessToken() {
    if (!refreshPromise) {
        refreshPromise = refreshClient
            .post("/auth/refresh-token")
            .then((response) => {
                const accessToken =
                    response.data?.data?.accessToken;

                if (!accessToken) {
                    throw new Error(
                        "Access token was not returned."
                    );
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

axiosClient.interceptors.request.use(
    (config) => {
        const accessToken =
            getAccessToken();

        if (accessToken) {
            config.headers.Authorization =
                `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;
        const statusCode =
            error.response?.status;

        const authUrls = [
            "/auth/register",
            "/auth/login",
            "/auth/verify-email",
            "/auth/resend-otp",
            "/auth/refresh-token",
            "/auth/logout",
        ];

        const isAuthRequest = authUrls.some(
            (url) =>
                originalRequest?.url?.includes(
                    url
                )
        );

        if (
            statusCode !== 401 ||
            !originalRequest ||
            originalRequest._retry ||
            isAuthRequest
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            const newAccessToken =
                await requestNewAccessToken();

            originalRequest.headers =
                originalRequest.headers || {};

            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            return axiosClient(originalRequest);
        } catch (refreshError) {
            window.dispatchEvent(
                new CustomEvent(
                    "skillswap:session-expired"
                )
            );

            return Promise.reject(
                refreshError
            );
        }
    }
);

export function refreshAccessTokenRequest() {
    return requestNewAccessToken();
}

export default axiosClient;