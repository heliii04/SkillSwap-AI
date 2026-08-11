import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "../components/AdminRoute";
import ErrorBoundary from "../components/ErrorBoundary";

// Helper function to handle module import retries when Vite server restarts or connection drops
const lazyWithRetry = (componentImport) =>
    lazy(async () => {
        const pageRefreshed = sessionStorage.getItem("page-refreshed-on-chunk-error");
        try {
            const component = await componentImport();
            sessionStorage.removeItem("page-refreshed-on-chunk-error");
            return component;
        } catch (error) {
            console.error("Dynamic import error caught:", error);
            if (!pageRefreshed) {
                sessionStorage.setItem("page-refreshed-on-chunk-error", "true");
                window.location.reload();
                return new Promise(() => {}); // Pause while page reloads
            }
            throw error;
        }
    });

// Lazy-loaded pages with retry handling
const Home = lazyWithRetry(() => import("../pages/common/Home"));
const Login = lazyWithRetry(() => import("../pages/common/Login"));
const Register = lazyWithRetry(() => import("../pages/common/Register"));
const Dashboard = lazyWithRetry(() => import("../pages/user/Dashboard"));
const MyProfile = lazyWithRetry(() => import("../pages/user/MyProfile"));
const SkillsTeach = lazyWithRetry(() => import("../pages/user/SkillsTeach"));
const SkillsWant = lazyWithRetry(() => import("../pages/user/SkillsWant"));
const Search = lazyWithRetry(() => import("../pages/user/Search"));
const Recommendations = lazyWithRetry(() => import("../pages/user/Recommendations"));
const Requests = lazyWithRetry(() => import("../pages/user/Requests"));
const Messages = lazyWithRetry(() => import("../pages/user/Messages"));
const Notifications = lazyWithRetry(() => import("../pages/user/Notifications"));
const AIAssistant = lazyWithRetry(() => import("../pages/user/AIAssistant"));

const BrowseSkills = lazyWithRetry(() => import("../pages/common/BrowseSkills"));
const HowItWorks = lazyWithRetry(() => import("../pages/common/HowItWorks"));
const About = lazyWithRetry(() => import("../pages/common/About"));
const Contact = lazyWithRetry(() => import("../pages/common/Contact"));
const NotFound = lazyWithRetry(() => import("../pages/common/NotFound"));
const VerifyOtp = lazyWithRetry(() => import("../pages/common/VerifyOtp"));
const PrivacyPolicy = lazyWithRetry(() => import("../pages/common/PrivacyPolicy"));
const Terms = lazyWithRetry(() => import("../pages/common/Terms"));
const Faq = lazyWithRetry(() => import("../pages/common/Faq"));
const HelpCenter = lazyWithRetry(() => import("../pages/common/HelpCenter"));

const AdminDashboard = lazyWithRetry(() => import("../pages/admin/AdminDashboard"));
const AdminOverview = lazyWithRetry(() => import("../pages/admin/AdminOverview"));
const AdminUsers = lazyWithRetry(() => import("../pages/admin/AdminUsers"));
const AdminSwaps = lazyWithRetry(() => import("../pages/admin/AdminSwaps"));
const AdminSupport = lazyWithRetry(() => import("../pages/admin/AdminSupport"));
const AdminReports = lazyWithRetry(() => import("../pages/admin/AdminReports"));
const AdminReportedMessages = lazyWithRetry(() => import("../pages/admin/AdminReportedMessages"));
const AdminAnalytics = lazyWithRetry(() => import("../pages/admin/AdminAnalytics"));
const AdminAuditLogs = lazyWithRetry(() => import("../pages/admin/AdminAuditLogs"));

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
        <ErrorBoundary>
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
        </ErrorBoundary>
    );
}