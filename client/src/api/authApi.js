import axiosClient from "./axiosClient";

export async function registerUser(payload) {
    const response =
        await axiosClient.post(
            "/auth/register",
            payload
        );

    return response.data;
}

export async function verifyUserEmail(payload) {
    const response =
        await axiosClient.post(
            "/auth/verify-email",
            payload
        );

    return response.data;
}

export async function resendVerificationOtp(
    payload
) {
    const response =
        await axiosClient.post(
            "/auth/resend-otp",
            payload
        );

    return response.data;
}

export async function loginUser(payload) {
    const response =
        await axiosClient.post(
            "/auth/login",
            payload
        );

    return response.data;
}

export async function logoutUser() {
    const response =
        await axiosClient.post(
            "/auth/logout"
        );

    return response.data;
}

export async function getCurrentUser() {
    const response =
        await axiosClient.get("/auth/me");

    return response.data;
}