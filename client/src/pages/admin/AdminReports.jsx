import { useState, useEffect } from "react";
import { FiLoader, FiShield, FiCheckCircle, FiSlash, FiXCircle, FiFilter, FiAlertTriangle } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";

export default function AdminReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const url = statusFilter === "all" ? "/reports/admin" : `/reports/admin?status=${statusFilter}`;
            const response = await axiosClient.get(url);
            setReports(response.data?.data?.reports || []);
        } catch (err) {
            console.error("Fetch reports error:", err);
            toast.error("Failed to load reports.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [statusFilter]);

    const handleAction = async (reportId, status, actionTaken, customNotes) => {
        setActionLoadingId(reportId);
        try {
            await axiosClient.patch(`/reports/admin/${reportId}`, {
                status,
                actionTaken,
                adminNotes: customNotes || `Moderation action (${actionTaken}) taken by Admin.`
            });
            toast.success(`Report status updated to ${status}.`);
            fetchReports();
        } catch (err) {
            console.error("Update report status error:", err);
            toast.error(err.response?.data?.message || "Failed to update report status.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">Pending Review</span>;
            case "resolved":
                return <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">Resolved</span>;
            case "dismissed":
                return <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/50 border border-white/10">Dismissed</span>;
            default:
                return <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/40">{status}</span>;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FiShield className="text-orange-500" /> User Conduct & Content Moderation
                    </h2>
                    <p className="text-xs text-white/45 mt-1">Review user reports, take action, or suspend policy-violating accounts.</p>
                </div>

                <div className="flex items-center gap-2">
                    <FiFilter className="text-white/40 text-sm" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-xl border border-white/10 bg-[#141622] px-4 py-2 text-xs font-semibold text-white focus:outline-none"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                        <option value="dismissed">Dismissed</option>
                    </select>
                </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <FiLoader className="text-3xl text-orange-500 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reports.map((report) => (
                            <div key={report._id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm transition hover:border-white/20">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <span className="uppercase tracking-wider font-bold text-xs px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                            {report.targetType}
                                        </span>
                                        <span className="font-semibold text-white capitalize">{report.reason.replace("_", " ")}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(report.status)}
                                        <span className="text-xs text-white/35">
                                            {new Date(report.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-3 grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">Reporter</p>
                                        <p className="text-sm font-medium text-white">{report.reporter?.name || "Anonymous"}</p>
                                        <p className="text-xs text-white/40">{report.reporter?.email}</p>
                                    </div>

                                    {report.reportedUser && (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">Reported User</p>
                                            <p className="text-sm font-medium text-red-400">{report.reportedUser?.name}</p>
                                            <p className="text-xs text-white/40">{report.reportedUser?.email} ({report.reportedUser?.accountStatus})</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-3 rounded-xl bg-white/5 p-3 text-xs text-gray-300 leading-relaxed">
                                    <span className="font-semibold text-white/70">Details: </span>
                                    {report.description}
                                </div>

                                <div className="mt-4 flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-white/5">
                                        {report.status === "pending" && (
                                            <button
                                                disabled={actionLoadingId === report._id}
                                                onClick={() => handleAction(report._id, "dismissed", "none")}
                                                className="flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-white/60 hover:bg-white/5 hover:text-white transition disabled:opacity-50"
                                            >
                                                <FiXCircle /> Dismiss Report
                                            </button>
                                        )}

                                        <button
                                            disabled={actionLoadingId === report._id}
                                            onClick={() => {
                                                const customNotes = window.prompt("Enter warning note / resolution message for the user:", "Official warning: Please maintain respectful communication on SkillSwap AI.");
                                                if (customNotes !== null) {
                                                    handleAction(report._id, "resolved", "warning_sent", customNotes);
                                                }
                                            }}
                                            className="flex items-center gap-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 px-4 py-2 text-xs font-semibold hover:bg-amber-500/20 transition disabled:opacity-50"
                                        >
                                            <FiAlertTriangle /> Send Warning
                                        </button>

                                        {report.status === "pending" && (
                                            <button
                                                disabled={actionLoadingId === report._id}
                                                onClick={() => handleAction(report._id, "resolved", "none")}
                                                className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 text-xs font-semibold hover:bg-emerald-500/20 transition disabled:opacity-50"
                                            >
                                                <FiCheckCircle /> Mark Resolved
                                            </button>
                                        )}

                                        {report.status === "pending" && report.reportedUser && (
                                            <button
                                                disabled={actionLoadingId === report._id}
                                                onClick={() => {
                                                    const customNotes = window.prompt("Enter reason for account suspension:", "Suspended due to multiple policy violation reports.");
                                                    if (customNotes !== null) {
                                                        handleAction(report._id, "resolved", "user_suspended", customNotes);
                                                    }
                                                }}
                                                className="flex items-center gap-1.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 px-4 py-2 text-xs font-semibold hover:bg-red-600/30 transition disabled:opacity-50"
                                            >
                                                <FiSlash /> Suspend User
                                            </button>
                                        )}
                                    </div>
                            </div>
                        ))}

                        {reports.length === 0 && (
                            <div className="py-12 text-center text-white/35 text-sm">
                                No reports found matching filter criteria.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
