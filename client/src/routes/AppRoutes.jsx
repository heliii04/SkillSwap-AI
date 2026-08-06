import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "../components/AdminRoute";

// Lazy-loaded pages
const Home = lazy(() => import("../pages/common/Home"));
const Login = lazy(() => import("../pages/common/Login"));
const Register = lazy(() => import("../pages/common/Register"));
const Dashboard = lazy(() => import("../pages/user/Dashboard"));
const MyProfile = lazy(() => import("../pages/user/MyProfile"));
const SkillsTeach = lazy(() => import("../pages/user/SkillsTeach"));
const SkillsWant = lazy(() => import("../pages/user/SkillsWant"));
const Search = lazy(() => import("../pages/user/Search"));
const Recommendations = lazy(() => import("../pages/user/Recommendations"));
const Requests = lazy(() => import("../pages/user/Requests"));
const Messages = lazy(() => import("../pages/user/Messages"));
const Notifications = lazy(() => import("../pages/user/Notifications"));
const AIAssistant = lazy(() => import("../pages/user/AIAssistant"));

const BrowseSkills = lazy(() => import("../pages/common/BrowseSkills"));
const HowItWorks = lazy(() => import("../pages/common/HowItWorks"));
const About = lazy(() => import("../pages/common/About"));
const Contact = lazy(() => import("../pages/common/Contact"));
const NotFound = lazy(() => import("../pages/common/NotFound"));
const VerifyOtp = lazy(() => import("../pages/common/VerifyOtp"));
const PrivacyPolicy = lazy(() => import("../pages/common/PrivacyPolicy"));
const Terms = lazy(() => import("../pages/common/Terms"));
const Faq = lazy(() => import("../pages/common/Faq"));
const HelpCenter = lazy(() => import("../pages/common/HelpCenter"));

const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminOverview = lazy(() => import("../pages/admin/AdminOverview"));
const AdminUsers = lazy(() => import("../pages/admin/AdminUsers"));
const AdminSkills = lazy(() => import("../pages/admin/AdminSkills"));
const AdminSwaps = lazy(() => import("../pages/admin/AdminSwaps"));
const AdminSupport = lazy(() => import("../pages/admin/AdminSupport"));
const AdminReports = lazy(() => import("../pages/admin/AdminReports"));
const AdminReportedMessages = lazy(() => import("../pages/admin/AdminReportedMessages"));
const AdminAnalytics = lazy(() => import("../pages/admin/AdminAnalytics"));
const AdminAuditLogs = lazy(() => import("../pages/admin/AdminAuditLogs"));

// Loading spinner fallback component
function PageLoader() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#06070a]">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                <p className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
                    Loading SkillSwap AI...
                </p>
            </div>
        </div>
    );
}

export default function AppRoutes() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* Public pages */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/browse-skills" element={<BrowseSkills />} />
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
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-otp" element={<VerifyOtp />} />
                </Route>

                {/* Protected dashboard pages */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/profile" element={<MyProfile />} />
                        <Route path="/skills/teach" element={<SkillsTeach />} />
                        <Route path="/skills/learn" element={<SkillsWant />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/recommendations" element={<Recommendations />} />
                        <Route path="/requests" element={<Requests />} />
                        <Route path="/messages" element={<Messages />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/ai-assistant" element={<AIAssistant />} />
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
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
}