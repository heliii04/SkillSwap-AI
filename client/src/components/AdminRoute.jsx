import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FullPageLoader from "./FullPageLoader";

export default function AdminRoute() {
    const { isAuthenticated, isAuthLoading, user } = useAuth();

    if (isAuthLoading) {
        return <FullPageLoader />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
