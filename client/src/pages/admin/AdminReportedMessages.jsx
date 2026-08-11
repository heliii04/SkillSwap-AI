import { useState, useEffect } from "react";
import { FiLoader, FiMessageSquare, FiCheckCircle, FiTrash2, FiSlash } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";

export default function AdminReportedMessages() {
    const [flaggedReports, setFlaggedReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFlaggedMessages = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get("/reports/admin?targetType=message");
            setFlaggedReports(response.data?.data?.reports || []);
        } catch (err) {
            console.error("Fetch flagged messages error:", err);
            toast.error("Failed to load flagged messages.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlaggedMessages();
    }, []);

    const handleAction = async (reportId, status, actionTaken) => {
        try {
            await axiosClient.patch(`/reports/admin/${reportId}`, {
                status,
                actionTaken,
                adminNotes: `Moderation action (${actionTaken}) taken on reported message.`
            });
            toast.success("Moderation action applied successfully.");
            fetchFlaggedMessages();
        } catch (err) {
            console.error("Update message status error:", err);
            toast.error("Failed to update status.");
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
                    <FiMessageSquare className="text-orange-500" /> Flagged Chat Messages
                </h2>
                <p className="text-xs text-white/45">Review reported messages from peer-to-peer chats and moderate abusive users.</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <FiLoader className="text-3xl text-orange-500 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {flaggedReports.map((report) => (
                            <div key={report._id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm">
                                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                    <span className="font-semibold text-white/70">Report ID #{report._id.slice(-6)}</span>
                                    <span className="text-xs text-white/40">{new Date(report.createdAt).toLocaleString()}</span>
                                </div>

                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-white/40 font-semibold uppercase">Reporter</p>
                                        <p className="text-sm font-medium text-white">{report.reporter?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/40 font-semibold uppercase">Reported Sender</p>
                                        <p className="text-sm font-medium text-red-400">{report.reportedUser?.name || "Unknown"}</p>
                                    </div>
                                </div>

                                <div className="mt-3 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-200">
                                    <span className="font-semibold">Reason: {report.reason.replace("_", " ")}</span>
                                    <p className="mt-1 text-white/80">{report.description}</p>
                                </div>

                                {report.status === "pending" ? (
                                    <div className="mt-4 flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => handleAction(report._id, "resolved", "warning_sent")}
                                            className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 text-xs font-semibold hover:bg-emerald-500/20 transition"
                                        >
                                            <FiCheckCircle /> Mark Safe / Resolved
                                        </button>
                                        {report.reportedUser && (
                                            <button
                                                onClick={() => handleAction(report._id, "resolved", "user_suspended")}
                                                className="flex items-center gap-1.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 px-4 py-2 text-xs font-semibold hover:bg-red-600/30 transition"
                                            >
                                                <FiSlash /> Suspend Sender Account
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mt-3 text-xs text-emerald-400 font-semibold flex items-center gap-1">
                                        <FiCheckCircle /> Resolved ({report.actionTaken})
                                    </div>
                                )}
                            </div>
                        ))}

                        {flaggedReports.length === 0 && (
                            <div className="py-10 text-center text-white/35 text-sm flex items-center justify-center gap-2">
                                <FiCheckCircle className="text-emerald-400 text-lg" />
                                No flagged chat messages currently pending. Safe chat filters are working!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
