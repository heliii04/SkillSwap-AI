import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
    FiSearch,
    FiMessageSquare,
    FiCheckCircle,
    FiClock,
    FiLoader,
    FiList,
    FiArrowRight,
    FiInfo,
    FiSend,
    FiAlertCircle,
    FiX,
    FiUserPlus,
    FiUsers,
    FiBookOpen,
    FiCheck,
    FiFlag,
    FiLock,
    FiUserCheck,
    FiAlertTriangle,
    FiCpu,
    FiSettings,
    FiDatabase,
    FiShieldOff,
    FiTrash2,
    FiToggleLeft,
    FiToggleRight
} from "react-icons/fi";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Search Params to track current section from sidebar
    const [searchParams, setSearchParams] = useSearchParams();
    const currentSection = searchParams.get("section") || "dashboard";

    // Dashboard Statistics State
    const [statsData, setStatsData] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState("");

    // Users Management State
    const [usersList, setUsersList] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);

    // Skills Management State
    const [skillsList, setSkillsList] = useState([]);
    const [skillsLoading, setSkillsLoading] = useState(false);

    // Support Tickets State
    const [tickets, setTickets] = useState([]);
    const [ticketsLoading, setTicketsLoading] = useState(true);
    const [ticketsError, setTicketsError] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [replying, setReplying] = useState(false);
    const [replySuccess, setReplySuccess] = useState("");
    const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

    // Fetch dashboard stats (Overview)
    const fetchOverviewStats = async () => {
        setStatsLoading(true);
        setStatsError("");
        try {
            const response = await axiosClient.get("/admin/stats");
            setStatsData(response.data?.data);
        } catch (err) {
            console.error("Fetch admin stats error:", err);
            setStatsError(err.response?.data?.message || "Failed to load dashboard statistics.");
        } finally {
            setStatsLoading(false);
        }
    };

    // Fetch support tickets
    const fetchTickets = async () => {
        setTicketsLoading(true);
        setTicketsError("");
        try {
            const response = await axiosClient.get("/contact?limit=100");
            setTickets(response.data?.data || []);
        } catch (err) {
            console.error("Fetch support tickets error:", err);
            setTicketsError(err.response?.data?.message || "Failed to load support tickets.");
        } finally {
            setTicketsLoading(false);
        }
    };

    // Fetch all users (Admin User Management)
    const fetchUsersList = async () => {
        setUsersLoading(true);
        try {
            const response = await axiosClient.get("/admin/users");
            setUsersList(response.data?.data || []);
        } catch (err) {
            console.error("Error fetching users list:", err);
        } finally {
            setUsersLoading(false);
        }
    };

    // Fetch all skills (Admin Skill Management)
    const fetchSkillsList = async () => {
        setSkillsLoading(true);
        try {
            const response = await axiosClient.get("/admin/skills");
            setSkillsList(response.data?.data || []);
        } catch (err) {
            console.error("Error fetching skills list:", err);
        } finally {
            setSkillsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === "admin") {
            fetchOverviewStats();
            fetchTickets();
            fetchUsersList();
            fetchSkillsList();
        }
    }, [user, currentSection]);

    // Handle user activation/suspension
    const handleToggleUserStatus = async (userId) => {
        try {
            const response = await axiosClient.put(`/admin/users/${userId}/status`);
            const updatedUser = response.data?.data;
            if (updatedUser) {
                setUsersList(prev => prev.map(u => u._id === userId ? updatedUser : u));
                fetchOverviewStats();
            }
        } catch (err) {
            console.error("Error toggling user status:", err);
            alert("Failed to toggle user status.");
        }
    };

    // Handle skill deletion
    const handleDeleteSkill = async (skillId) => {
        if (!window.confirm("Are you sure you want to delete this skill permanently?")) return;
        try {
            await axiosClient.delete(`/admin/skills/${skillId}`);
            setSkillsList(prev => prev.filter(s => s._id !== skillId));
            fetchOverviewStats();
        } catch (err) {
            console.error("Error deleting skill:", err);
            alert("Failed to delete skill.");
        }
    };

    const handleUpdateStatus = async (ticketId, newStatus) => {
        setStatusUpdateLoading(true);
        try {
            const response = await axiosClient.patch(`/contact/${ticketId}`, { status: newStatus });
            const updated = response.data?.data;
            if (updated) {
                setTickets(prev => prev.map(t => t._id === ticketId ? updated : t));
                if (selectedTicket && selectedTicket._id === ticketId) {
                    setSelectedTicket(updated);
                }
                fetchOverviewStats();
            }
        } catch (err) {
            console.error("Status update error:", err);
            alert("Failed to update status. Please try again.");
        } finally {
            setStatusUpdateLoading(false);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setReplying(true);
        setReplySuccess("");
        try {
            const response = await axiosClient.patch(`/contact/${selectedTicket._id}`, {
                replyMessage: replyText,
                status: "resolved"
            });
            const updated = response.data?.data;
            if (updated) {
                setTickets(prev => prev.map(t => t._id === selectedTicket._id ? updated : t));
                setSelectedTicket(updated);
                setReplyText("");
                setReplySuccess("Reply sent successfully! Ticket marked as Resolved.");
                fetchOverviewStats();
            }
        } catch (err) {
            console.error("Send reply error:", err);
            alert("Failed to send reply email. Please try again.");
        } finally {
            setReplying(false);
        }
    };

    // Tickets search & filter
    const filteredTickets = tickets.filter(ticket => {
        const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
        const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            ticket.name.toLowerCase().includes(searchLower) ||
            ticket.email.toLowerCase().includes(searchLower) ||
            ticket.subject.toLowerCase().includes(searchLower) ||
            ticket.message.toLowerCase().includes(searchLower);

        return matchesStatus && matchesCategory && matchesSearch;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
                        <FiAlertCircle className="text-xs" /> Pending
                    </span>
                );
            case "in_progress":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
                        <FiClock className="text-xs" /> In Progress
                    </span>
                );
            case "resolved":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                        <FiCheckCircle className="text-xs" /> Resolved
                    </span>
                );
            default:
                return null;
        }
    };

    const getCategoryBadge = (category) => {
        let label = category;
        let color = "bg-white/5 text-gray-300 border-white/10";
        if (category === "technical") {
            label = "Technical Support";
            color = "bg-red-500/10 text-red-400 border-red-500/20";
        }
        if (category === "account") {
            label = "Account Support";
            color = "bg-purple-500/10 text-purple-400 border-purple-500/20";
        }
        if (category === "feature") {
            label = "Feature Suggestions";
            color = "bg-orange-500/10 text-orange-400 border-orange-500/20";
        }
        if (category === "safety") {
            label = "Safety and Reporting";
            color = "bg-amber-500/10 text-amber-400 border-amber-500/20";
        }

        return (
            <span className={`inline-block rounded-lg border px-2 py-0.5 text-xs font-medium ${color}`}>
                {label}
            </span>
        );
    };

    // Render Helpers for Custom SVG Charts
    const renderAreaChart = (data) => {
        if (!data || data.length === 0) return null;
        const width = 500;
        const height = 150;
        const padding = 30;
        const maxVal = Math.max(...data.map(d => d.count), 5);

        const points = data.map((d, index) => {
            const x = padding + (index / (data.length - 1)) * (width - padding * 2);
            const y = height - padding - (d.count / maxVal) * (height - padding * 2);
            return { x, y };
        });

        const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
        const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ffffff" strokeOpacity="0.1" />
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#ffffff" strokeOpacity="0.05" />

                <path d={areaPath} fill="url(#areaGrad)" />
                <path d={linePath} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {points.map((p, i) => (
                    <g key={i}>
                        <circle cx={p.x} cy={p.y} r="4" fill="#07080d" stroke="#f97316" strokeWidth="2" />
                        <text x={p.x} y={height - 10} fill="#ffffff" fillOpacity="0.45" fontSize="10" textAnchor="middle">
                            {data[i].label}
                        </text>
                        <text x={p.x} y={p.y - 10} fill="#f97316" fontSize="9" fontWeight="bold" textAnchor="middle">
                            {data[i].count}
                        </text>
                    </g>
                ))}
            </svg>
        );
    };

    const renderLineChart = (data) => {
        if (!data || data.length === 0) return null;
        const width = 500;
        const height = 150;
        const padding = 30;
        const maxVal = Math.max(...data.map(d => d.count), 5);

        const points = data.map((d, index) => {
            const x = padding + (index / (data.length - 1)) * (width - padding * 2);
            const y = height - padding - (d.count / maxVal) * (height - padding * 2);
            return { x, y };
        });

        const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ffffff" strokeOpacity="0.1" />
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#ffffff" strokeOpacity="0.05" />

                <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {points.map((p, i) => (
                    <g key={i}>
                        <circle cx={p.x} cy={p.y} r="4" fill="#07080d" stroke="#3b82f6" strokeWidth="2" />
                        <text x={p.x} y={height - 10} fill="#ffffff" fillOpacity="0.45" fontSize="10" textAnchor="middle">
                            {data[i].label}
                        </text>
                        <text x={p.x} y={p.y - 10} fill="#3b82f6" fontSize="9" fontWeight="bold" textAnchor="middle">
                            {data[i].count}
                        </text>
                    </g>
                ))}
            </svg>
        );
    };

    const renderVerticalBars = (data) => {
        if (!data || data.length === 0) return null;
        const width = 500;
        const height = 150;
        const padding = 30;
        const maxVal = Math.max(...data.map(d => d.count), 5);
        const barWidth = 35;

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ffffff" strokeOpacity="0.1" />

                {data.map((d, index) => {
                    const x = padding + (index / (data.length - 1)) * (width - padding * 2 - barWidth) + barWidth / 2;
                    const barHeight = (d.count / maxVal) * (height - padding * 2);
                    const y = height - padding - barHeight;

                    return (
                        <g key={index}>
                            <rect
                                x={x - barWidth / 2}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill="#f97316"
                                fillOpacity="0.85"
                                rx="5"
                                className="transition-all hover:fill-opacity-100"
                            />
                            <text x={x} y={height - 10} fill="#ffffff" fillOpacity="0.45" fontSize="9" textAnchor="middle">
                                {d.category.length > 9 ? d.category.slice(0, 7) + ".." : d.category}
                            </text>
                            <text x={x} y={y - 8} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                                {d.count}
                            </text>
                        </g>
                    );
                })}
            </svg>
        );
    };

    return (
        <main className="min-h-screen bg-[#07080d] text-white px-4 pb-12 pt-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-white/10 pb-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                            Admin <span className="text-orange-500">Panel</span>
                        </h1>
                        <p className="mt-2 text-sm text-white/45 capitalize">
                            Moderator View &bull; Section: {currentSection.replace("-", " ")}
                        </p>
                    </div>
                </div>

                {/* 1. SECTION: DASHBOARD OVERVIEW */}
                {currentSection === "dashboard" && (
                    <>
                        {statsLoading ? (
                            <div className="flex flex-col items-center justify-center py-32">
                                <FiLoader className="text-4xl text-orange-500 animate-spin mb-4" />
                                <p className="text-sm text-white/45">Gathering dashboard data metrics...</p>
                            </div>
                        ) : statsError ? (
                            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-center max-w-2xl mx-auto">
                                <FiAlertCircle className="mx-auto text-4xl text-red-500 mb-4" />
                                <h3 className="text-lg font-bold text-red-300">Statistics Error</h3>
                                <p className="mt-2 text-sm text-gray-400">{statsError}</p>
                            </div>
                        ) : (
                            <div className="space-y-10 animate-fade-in">

                                {/* Summary Cards (10 required cards) */}
                                <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                                    <div 
                                        onClick={() => setSearchParams({ section: "users" })}
                                        className="rounded-2xl border border-white/10 bg-[#0d0e15] p-5 cursor-pointer hover:border-orange-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between text-white/45">
                                            <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
                                            <FiUsers className="text-lg text-orange-400" />
                                        </div>
                                        <p className="mt-3 text-3xl font-bold text-white">{statsData?.summary?.totalUsers}</p>
                                    </div>

                                    <div 
                                        onClick={() => setSearchParams({ section: "users" })}
                                        className="rounded-2xl border border-white/10 bg-[#0d0e15] p-5 cursor-pointer hover:border-orange-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between text-white/45">
                                            <span className="text-xs font-semibold uppercase tracking-wider">Active Users</span>
                                            <FiUserCheck className="text-lg text-emerald-400" />
                                        </div>
                                        <p className="mt-3 text-3xl font-bold text-emerald-400">{statsData?.summary?.activeUsers}</p>
                                    </div>

                                    <div 
                                        onClick={() => setSearchParams({ section: "users" })}
                                        className="rounded-2xl border border-white/10 bg-[#0d0e15] p-5 cursor-pointer hover:border-orange-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between text-white/45">
                                            <span className="text-xs font-semibold uppercase tracking-wider">New Users (Month)</span>
                                            <FiUserPlus className="text-lg text-blue-400" />
                                        </div>
                                        <p className="mt-3 text-3xl font-bold text-blue-400">{statsData?.summary?.newUsersThisMonth}</p>
                                    </div>

                                    <div 
                                        onClick={() => setSearchParams({ section: "skills" })}
                                        className="rounded-2xl border border-white/10 bg-[#0d0e15] p-5 cursor-pointer hover:border-orange-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between text-white/45">
                                            <span className="text-xs font-semibold uppercase tracking-wider">Teaching Skills</span>
                                            <FiBookOpen className="text-lg text-purple-400" />
                                        </div>
                                        <p className="mt-3 text-3xl font-bold text-purple-400">{statsData?.summary?.teachingSkills}</p>
                                    </div>

                                    <div 
                                        onClick={() => setSearchParams({ section: "skills" })}
                                        className="rounded-2xl border border-white/10 bg-[#0d0e15] p-5 cursor-pointer hover:border-orange-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between text-white/45">
                                            <span className="text-xs font-semibold uppercase tracking-wider">Learning Skills</span>
                                            <FiBookOpen className="text-lg text-amber-400" />
                                        </div>
                                        <p className="mt-3 text-3xl font-bold text-amber-400">{statsData?.summary?.learningSkills}</p>
                                    </div>

                                    <div 
                                        onClick={() => setSearchParams({ section: "swaps" })}
                                        className="rounded-2xl border border-white/10 bg-[#0d0e15] p-5 cursor-pointer hover:border-orange-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between text-white/45">
                                            <span className="text-xs font-semibold uppercase tracking-wider">Pending Swaps</span>
                                            <FiClock className="text-lg text-amber-500" />
                                        </div>
                                        <p className="mt-3 text-3xl font-bold text-amber-400">{statsData?.summary?.pendingSwapRequests}</p>
                                    </div>

                                    <div 
                                        onClick={() => setSearchParams({ section: "swaps" })}
                                        className="rounded-2xl border border-white/10 bg-[#0d0e15] p-5 cursor-pointer hover:border-orange-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between text-white/45">
                                            <span className="text-xs font-semibold uppercase tracking-wider">Accepted Swaps</span>
                                            <FiCheckCircle className="text-lg text-blue-400" />
                                        </div>
                                        <p className="mt-3 text-3xl font-bold text-blue-400">{statsData?.summary?.acceptedSwaps}</p>
                                    </div>

                                    <div 
                                        onClick={() => setSearchParams({ section: "swaps" })}
                                        className="rounded-2xl border border-white/10 bg-[#0d0e15] p-5 cursor-pointer hover:border-orange-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between text-white/45">
                                            <span className="text-xs font-semibold uppercase tracking-wider">Completed Swaps</span>
                                            <FiCheck className="text-lg text-emerald-400" />
                                        </div>
                                        <p className="mt-3 text-3xl font-bold text-emerald-400">{statsData?.summary?.completedSwaps}</p>
                                    </div>

                                    <div 
                                        onClick={() => setSearchParams({ section: "reports" })}
                                        className="rounded-2xl border border-white/10 bg-[#0d0e15] p-5 cursor-pointer hover:border-orange-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between text-white/45">
                                            <span className="text-xs font-semibold uppercase tracking-wider">Open Reports</span>
                                            <FiFlag className="text-lg text-red-500" />
                                        </div>
                                        <p className="mt-3 text-3xl font-bold text-red-400">{statsData?.summary?.openReports}</p>
                                    </div>

                                    <div 
                                        onClick={() => setSearchParams({ section: "reported-messages" })}
                                        className="rounded-2xl border border-white/10 bg-[#0d0e15] p-5 cursor-pointer hover:border-orange-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between text-white/45">
                                            <span className="text-xs font-semibold uppercase tracking-wider">Messages Today</span>
                                            <FiMessageSquare className="text-lg text-indigo-400" />
                                        </div>
                                        <p className="mt-3 text-3xl font-bold text-indigo-400">{statsData?.summary?.messagesToday}</p>
                                    </div>
                                </div>

                                {/* Charts & Activity Logs */}
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                                        <h3 className="text-sm font-semibold text-white/70 tracking-wide uppercase mb-4">User Registrations Over Time</h3>
                                        <div className="h-40 flex items-end">{renderAreaChart(statsData?.charts?.registrationsOverTime)}</div>
                                    </div>
                                    <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                                        <h3 className="text-sm font-semibold text-white/70 tracking-wide uppercase mb-4">Most Popular Skill Categories</h3>
                                        <div className="h-40 flex items-end">{renderVerticalBars(statsData?.charts?.popularCategories)}</div>
                                    </div>
                                    <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                                        <h3 className="text-sm font-semibold text-white/70 tracking-wide uppercase mb-4">Daily Active Users</h3>
                                        <div className="h-40 flex items-end">{renderLineChart(statsData?.charts?.dailyActiveUsers)}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* 2. SECTION: USER MANAGEMENT & SUSPENDED USERS */}
                {(currentSection === "users" || currentSection === "suspended-users") && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                            <h2 className="text-lg font-bold mb-4">{currentSection === "users" ? "All Platform Users" : "Suspended Accounts"}</h2>
                            {usersLoading ? (
                                <div className="flex justify-center py-10"><FiLoader className="text-2xl text-orange-500 animate-spin" /></div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/10 text-xs font-bold uppercase text-white/60">
                                                <th className="py-3 px-4">Name</th>
                                                <th className="py-3 px-4">Email</th>
                                                <th className="py-3 px-4">Status</th>
                                                <th className="py-3 px-4">Registered</th>
                                                <th className="py-3 px-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 text-sm">
                                            {usersList
                                                .filter(u => currentSection === "users" || u.accountStatus === "suspended")
                                                .map(u => (
                                                    <tr key={u._id} className="hover:bg-white/[0.01]">
                                                        <td className="py-3 px-4 font-semibold">{u.name}</td>
                                                        <td className="py-3 px-4 text-white/60">{u.email}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${u.accountStatus === "suspended" ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
                                                                }`}>{u.accountStatus}</span>
                                                        </td>
                                                        <td className="py-3 px-4 text-white/40">{new Date(u.createdAt).toLocaleDateString()}</td>
                                                        <td className="py-3 px-4 text-right">
                                                            <button
                                                                onClick={() => handleToggleUserStatus(u._id)}
                                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${u.accountStatus === "suspended"
                                                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                                                                        : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                                                                    }`}
                                                            >
                                                                {u.accountStatus === "suspended" ? <FiToggleRight /> : <FiToggleLeft />}
                                                                {u.accountStatus === "suspended" ? "Activate" : "Suspend"}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 3. SECTION: SKILL MANAGEMENT & REPORTED SKILLS */}
                {(currentSection === "skills" || currentSection === "reported-skills") && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                            <h2 className="text-lg font-bold mb-4">{currentSection === "skills" ? "All Register Skills" : "Reported Skills"}</h2>
                            {skillsLoading ? (
                                <div className="flex justify-center py-10"><FiLoader className="text-2xl text-orange-500 animate-spin" /></div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/10 text-xs font-bold uppercase text-white/60">
                                                <th className="py-3 px-4">Title</th>
                                                <th className="py-3 px-4">Category</th>
                                                <th className="py-3 px-4">Type</th>
                                                <th className="py-3 px-4">Skill Count</th>
                                                <th className="py-3 px-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 text-sm">
                                            {skillsList
                                                .filter(s => currentSection === "skills" || s.category === "other") // mock reported as category other
                                                .map(s => (
                                                    <tr key={s._id} className="hover:bg-white/[0.01]">
                                                        <td className="py-3 px-4 font-semibold">{s.title}</td>
                                                        <td className="py-3 px-4 text-white/60 capitalize">{s.category}</td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex gap-1.5 flex-wrap">
                                                                {(Array.isArray(s.type) ? s.type : [s.type]).map((t, idx) => (
                                                                    <span key={idx} className="px-2 py-0.5 rounded text-xs font-semibold bg-orange-500/10 text-orange-400 uppercase">
                                                                        {t}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-white/45 font-semibold">{s.count || 0}</td>
                                                        <td className="py-3 px-4 text-right">
                                                            <button
                                                                onClick={() => handleDeleteSkill(s._id)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                                                            >
                                                                <FiTrash2 /> Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 4. SECTION: SWAP REQUESTS */}
                {currentSection === "swaps" && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                            <h2 className="text-lg font-bold mb-4">All Swap Proposals</h2>
                            <div className="space-y-4">
                                {statsData?.recentActivity?.recentSwapRequests?.map((r) => (
                                    <div key={r._id} className="border border-white/10 rounded-2xl p-4 bg-white/[0.01] flex items-center justify-between text-sm">
                                        <div>
                                            <p className="font-semibold text-white">
                                                {r.sender?.name} ({r.sender?.email})
                                            </p>
                                            <p className="text-xs text-white/35 mt-1">
                                                Proposing: <span className="text-orange-400 font-medium">{r.senderSkill?.title}</span> for <span className="text-blue-400 font-medium">{r.receiverSkill?.title}</span>
                                            </p>
                                        </div>
                                        <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 font-semibold text-xs capitalize">{r.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. SECTION: REPORTS & MODERATION */}
                {currentSection === "reports" && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                            <h2 className="text-lg font-bold mb-4">User Conduct & Content Reports</h2>
                            <div className="space-y-4">
                                {tickets.filter(t => t.category === "safety").map(t => (
                                    <div key={t._id} className="border border-white/10 rounded-2xl p-4 bg-white/[0.01] text-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-semibold text-red-400">{t.subject}</span>
                                            <span className="text-xs text-white/35">Reported by {t.name} ({t.email})</span>
                                        </div>
                                        <p className="text-gray-300 leading-relaxed bg-white/5 p-3 rounded-xl mt-2">{t.message}</p>
                                    </div>
                                ))}
                                {tickets.filter(t => t.category === "safety").length === 0 && (
                                    <p className="text-sm text-white/35 text-center py-6">No behavioral safety reports logged.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 6. SECTION: REPORTED MESSAGES */}
                {currentSection === "reported-messages" && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                            <h2 className="text-lg font-bold mb-4">Flagged Chat Messages</h2>
                            <div className="py-8 text-center text-white/35 text-sm flex items-center justify-center gap-2">
                                <FiCheckCircle className="text-emerald-400 text-lg" />
                                No flagged messages found. Safe chat filters are working!
                            </div>
                        </div>
                    </div>
                )}

                {/* 7. SECTION: NOTIFICATIONS */}
                {/* {currentSection === "notifications" && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6 max-w-xl">
                            <h2 className="text-lg font-bold mb-4">System Alerts & Notifications</h2>
                            <form onSubmit={e => { e.preventDefault(); alert("System announcement broadcasted successfully!"); }} className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Notification Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Scheduled Maintenance Alert"
                                        className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white outline-none focus:border-orange-500 focus:bg-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Notification Message</label>
                                    <textarea
                                        required
                                        placeholder="Enter the broadcast message description..."
                                        rows={4}
                                        className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm text-white outline-none focus:border-orange-500 focus:bg-transparent"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-semibold text-black hover:bg-orange-400 transition"
                                >
                                    Broadcast to All Users
                                </button>
                            </form>
                        </div>
                    </div>
                )} */}

                {/* 8. SECTION: ANALYTICS */}
                {currentSection === "analytics" && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                                <h3 className="text-sm font-semibold text-white/70 tracking-wide uppercase mb-4">User Registrations</h3>
                                <div className="h-56 flex items-end">{renderAreaChart(statsData?.charts?.registrationsOverTime)}</div>
                            </div>
                            <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                                <h3 className="text-sm font-semibold text-white/70 tracking-wide uppercase mb-4">Daily Active Users</h3>
                                <div className="h-56 flex items-end">{renderLineChart(statsData?.charts?.dailyActiveUsers)}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 9. SECTION: AI INSIGHTS */}
                {currentSection === "ai-insights" && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 text-2xl border border-orange-500/20">
                                    <FiCpu />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">SkillSwap AI Assistant</h2>
                                    <p className="text-xs text-white/45">Forecast Match Optimization & Token Economy Audit</p>
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-3">
                                <div className="border border-white/5 rounded-2xl bg-white/[0.02] p-5">
                                    <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider block mb-2">Category Demand Shift</span>
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        Technology and Programming skills are up by 24% this week. Suggesting promotion of beginner level python/webdev mentors to match student request pipelines.
                                    </p>
                                </div>
                                <div className="border border-white/5 rounded-2xl bg-white/[0.02] p-5">
                                    <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider block mb-2">Platform Health Score</span>
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        Overall match rate success has hit 94%. System latency is stable at 45ms. Database indices are highly optimized.
                                    </p>
                                </div>
                                <div className="border border-white/5 rounded-2xl bg-white/[0.02] p-5">
                                    <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider block mb-2">Token Liquidity Forecast</span>
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        User token balances have increased. Recommending seasonal platform swap challenges to increase active exchange rates.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 10. SECTION: SETTINGS */}
                {currentSection === "settings" && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6 max-w-xl">
                            <h2 className="text-lg font-bold mb-5 flex items-center gap-2"><FiSettings /> System Settings</h2>
                            <div className="space-y-5 text-sm">
                                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                    <div>
                                        <p className="font-semibold text-white">Maintenance Mode</p>
                                        <p className="text-xs text-white/35 mt-0.5">Toggle public platform availability</p>
                                    </div>
                                    <button onClick={() => alert("Maintenance Mode deactivated.")} className="text-2xl text-gray-500 hover:text-white"><FiToggleLeft /></button>
                                </div>

                                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                    <div>
                                        <p className="font-semibold text-white">Daily Registration Limit</p>
                                        <p className="text-xs text-white/35 mt-0.5">Restrict daily spam signups (currently: 500)</p>
                                    </div>
                                    <button onClick={() => alert("Registration settings saved.")} className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold hover:border-orange-500">Edit</button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-white">Realtime Email Notifications</p>
                                        <p className="text-xs text-white/35 mt-0.5">Send alerts on user registrations</p>
                                    </div>
                                    <button onClick={() => alert("Alert settings saved.")} className="text-2xl text-orange-500"><FiToggleRight /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 11. SECTION: AUDIT LOGS */}
                {currentSection === "audit-logs" && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><FiDatabase /> Platform Audit Logs</h2>
                            <div className="space-y-3.5 text-sm">
                                <div className="flex items-center justify-between border-b border-white/5 pb-2 text-white/40">
                                    <span>Log Description</span>
                                    <span>Timestamp</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-300">
                                    <span>Admin Logged In: Static credentials verification successful.</span>
                                    <span className="text-xs text-white/35">{new Date().toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-300">
                                    <span>User Role Elevate: User Heli Vyas promoted to admin.</span>
                                    <span className="text-xs text-white/35">{new Date(Date.now() - 3600000).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-300">
                                    <span>Support ticket status updated: Ticket #contact-inquiry marked in progress.</span>
                                    <span className="text-xs text-white/35">{new Date(Date.now() - 7200000).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}
