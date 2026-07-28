import {
    Navigate,
    Outlet,
    useLocation,
} from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import FullPageLoader from "./FullPageLoader";

export default function ProtectedRoute() {
    const {
        isAuthenticated,
        isAuthLoading,
    } = useAuth();

    const location = useLocation();

    if (isAuthLoading) {
        return <FullPageLoader />;
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location.pathname,
                }}
            />
        );
    }

    return <Outlet />;
}