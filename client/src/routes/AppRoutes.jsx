import {
    Route,
    Routes,
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import ProtectedRoute from "../components/ProtectedRoute";

import Home from "../pages/common/Home";
import Login from "../pages/common/Login";
import Register from "../pages/common/Register";
import Dashboard from "../pages/user/Dashboard";
import MyProfile from "../pages/user/MyProfile";
import SkillsTeach from "../pages/user/SkillsTeach";
import SkillsWant from "../pages/user/SkillsWant";
import Search from "../pages/user/Search";
import Recommendations from "../pages/user/Recommendations";
import Requests from "../pages/user/Requests";
import Messages from "../pages/user/Messages";
import Notifications from "../pages/user/Notifications";
import AIAssistant from "../pages/user/AIAssistant";

import BrowseSkills from "../pages/common/BrowseSkills";
import HowItWorks from "../pages/common/HowItWorks";
import About from "../pages/common/About";
import Contact from "../pages/common/Contact";
import NotFound from "../pages/common/NotFound";
import VerifyOtp from "../pages/common/VerifyOtp";
import PrivacyPolicy from "../pages/common/PrivacyPolicy";
import Terms from "../pages/common/Terms";
import Faq from "../pages/common/Faq";
import HelpCenter from "../pages/common/HelpCenter";
import AdminRoute from "../components/AdminRoute";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminOverview from "../pages/admin/AdminOverview";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminSkills from "../pages/admin/AdminSkills";
import AdminSwaps from "../pages/admin/AdminSwaps";
import AdminSupport from "../pages/admin/AdminSupport";
import AdminReports from "../pages/admin/AdminReports";
import AdminReportedMessages from "../pages/admin/AdminReportedMessages";
import AdminAnalytics from "../pages/admin/AdminAnalytics";
import AdminAuditLogs from "../pages/admin/AdminAuditLogs";


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
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/overview" element={<AdminOverview />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/skills" element={<AdminSkills />} />
                    <Route path="/admin/swaps" element={<AdminSwaps />} />
                    <Route path="/admin/support" element={<AdminSupport />} />
                    <Route path="/admin/reports" element={<AdminReports />} />
                    <Route path="/admin/reported-messages" element={<AdminReportedMessages />} />
                    <Route path="/admin/analytics" element={<AdminAnalytics />} />
                    <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
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