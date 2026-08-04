import { useState, useEffect } from "react";
import { FiLoader } from "react-icons/fi";
import axiosClient from "../../api/axiosClient";

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

    const renderAreaChart = (data) => {
        if (!data || data.length === 0) return null;
        const width = 500;
        const height = 150;
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

    return (
        <div className="space-y-8 animate-fade-in">
            {loading ? (
                <div className="flex justify-center py-10">
                    <FiLoader className="text-2xl text-orange-500 animate-spin" />
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                        <h3 className="text-sm font-semibold text-white/70 tracking-wide uppercase mb-4">
                            User Registrations
                        </h3>
                        <div className="h-56 flex items-end">{renderAreaChart(statsData?.charts?.registrationsOverTime)}</div>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                        <h3 className="text-sm font-semibold text-white/70 tracking-wide uppercase mb-4">
                            Daily Active Users
                        </h3>
                        <div className="h-56 flex items-end">{renderLineChart(statsData?.charts?.dailyActiveUsers)}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
