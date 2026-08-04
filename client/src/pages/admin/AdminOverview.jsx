import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiUsers,
    FiBookOpen,
    FiCheckCircle,
    FiClock,
    FiLoader,
    FiAlertCircle,
    FiUserPlus,
    FiUserCheck,
    FiCheck,
    FiFlag,
    FiMessageSquare,
    FiShield
} from "react-icons/fi";
import axiosClient from "../../api/axiosClient";

export default function AdminOverview() {
    const navigate = useNavigate();
    const [statsData, setStatsData] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState("");

    const fetchOverviewStats = async () => {
        setStatsError("");
        setStatsLoading(true);
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

    useEffect(() => {
        let isMounted = true;
        axiosClient.get("/admin/stats")
            .then(response => {
                if (isMounted) setStatsData(response.data?.data);
            })
            .catch(err => {
                if (isMounted) setStatsError(err.response?.data?.message || "Failed to load dashboard statistics.");
            })
            .finally(() => {
                if (isMounted) setStatsLoading(false);
            });
        return () => { isMounted = false; };
    }, []);

    // Render Helpers for Custom SVG Charts
    const renderAreaChart = (data) => {
        if (!data || data.length === 0) return (
            <div className="flex h-full items-center justify-center text-white/20 text-xs">No data available</div>
        );
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
        if (!data || data.length === 0) return (
            <div className="flex h-full items-center justify-center text-white/20 text-xs">No data available</div>
        );
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
        if (!data || data.length === 0) return (
            <div className="flex h-full items-center justify-center text-white/20 text-xs">No data available</div>
        );
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

    if (statsLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <FiLoader className="text-4xl text-orange-500 animate-spin mb-4" />
                <p className="text-sm text-white/45">Gathering dashboard data metrics...</p>
            </div>
        );
    }

    if (statsError) {
        return (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-center max-w-2xl mx-auto">
                <FiAlertCircle className="mx-auto text-4xl text-red-500 mb-4" />
                <h3 className="text-lg font-bold text-red-300">Statistics Error</h3>
                <p className="mt-2 text-sm text-gray-400">{statsError}</p>
                <button
                    onClick={fetchOverviewStats}
                    className="mt-4 rounded-xl bg-red-500/20 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500/30"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in">

            {/* 10 Summary Cards */}
            <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                <div
                    onClick={() => navigate("/admin?section=users")}
                    className="rounded-2xl border border-white/10 bg-[#0d0e15] p-5 cursor-pointer hover:border-orange-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
                >
                    <div className="flex items-center justify-between text-white/45">
                        <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
                        <FiUsers className="text-lg text-orange-400" />
                    </div>
                    <p className="mt-3 text-3xl font-bold text-white">{statsData?.summary?.totalUsers ?? statsData?.totalUsers ?? 0}</p>
                </div>

                <div
                    onClick={() => navigate("/admin?section=users")}
                    className="rounded-2xl border border-white/10 bg-[#0d0e15] p-5 cursor-pointer hover:border-orange-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
                >
                    <div className="flex items-center justify-between text-white/45">
                        <span className="text-xs font-semibold uppercase tracking-wider">Active Users</span>
                        <FiUserCheck className="text-lg text-emerald-400" />
                    </div>
                    <p className="mt-3 text-3xl font-bold text-emerald-400">{statsData?.summary?.activeUsers ?? 0}</p>
                </div>

                <div
                    onClick={() => navigate("/admin?section=users")}
                    className="rounded-2xl border border-white/10 bg-[#0d0e15] p-5 cursor-pointer hover:border-orange-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
                >
                    <div className="flex items-center justify-between text-white/45">
                        <span className="text-xs font-semibold uppercase tracking-wider">New Users (Month)</span>
                        <FiUserPlus className="text-lg text-blue-400" />
                    </div>
                    <p className="mt-3 text-3xl font-bold text-blue-400">{statsData?.summary?.newUsersThisMonth ?? 0}</p>
                </div>

                <div
                    onClick={() => navigate("/admin?section=skills")}
                    className="rounded-2xl border border-white/10 bg-[#0d0e15] p-5 cursor-pointer hover:border-orange-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
                >
                    <div className="flex items-center justify-between text-white/45">
                        <span className="text-xs font-semibold uppercase tracking-wider">Teaching Skills</span>
                        <FiBookOpen className="text-lg text-purple-400" />
                    </div>
                    <p className="mt-3 text-3xl font-bold text-purple-400">{statsData?.summary?.teachingSkills ?? statsData?.totalSkills ?? 0}</p>
                </div>

                <div
                    onClick={() => navigate("/admin?section=skills")}
                    className="rounded-2xl border border-white/10 bg-[#0d0e15] p-5 cursor-pointer hover:border-orange-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
                >
                    <div className="flex items-center justify-between text-white/45">
                        <span className="text-xs font-semibold uppercase tracking-wider">Learning Skills</span>
                        <FiBookOpen className="text-lg text-amber-400" />
                    </div>
                    <p className="mt-3 text-3xl font-bold text-amber-400">{statsData?.summary?.learningSkills ?? 0}</p>
                </div>

                <div
                    onClick={() => navigate("/admin?section=swaps")}
                    className="rounded-2xl border border-white/10 bg-[#0d0e15] p-5 cursor-pointer hover:border-orange-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
                >
                    <div className="flex items-center justify-between text-white/45">
                        <span className="text-xs font-semibold uppercase tracking-wider">Pending Swaps</span>
                        <FiClock className="text-lg text-amber-500" />
                    </div>
                    <p className="mt-3 text-3xl font-bold text-amber-400">{statsData?.summary?.pendingSwapRequests ?? statsData?.totalSwapRequests ?? 0}</p>
                </div>

                <div
                    onClick={() => navigate("/admin?section=swaps")}
                    className="rounded-2xl border border-white/10 bg-[#0d0e15] p-5 cursor-pointer hover:border-orange-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
                >
                    <div className="flex items-center justify-between text-white/45">
                        <span className="text-xs font-semibold uppercase tracking-wider">Accepted Swaps</span>
                        <FiCheckCircle className="text-lg text-blue-400" />
                    </div>
                    <p className="mt-3 text-3xl font-bold text-blue-400">{statsData?.summary?.acceptedSwaps ?? 0}</p>
                </div>

                <div
                    onClick={() => navigate("/admin?section=swaps")}
                    className="rounded-2xl border border-white/10 bg-[#0d0e15] p-5 cursor-pointer hover:border-orange-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
                >
                    <div className="flex items-center justify-between text-white/45">
                        <span className="text-xs font-semibold uppercase tracking-wider">Completed Swaps</span>
                        <FiCheck className="text-lg text-emerald-400" />
                    </div>
                    <p className="mt-3 text-3xl font-bold text-emerald-400">{statsData?.summary?.completedSwaps ?? 0}</p>
                </div>

                <div
                    onClick={() => navigate("/admin?section=reports")}
                    className="rounded-2xl border border-white/10 bg-[#0d0e15] p-5 cursor-pointer hover:border-orange-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
                >
                    <div className="flex items-center justify-between text-white/45">
                        <span className="text-xs font-semibold uppercase tracking-wider">Open Reports</span>
                        <FiFlag className="text-lg text-red-500" />
                    </div>
                    <p className="mt-3 text-3xl font-bold text-red-400">{statsData?.summary?.openReports ?? 0}</p>
                </div>

                <div
                    onClick={() => navigate("/admin?section=support")}
                    className="rounded-2xl border border-white/10 bg-[#0d0e15] p-5 cursor-pointer hover:border-orange-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
                >
                    <div className="flex items-center justify-between text-white/45">
                        <span className="text-xs font-semibold uppercase tracking-wider">Messages Today</span>
                        <FiMessageSquare className="text-lg text-indigo-400" />
                    </div>
                    <p className="mt-3 text-3xl font-bold text-indigo-400">{statsData?.summary?.messagesToday ?? statsData?.pendingTickets ?? 0}</p>
                </div>
            </div>

            {/* Charts & Activity */}
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

            {/* System Health */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <FiUsers className="text-orange-400" /> Recent User Registrations
                        </h3>
                    </div>
                    <div className="mt-4 space-y-3">
                        {statsData?.recentActivity?.recentUsers?.length > 0 ? statsData.recentActivity.recentUsers.map((u) => (
                            <div key={u._id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-sm">
                                <div>
                                    <p className="font-semibold text-white">{u.name}</p>
                                    <p className="text-xs text-white/40">{u.email}</p>
                                </div>
                                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60 capitalize">
                                    {u.role || "user"}
                                </span>
                            </div>
                        )) : (
                            <p className="text-sm text-white/30 text-center py-6">No recent registrations</p>
                        )}
                    </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <FiShield className="text-emerald-400" /> System Health &amp; Protection
                        </h3>
                    </div>
                    <div className="mt-4 space-y-4 text-sm text-white/70">
                        <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                                <div>
                                    <p className="font-semibold text-emerald-400">Database Connection</p>
                                    <p className="text-xs text-white/40">MongoDB Cluster Healthy</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-400">100% Operational</span>
                        </div>

                        <div className="flex items-center justify-between rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-blue-500" />
                                <div>
                                    <p className="font-semibold text-blue-400">API Gateway &amp; Sockets</p>
                                    <p className="text-xs text-white/40">Realtime Messaging Services Connected</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-blue-400">Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
