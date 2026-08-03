import {
    Route,
    Routes,
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import ProtectedRoute from "../components/ProtectedRoute";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import MyProfile from "../pages/MyProfile";
import SkillsTeach from "../pages/SkillsTeach";
import SkillsWant from "../pages/SkillsWant";
import Search from "../pages/Search";
import Recommendations from "../pages/Recommendations";
import Requests from "../pages/Requests";
import Messages from "../pages/Messages";
import Notifications from "../pages/Notifications";
import AIAssistant from "../pages/AIAssistant";

import BrowseSkills from "../pages/BrowseSkills";
import HowItWorks from "../pages/HowItWorks";
import About from "../pages/About";
import Contact from "../pages/Contact";
import NotFound from "../pages/NotFound";
import VerifyOtp from "../pages/VerifyOtp";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import Terms from "../pages/Terms";
import Faq from "../pages/Faq";
import HelpCenter from "../pages/HelpCenter";
import AdminRoute from "../components/AdminRoute";
import AdminDashboard from "../pages/AdminDashboard";


export default function AppRoutes() {
    return (
        <Routes>
            {/* Public pages */}
            <Route element={<MainLayout />}>
                <Route
                    path="/"
                    element={<Home />}
                />
                <Route
                    path="/browse-skills"
                    element={<BrowseSkills />}
                />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/support" element={<Contact />} />
            </Route>

            {/* Authentication pages */}
            <Route element={<AuthLayout />}>
                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/verify-otp"
                    element={<VerifyOtp />}
                />
            </Route>

            {/* Protected dashboard pages */}
            <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/profile"
                        element={<MyProfile />}
                    />

                    <Route
                        path="/skills/teach"
                        element={<SkillsTeach />}
                    />
                    <Route
                        path="/skills/learn"
                        element={<SkillsWant />}
                    />
                    <Route
                        path="/search"
                        element={<Search />}
                    />
                    <Route
                        path="/recommendations"
                        element={<Recommendations />}
                    />
                    <Route
                        path="/requests"
                        element={<Requests />}
                    />
                    <Route
                        path="/messages"
                        element={<Messages />}
                    />
                    <Route
                        path="/notifications"
                        element={<Notifications />}
                    />
                    <Route
                        path="/ai-assistant"
                        element={<AIAssistant />}
                    />
                </Route>
            </Route>

            {/* Admin dashboard pages */}
            <Route element={<AdminRoute />}>
                <Route element={<DashboardLayout />}>
                    <Route
                        path="/admin"
                        element={<AdminDashboard />}
                    />
                </Route>
            </Route>

            {/* 404 page */}
            <Route
                path="*"
                element={<NotFound />}
            />
        </Routes>
    );
}