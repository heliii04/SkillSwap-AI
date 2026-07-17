import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

const AuthContext = createContext(null);

const API_URL = "http://localhost:5000/api/auth";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    const loadCurrentUser = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setUser(null);
            setAuthLoading(false);
            return;
        }

        try {
            setAuthLoading(true);

            const response = await fetch(`${API_URL}/me`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Authentication failed");
            }

            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
        } catch (error) {
            console.error("Authentication error:", error);

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            setUser(null);
        } finally {
            setAuthLoading(false);
        }
    };

    useEffect(() => {
        loadCurrentUser();
    }, []);

    const login = (token, userData) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                authLoading,
                login,
                logout,
                loadCurrentUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}