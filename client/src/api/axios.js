import axios from "axios";

const API_BASE =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    (typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://localhost:5000/api"
        : "https://skillswap-ai-8ill.onrender.com/api");

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
});

export default api;