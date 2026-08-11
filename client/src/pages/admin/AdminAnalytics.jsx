import { useState, useEffect, useRef } from "react";
import { FiLoader, FiTrendingUp, FiUsers, FiRepeat, FiAward, FiPieChart, FiBarChart2, FiGlobe } from "react-icons/fi";
import axiosClient from "../../api/axiosClient";

function AnimatedCard({ children, className = "" }) {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.15 }
        );

        if (domRef.current) {
            observer.observe(domRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={domRef} className={className}>
            {typeof children === "function" ? children(isVisible) : children}
        </div>
    );
}

export default function AdminAnalytics() {
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get("/admin/stats");
                setStatsData(response.data?.data);
            } catch (err) {
                console.error("Fetch analytics error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // SVG Area Chart for User Registrations with animated left-to-right path drawing
    const renderAreaChart = (data, isVisible) => {
        if (!data || data.length === 0) return null;
        const width = 500;
        const height = 160;
        const padding = 30;
        const maxVal = Math.max(...data.map((d) => d.count), 5);

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
                    <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <style>{`
                    @keyframes drawPathLine {
                        0% { stroke-dashoffset: 1200; }
                        100% { stroke-dashoffset: 0; }
                    }
                    @keyframes fadeInGraphArea {
                        0% { opacity: 0; }
                        100% { opacity: 1; }
                    }
                    @keyframes popInNode {
                        0% { opacity: 0; transform: scale(0.5); }
                        100% { opacity: 1; transform: scale(1); }
                    }
                    @keyframes growHorizontalBar {
                        0% { width: 0%; }
                    }
                    @keyframes cardFadeUp {
                        0% { opacity: 0; transform: translateY(12px); }
                        100% { opacity: 1; transform: translateY(0); }
                    }
                    .chart-draw-line {
                        stroke-dasharray: 1200;
                        stroke-dashoffset: 1200;
                    }
                    .chart-draw-line.active {
                        animation: drawPathLine 4.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                    }
                    .chart-area-fill.active {
                        animation: fadeInGraphArea 1.2s ease-out 2.8s forwards;
                    }
                `}</style>

                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ffffff" strokeOpacity="0.1" />
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#ffffff" strokeOpacity="0.05" />

                {/* Animated Gradient Area */}
                <path d={areaPath} fill="url(#regGrad)" className={`chart-area-fill ${isVisible ? "active" : ""}`} />

                {/* Animated Line drawing left-to-right */}
                <path
                    d={linePath}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`chart-draw-line ${isVisible ? "active" : ""}`}
                />

                {/* Staggered Data Point Nodes & Value Labels */}
                {points.map((p, i) => {
                    const delaySeconds = (i / (points.length - 1)) * 3.4 + 0.3;
                    return (
                        <g
                            key={i}
                            style={{
                                opacity: isVisible ? 0 : 0,
                                animation: isVisible ? `popInNode 0.4s ease-out ${delaySeconds}s forwards` : "none",
                                transformOrigin: `${p.x}px ${p.y}px`,
                            }}
                        >
                            <circle cx={p.x} cy={p.y} r="5" fill="#0d0e15" stroke="#f97316" strokeWidth="2.5" />
                            <text x={p.x} y={height - 8} fill="#ffffff" fillOpacity="0.45" fontSize="10" textAnchor="middle" fontWeight="500">
                                {data[i].label}
                            </text>
                            <text x={p.x} y={p.y - 10} fill="#f97316" fontSize="10" fontWeight="bold" textAnchor="middle">
                                {data[i].count}
                            </text>
                        </g>
                    );
                })}
            </svg>
        );
    };

    // SVG Line Chart for Daily Active Users with animated drawing
    const renderLineChart = (data, isVisible) => {
        if (!data || data.length === 0) return null;
        const width = 500;
        const height = 160;
        const padding = 30;
        const maxVal = Math.max(...data.map((d) => d.count), 5);

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

                {/* Animated Line drawing left-to-right */}
                <path
                    d={linePath}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`chart-draw-line ${isVisible ? "active" : ""}`}
                />

                {/* Staggered Data Point Nodes & Value Labels */}
                {points.map((p, i) => {
                    const delaySeconds = (i / (points.length - 1)) * 3.4 + 0.3;
                    return (
                        <g
                            key={i}
                            style={{
                                opacity: isVisible ? 0 : 0,
                                animation: isVisible ? `popInNode 0.4s ease-out ${delaySeconds}s forwards` : "none",
                                transformOrigin: `${p.x}px ${p.y}px`,
                            }}
                        >
                            <circle cx={p.x} cy={p.y} r="5" fill="#0d0e15" stroke="#3b82f6" strokeWidth="2.5" />
                            <text x={p.x} y={height - 8} fill="#ffffff" fillOpacity="0.45" fontSize="10" textAnchor="middle" fontWeight="500">
                                {data[i].label}
                            </text>
                            <text x={p.x} y={p.y - 10} fill="#3b82f6" fontSize="10" fontWeight="bold" textAnchor="middle">
                                {data[i].count}
                            </text>
                        </g>
                    );
                })}
            </svg>
        );
    };

    // Swap Request Status Bar Chart with scroll fill animation
    const renderSwapStatusChart = (swapData, isVisible) => {
        if (!swapData || swapData.length === 0) return null;
        const colorMap = {
            accepted: "#22c55e",
            pending: "#f97316",
            rejected: "#ef4444",
            cancelled: "#a855f7",
            expired: "#64748b",
        };

        const total = swapData.reduce((acc, curr) => acc + curr.count, 0) || 1;

        return (
            <div className="space-y-4 pt-2">
                {/* Animated Segmented Progress Bar */}
                <div className="flex h-4 w-full overflow-hidden rounded-full bg-white/5 p-0.5">
                    {swapData.map((item) => {
                        const pct = Math.round((item.count / total) * 100) || 0;
                        if (pct === 0) return null;
                        return (
                            <div
                                key={item.status}
                                style={{
                                    width: `${pct}%`,
                                    backgroundColor: colorMap[item.status] || "#f97316",
                                    animation: isVisible ? "growHorizontalBar 3.8s cubic-bezier(0.25, 1, 0.5, 1) forwards" : "none",
                                }}
                                title={`${item.status}: ${item.count} (${pct}%)`}
                                className="h-full first:rounded-l-full last:rounded-r-full overflow-hidden"
                            />
                        );
                    })}
                </div>

                {/* Staggered Status Detail Cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 pt-2">
                    {swapData.map((item, idx) => {
                        const color = colorMap[item.status] || "#f97316";
                        return (
                            <div
                                key={item.status}
                                style={{
                                    opacity: isVisible ? 0 : 0,
                                    animation: isVisible ? `cardFadeUp 0.5s ease-out ${0.2 * idx + 0.5}s forwards` : "none",
                                }}
                                className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                            >
                                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                                <div>
                                    <p className="text-xs capitalize text-white/50">{item.status}</p>
                                    <p className="text-sm font-bold text-white mt-0.5">{item.count}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Category Distribution Bars with scroll fill animation
    const renderCategoryDistribution = (categories, isVisible) => {
        if (!categories || categories.length === 0) return null;
        const maxCount = Math.max(...categories.map((c) => c.count), 1);

        return (
            <div className="space-y-3.5 pt-2">
                {categories.map((cat, idx) => {
                    const pct = Math.round((cat.count / maxCount) * 100);
                    return (
                        <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                                <span className="font-semibold text-white/80">{cat.category}</span>
                                <span className="font-bold text-orange-400">{cat.count} Skills</span>
                            </div>
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5">
                                <div
                                    style={{
                                        width: `${pct}%`,
                                        animation: isVisible ? `growHorizontalBar 3.8s cubic-bezier(0.25, 1, 0.5, 1) ${idx * 0.25}s forwards` : "none",
                                    }}
                                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Interaction Modes Preference with scroll scale & fill animation
    const renderInteractionModes = (modes, isVisible) => {
        if (!modes || modes.length === 0) return null;
        const total = modes.reduce((acc, curr) => acc + curr.count, 0) || 1;

        return (
            <div className="space-y-4 pt-2">
                <div className="grid gap-3 sm:grid-cols-3">
                    {modes.map((m, idx) => {
                        const pct = Math.round((m.count / total) * 100);
                        const icons = [FiGlobe, FiUsers, FiRepeat];
                        const Icon = icons[idx % icons.length];
                        return (
                            <div
                                key={idx}
                                style={{
                                    opacity: isVisible ? 0 : 0,
                                    animation: isVisible ? `cardFadeUp 0.6s ease-out ${idx * 0.3 + 0.3}s forwards` : "none",
                                }}
                                className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center"
                            >
                                <Icon className="mx-auto text-xl text-orange-400 mb-2" />
                                <p className="text-xs text-white/50">{m.mode}</p>
                                <p className="text-lg font-bold text-white mt-1">{m.count}</p>
                                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                                    <div
                                        style={{
                                            width: `${pct}%`,
                                            animation: isVisible ? `growHorizontalBar 3.5s cubic-bezier(0.25, 1, 0.5, 1) ${idx * 0.3 + 0.4}s forwards` : "none",
                                        }}
                                        className="h-full rounded-full bg-purple-500"
                                    />
                                </div>
                                <p className="text-[11px] text-orange-400 font-medium mt-[15px]">{pct}% Users</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const summary = statsData?.summary || {};
    const charts = statsData?.charts || {};

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Platform Analytics & Growth</h1>
                <p className="mt-1 text-sm text-white/40">
                    Real-time metrics, user engagements, swap request health, and skill distribution analytics
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <FiLoader className="text-3xl text-orange-500 animate-spin" />
                </div>
            ) : (
                <>
                    {/* Top KPI Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-white/10 bg-[#0d0e15] p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs uppercase tracking-wider text-white/40 font-semibold">Total Users</span>
                                <FiUsers className="text-lg text-orange-400" />
                            </div>
                            <p className="mt-3 text-2xl font-bold text-white">{summary.totalUsers || 0}</p>
                            <p className="mt-1 text-xs text-green-400 font-medium">
                                +{summary.newUsersThisMonth || 0} registered this month
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-[#0d0e15] p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs uppercase tracking-wider text-white/40 font-semibold">Swap Success Rate</span>
                                <FiAward className="text-lg text-green-400" />
                            </div>
                            <p className="mt-3 text-2xl font-bold text-white">{charts.successfulSwapRate || 0}%</p>
                            <p className="mt-1 text-xs text-white/40">{summary.acceptedSwaps || 0} accepted swaps</p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-[#0d0e15] p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs uppercase tracking-wider text-white/40 font-semibold">Teaching / Learning</span>
                                <FiRepeat className="text-lg text-blue-400" />
                            </div>
                            <p className="mt-3 text-2xl font-bold text-white">
                                {summary.teachingSkills || 0} / {summary.learningSkills || 0}
                            </p>
                            <p className="mt-1 text-xs text-blue-400 font-medium">Registered skills ratio</p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-[#0d0e15] p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs uppercase tracking-wider text-white/40 font-semibold">Messages Today</span>
                                <FiTrendingUp className="text-lg text-amber-400" />
                            </div>
                            <p className="mt-3 text-2xl font-bold text-white">{summary.messagesToday || 0}</p>
                            <p className="mt-1 text-xs text-amber-400 font-medium">Real-time interactions</p>
                        </div>
                    </div>

                    {/* Main Charts Grid */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* 1. User Registrations */}
                        <AnimatedCard className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                            {(isVisible) => (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                                            <FiTrendingUp className="text-orange-400" /> User Registrations (Monthly)
                                        </h3>
                                    </div>
                                    <div className="h-56 flex items-end">{renderAreaChart(charts.registrationsOverTime, isVisible)}</div>
                                </>
                            )}
                        </AnimatedCard>

                        {/* 2. Daily Active Users */}
                        <AnimatedCard className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                            {(isVisible) => (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                                            <FiUsers className="text-blue-400" /> Daily Active Users (7 Days)
                                        </h3>
                                    </div>
                                    <div className="h-56 flex items-end">{renderLineChart(charts.dailyActiveUsers, isVisible)}</div>
                                </>
                            )}
                        </AnimatedCard>

                        {/* 3. Swap Requests Breakdown */}
                        <AnimatedCard className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                            {(isVisible) => (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                                            <FiBarChart2 className="text-green-400" /> Swap Request Outcomes Breakdown
                                        </h3>
                                    </div>
                                    {renderSwapStatusChart(charts.swapByStatus, isVisible)}
                                </>
                            )}
                        </AnimatedCard>

                        {/* 4. Popular Skill Categories */}
                        <AnimatedCard className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                            {(isVisible) => (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                                            <FiPieChart className="text-amber-400" /> Top Skill Categories
                                        </h3>
                                    </div>
                                    {renderCategoryDistribution(charts.popularCategories, isVisible)}
                                </>
                            )}
                        </AnimatedCard>

                        {/* 5. Skill Interaction Modes */}
                        <AnimatedCard className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6 md:col-span-2">
                            {(isVisible) => (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                                            <FiGlobe className="text-purple-400" /> Preferred Teaching & Learning Interaction Modes
                                        </h3>
                                    </div>
                                    {renderInteractionModes(charts.interactionModes, isVisible)}
                                </>
                            )}
                        </AnimatedCard>
                    </div>
                </>
            )}
        </div>
    );
}
