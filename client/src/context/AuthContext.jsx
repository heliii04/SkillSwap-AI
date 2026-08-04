import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getCurrentUser,
    loginUser,
    logoutUser,
    registerUser,
    resendVerificationOtp,
    verifyUserEmail,
} from "../api/authApi";

import axiosClient, {
    refreshAccessTokenRequest,
} from "../api/axiosClient";

import {
    clearAccessToken,
    getAccessToken,
    setAccessToken,
} from "../api/tokenStore";

export const AuthContext = createContext(null);

function getErrorMessage(error) {
    if (
        error.response?.data?.errors &&
        Array.isArray(error.response.data.errors) &&
        error.response.data.errors.length > 0
    ) {
        return error.response.data.errors
            .map((err) => err.message)
            .join(" ");
    }
    return (
        error.response?.data?.message ||
        error.message ||
        "Something went wrong. Please try again."
    );
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] =
        useState(true);

    const updateUser = useCallback((userData) => {
        setUser((prev) => {
            if (!prev) return userData;
            return { ...prev, ...userData };
        });
    }, []);

    const isAuthenticated = Boolean(user);

    const clearSession = useCallback(() => {
        clearAccessToken();
        setUser(null);
    }, []);

    const loadCurrentUser = useCallback(async () => {
        const result = await getCurrentUser();

        const currentUser = result?.data?.user;

        if (!currentUser) {
            throw new Error(
                "Current user was not returned."
            );
        }

        setUser(currentUser);

        return currentUser;
    }, []);

    const restoreSession = useCallback(async () => {
        try {
            if (getAccessToken()) {
                try {
                    await loadCurrentUser();
                    return;
                } catch (err) {
                    console.log("Existing access token invalid or expired, refreshing...", err);
                }
            }
            await refreshAccessTokenRequest();
            await loadCurrentUser();
        } catch {
            clearSession();
        } finally {
            setIsAuthLoading(false);
        }
    }, [clearSession, loadCurrentUser]);

    useEffect(() => {
        restoreSession();
    }, [restoreSession]);

    useEffect(() => {
        function handleSessionExpired() {
            clearSession();
        }

        window.addEventListener(
            "skillswap:session-expired",
            handleSessionExpired
        );

        return () => {
            window.removeEventListener(
                "skillswap:session-expired",
                handleSessionExpired
            );
        };
    }, [clearSession]);

    const register = useCallback(async (formData) => {
        try {
            return await registerUser(formData);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }, []);

    const verifyEmail = useCallback(
        async (formData) => {
            try {
                const result =
                    await verifyUserEmail(formData);

                const accessToken =
                    result?.data?.accessToken;

                const verifiedUser =
                    result?.data?.user;

                if (!accessToken || !verifiedUser) {
                    throw new Error(
                        "Invalid verification response."
                    );
                }

                setAccessToken(accessToken);
                setUser(verifiedUser);

                return result;
            } catch (error) {
                throw new Error(
                    getErrorMessage(error)
                );
            }
        },
        []
    );

    const resendOtp = useCallback(
        async (email) => {
            try {
                return await resendVerificationOtp({
                    email,
                });
            } catch (error) {
                throw new Error(
                    getErrorMessage(error)
                );
            }
        },
        []
    );

    const login = useCallback(
        async (formData) => {
            try {
                const result =
                    await loginUser(formData);

                const accessToken =
                    result?.data?.accessToken;

                const authenticatedUser =
                    result?.data?.user;

                if (
                    !accessToken ||
                    !authenticatedUser
                ) {
                    throw new Error(
                        "Invalid login response."
                    );
                }

                setAccessToken(accessToken);
                setUser(authenticatedUser);

                return result;
            } catch (error) {
                const message =
                    error.response?.data?.message ||
                    error.message ||
                    "Login failed.";

                throw new Error(message);
            }
        },
        []
    );

    const adminLogin = useCallback(
        async (formData) => {
            try {
                const result = await axiosClient.post("/auth/admin-login", formData);
                const accessToken = result?.data?.data?.accessToken;
                const authenticatedUser = result?.data?.data?.user;

                if (!accessToken || !authenticatedUser) {
                    throw new Error("Invalid admin login response.");
                }

                setAccessToken(accessToken);
                setUser(authenticatedUser);

                return result;
            } catch (error) {
                const message =
                    error.response?.data?.message ||
                    error.message ||
                    "Admin login failed.";
                throw new Error(message);
            }
        },
        []
    );

    const logout = useCallback(async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error(
                "Logout request failed:",
                error
            );
        } finally {
            clearSession();
        }
    }, [clearSession]);

    const refreshUser = useCallback(async () => {
        try {
            return await loadCurrentUser();
        } catch (error) {
            clearSession();
            throw new Error(getErrorMessage(error));
        }
    }, [clearSession, loadCurrentUser]);

    const contextValue = useMemo(
        () => ({
            user,
            isAuthenticated,
            isAuthLoading,
            authLoading: isAuthLoading, // Compatibility mapping
            register,
            verifyEmail,
            resendOtp,
            login,
            adminLogin,
            logout,
            refreshUser,
            updateUser,
        }),
        [
            user,
            isAuthenticated,
            isAuthLoading,
            register,
            verifyEmail,
            resendOtp,
            login,
            adminLogin,
            logout,
            refreshUser,
            updateUser,
        ]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider."
        );
    }

    return context;
}