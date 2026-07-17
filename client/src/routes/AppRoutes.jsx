import {
    BrowserRouter,
    Route,
    Routes,
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "../components/ProtectedRoute";
import Dashboard from "../pages/Dashboard";

import Profile from "../pages/Profile";
import Search from "../pages/Search";
import Chat from "../pages/Chat";
import Notifications from "../pages/Notifications";
import Reviews from "../pages/Reviews";
import Settings from "../pages/Settings";
import EditProfile from "../pages/EditProfile";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public pages */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                </Route>

                {/* Authentication pages */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>

                {/* Protected dashboard pages */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/edit-profile" element={<EditProfile />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/chat" element={<Chat />} />
                        <Route
                            path="/notifications"
                            element={<Notifications />}
                        />
                        <Route path="/reviews" element={<Reviews />} />
                        <Route path="/settings" element={<Settings />} />
                    </Route>
                </Route>

                {/* 404 page */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}