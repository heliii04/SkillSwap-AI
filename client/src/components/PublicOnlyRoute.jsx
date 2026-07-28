import {
    Navigate,
    Outlet,
} from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import FullPageLoader from "./FullPageLoader";

export default function PublicOnlyRoute() {
    const {
        isAuthenticated,
        isAuthLoading,
    } = useAuth();

    if (isAuthLoading) {
        return <FullPageLoader />;
    }

    if (isAuthenticated) {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    return <Outlet />;
}