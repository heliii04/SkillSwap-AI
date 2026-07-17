import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
    const { user, authLoading } = useAuth();

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#07080D] text-white">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-orange-500" />

                    <p className="mt-4 text-sm text-white/60">
                        Checking authentication...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}