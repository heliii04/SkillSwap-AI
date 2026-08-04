import { useState, useEffect } from "react";
import { FiLoader } from "react-icons/fi";
import axiosClient from "../../api/axiosClient";

export default function AdminSwaps() {
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get("/admin/stats");
                setStatsData(response.data?.data);
            } catch (err) {
                console.error("Fetch stats error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                <h2 className="text-lg font-bold mb-4">All Swap Proposals</h2>
                {loading ? (
                    <div className="flex justify-center py-10">
                        <FiLoader className="text-2xl text-orange-500 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {statsData?.recentActivity?.recentSwapRequests?.map((r) => (
                            <div
                                key={r._id}
                                className="border border-white/10 rounded-2xl p-4 bg-white/[0.01] flex items-center justify-between text-sm"
                            >
                                <div>
                                    <p className="font-semibold text-white">
                                        {r.sender?.name} ({r.sender?.email})
                                    </p>
                                    <p className="text-xs text-white/35 mt-1">
                                        Proposing:{" "}
                                        <span className="text-orange-400 font-medium">{r.senderSkill?.title}</span> for{" "}
                                        <span className="text-blue-400 font-medium">{r.receiverSkill?.title}</span>
                                    </p>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 font-semibold text-xs capitalize">
                                    {r.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
