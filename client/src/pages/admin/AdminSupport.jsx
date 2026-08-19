import { useState, useEffect } from "react";
import {
    FiSearch,
    FiLoader,
    FiX,
    FiMessageSquare,
    FiCheckCircle,
    FiSend,
    FiClock
} from "react-icons/fi";
import axiosClient from "../../api/axiosClient";
import CustomSelect from "../../components/ui/CustomSelect";

export default function AdminSupport() {
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

    const CATEGORY_LABELS = {
        account: "Account Support",
        technical: "Technical Support",
        feature: "Feature Suggestion",
        feedback: "Feedback",
        safety: "Safety/Report",
        other: "Other",
    };

    // Lock background scroll when ticket detail modal is open
    useEffect(() => {
        if (selectedTicket) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [selectedTicket]);

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

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTickets();
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedTicket) return;

        setReplying(true);
        setReplySuccess("");
        try {
            const response = await axiosClient.patch(`/contact/${selectedTicket._id}`, {
                replyMessage: replyText,
                status: "resolved"
            });
            const updated = response.data?.data;
            if (updated) {
                setTickets((prev) => prev.map((t) => (t._id === selectedTicket._id ? updated : t)));
                setSelectedTicket(updated);
                setReplyText("");
                setReplySuccess("Reply sent successfully! Ticket marked as Resolved.");
            }
        } catch (err) {
            console.error("Send reply error:", err);
            alert(err.response?.data?.message || "Failed to send reply email. Please try again.");
        } finally {
            setReplying(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <FiClock className="text-xs" /> Pending
                    </span>
                );
            case "in_progress":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <FiLoader className="text-xs animate-spin" /> In Progress
                    </span>
                );
            case "resolved":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <FiCheckCircle className="text-xs" /> Resolved
                    </span>
                );
            case "dismissed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/50 border border-white/10">
                        Dismissed
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/60">
                        {status}
                    </span>
                );
        }
    };

    const filteredTickets = tickets.filter((ticket) => {
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

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-lg font-bold">Support Inquiries</h2>
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                            <input
                                type="text"
                                placeholder="Search tickets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white outline-none focus:border-orange-500 transition"
                            />
                        </div>
                        <CustomSelect
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            options={[
                                { value: "all", label: "All Status" },
                                { value: "pending", label: "Pending" },
                                { value: "in_progress", label: "In Progress" },
                                { value: "resolved", label: "Resolved" },
                                { value: "dismissed", label: "Dismissed" }
                            ]}
                        />
                        <CustomSelect
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            options={[
                                { value: "all", label: "All Categories" },
                                { value: "account", label: "Account Support" },
                                { value: "technical", label: "Technical Support" },
                                { value: "feature", label: "Feature Suggestion" },
                                { value: "feedback", label: "Feedback" },
                                { value: "safety", label: "Safety/Report" },
                                { value: "other", label: "Other" }
                            ]}
                        />
                    </div>
                </div>

                {ticketsLoading ? (
                    <div className="flex justify-center py-10">
                        <FiLoader className="text-2xl text-orange-500 animate-spin" />
                    </div>
                ) : ticketsError ? (
                    <div className="text-center py-8 text-red-400 bg-red-500/10 rounded-xl">{ticketsError}</div>
                ) : filteredTickets.length === 0 ? (
                    <div className="text-center py-12 text-white/40 border border-white/5 rounded-2xl bg-white/[0.01]">
                        No support tickets found matching your criteria.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-xs font-bold uppercase text-white/60">
                                    <th className="py-3 px-4">User</th>
                                    <th className="py-3 px-4">Subject</th>
                                    <th className="py-3 px-4">Category</th>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {filteredTickets.map((ticket) => (
                                    <tr key={ticket._id} className="hover:bg-white/[0.02] transition">
                                        <td className="py-4 px-4">
                                            <div className="font-semibold text-white">{ticket.name}</div>
                                            <div className="text-xs text-white/40">{ticket.email}</div>
                                        </td>
                                        <td className="py-4 px-4 font-medium text-white/80 max-w-[200px] truncate">
                                            {ticket.subject}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="capitalize text-xs font-semibold text-white/50 bg-white/5 px-2 py-1 rounded-md">
                                                {CATEGORY_LABELS[ticket.category] || ticket.category}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-white/50 text-xs">
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-4">{getStatusBadge(ticket.status)}</td>
                                        <td className="py-4 px-4 text-right">
                                            <button
                                                onClick={() => {
                                                    setReplySuccess("");
                                                    setReplyText("");
                                                    setSelectedTicket(ticket);
                                                }}
                                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Ticket Details & Reply Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#0d0e15] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.01]">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                                    Ticket Details {getStatusBadge(selectedTicket.status)}
                                </h3>
                                <p className="text-xs text-white/40 mt-1">ID: {selectedTicket._id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="text-white/40 hover:text-white transition"
                            >
                                <FiX className="text-2xl" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider block mb-1">
                                        From
                                    </span>
                                    <p className="font-semibold text-white text-sm">{selectedTicket.name}</p>
                                    <p className="text-xs text-orange-400 mt-0.5">{selectedTicket.email}</p>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider block mb-1">
                                        Category & Date
                                    </span>
                                    <p className="font-semibold text-white text-sm capitalize">
                                        {selectedTicket.category}
                                    </p>
                                    <p className="text-xs text-white/50 mt-0.5">
                                        {new Date(selectedTicket.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider block mb-2">
                                    Subject
                                </span>
                                <h4 className="font-bold text-white mb-4 text-lg">{selectedTicket.subject}</h4>
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider block mb-2">
                                    Message
                                </span>
                                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap bg-black/20 p-4 rounded-xl border border-white/5">
                                    {selectedTicket.message}
                                </p>
                            </div>

                            {selectedTicket.status !== "resolved" && (
                                <div className="border-t border-white/10 pt-6 mt-6">
                                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                        <FiMessageSquare className="text-orange-500" /> Send Email Reply
                                    </h4>

                                    {replySuccess ? (
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm font-semibold flex items-center gap-2">
                                            <FiCheckCircle className="text-lg" /> {replySuccess}
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSendReply} className="space-y-4">
                                            <textarea
                                                required
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder={`Write a reply to ${selectedTicket.name}...`}
                                                rows={4}
                                                className="w-full resize-none rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white outline-none focus:border-orange-500 focus:bg-white/[0.02] transition"
                                            />
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-white/35">
                                                    An email will be sent and ticket will be marked as Resolved.
                                                </p>
                                                <button
                                                    type="submit"
                                                    disabled={replying}
                                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 text-black text-sm font-bold hover:bg-orange-400 transition disabled:opacity-50"
                                                >
                                                    {replying ? <FiLoader className="animate-spin" /> : <FiSend />}
                                                    Send Reply
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-5 border-t border-white/10 flex justify-end">
                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
