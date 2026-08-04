import { useState, useEffect } from "react";
import { FiLoader } from "react-icons/fi";
import axiosClient from "../../api/axiosClient";

export default function AdminReports() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get("/contact?limit=100");
                setTickets(response.data?.data || []);
            } catch (err) {
                console.error("Fetch reports error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    const safetyReports = tickets.filter((t) => t.category === "safety");

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                <h2 className="text-lg font-bold mb-4">User Conduct & Content Reports</h2>
                {loading ? (
                    <div className="flex justify-center py-10">
                        <FiLoader className="text-2xl text-orange-500 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {safetyReports.map((t) => (
                            <div key={t._id} className="border border-white/10 rounded-2xl p-4 bg-white/[0.01] text-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-red-400">{t.subject}</span>
                                    <span className="text-xs text-white/35">
                                        Reported by {t.name} ({t.email})
                                    </span>
                                </div>
                                <p className="text-gray-300 leading-relaxed bg-white/5 p-3 rounded-xl mt-2">{t.message}</p>
                            </div>
                        ))}
                        {safetyReports.length === 0 && (
                            <p className="text-sm text-white/35 text-center py-6">No behavioral safety reports logged.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
