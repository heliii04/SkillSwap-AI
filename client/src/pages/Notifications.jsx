import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    HiOutlineBell,
    HiOutlineChatBubbleLeftRight,
    HiOutlinePaperAirplane,
    HiOutlineSparkles,
    HiOutlineCheck,
    HiOutlineTrash,
} from "react-icons/hi2";
import { getAccessToken } from "../api/tokenStore";

export default function Notifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");

    const API_URL =
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000/api";

    const fetchNotifications = async () => {
        try {
            const token = getAccessToken();
            if (!token) return;

            const headers = {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            };

            const response = await fetch(`${API_URL}/notifications`, { credentials: "include", headers });
            if (response.ok) {
                const resData = await response.json();
                setNotifications(resData?.data?.notifications || []);
            }
        } catch (err) {
            console.error("Error loading notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAllRead = async () => {
        try {
            const token = getAccessToken();
            if (!token) return;

            const response = await fetch(`${API_URL}/notifications/mark-read`, {
                method: "PATCH",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
            });

            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            }
        } catch (err) {
            console.error("Error marking all read:", err);
        }
    };

    const markSingleRead = async (id) => {
        try {
            const token = getAccessToken();
            if (!token) return;

            const response = await fetch(`${API_URL}/notifications/mark-read`, {
                method: "PATCH",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({ notificationId: id }),
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
                );
            }
        } catch (err) {
            console.error("Error marking read:", err);
        }
    };

    const deleteSingle = async (id, event) => {
        event.stopPropagation();
        try {
            const token = getAccessToken();
            if (!token) return;

            const response = await fetch(`${API_URL}/notifications/${id}`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
            });

            if (response.ok) {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }
        } catch (err) {
            console.error("Error deleting notification:", err);
        }
    };

    const filteredNotifications = useMemo(() => {
        if (activeTab === "all") return notifications;
        if (activeTab === "requests") {
            return notifications.filter(n =>
                ["swap_request", "swap_accepted", "swap_rejected"].includes(n.type)
            );
        }
        if (activeTab === "messages") {
            return notifications.filter(n => n.type === "message");
        }
        if (activeTab === "suggestions") {
            return notifications.filter(n => n.type === "ai_suggestion");
        }
        return notifications;
    }, [notifications, activeTab]);

    const counts = useMemo(() => {
        const unreadList = notifications.filter(n => !n.isRead);
        return {
            all: unreadList.length,
            requests: unreadList.filter(n =>
                ["swap_request", "swap_accepted", "swap_rejected"].includes(n.type)
            ).length,
            messages: unreadList.filter(n => n.type === "message").length,
            suggestions: unreadList.filter(n => n.type === "ai_suggestion").length,
        };
    }, [notifications]);

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await markSingleRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case "swap_request":
            case "swap_accepted":
            case "swap_rejected":
                return <HiOutlinePaperAirplane className="text-blue-400 text-lg" />;
            case "message":
                return <HiOutlineChatBubbleLeftRight className="text-green-400 text-lg" />;
            case "ai_suggestion":
                return <HiOutlineSparkles className="text-orange-400 text-lg" />;
            default:
                return <HiOutlineBell className="text-white/60 text-lg" />;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <main className="px-4 pb-8 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1500px]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold sm:text-3xl">Your Notifications</h1>
                        <p className="mt-1 text-sm text-white/45">
                            Keep track of matching requests, messages, and AI recommendations.
                        </p>
                    </div>

                    {notifications.some(n => !n.isRead) && (
                        <button
                            type="button"
                            onClick={markAllRead}
                            className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                        >
                            <HiOutlineCheck className="text-lg" />
                            Mark all as read
                        </button>
                    )}
                </div>

                <div className="mt-6 flex gap-2 overflow-x-auto border-b border-white/10 pb-3 font-semibold">
                    {[
                        { id: "all", label: "All" },
                        { id: "requests", label: "Swap Requests" },
                        { id: "messages", label: "Chat Messages" },
                        { id: "suggestions", label: "AI Suggestions" },
                    ].map(tab => {
                        const count = counts[tab.id];
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                                    active
                                        ? "bg-orange-500 text-black"
                                        : "text-white/50 hover:bg-white/5 hover:text-white"
                                }`}
                            >
                                {tab.label}
                                {count > 0 && (
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                            active
                                                ? "bg-black text-orange-500"
                                                : "bg-orange-500 text-black"
                                        }`}
                                    >
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {loading ? (
                    <div className="mt-8 flex min-h-[250px] items-center justify-center rounded-3xl border border-white/10 bg-[#101117]">
                        <p className="text-sm text-white/45">Loading notifications...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="mt-8 flex min-h-[250px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#101117] p-6 text-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.02] border border-white/10 text-white/20">
                            <HiOutlineBell className="text-2xl" />
                        </span>
                        <h3 className="mt-4 font-semibold text-white/80">No notifications yet</h3>
                        <p className="mt-2 max-w-sm text-xs leading-5 text-white/35">
                            You're all caught up! New requests, messages, and AI recommendations will show up here.
                        </p>
                    </div>
                ) : (
                    <div className="mt-6 space-y-3">
                        {filteredNotifications.map(notification => (
                            <article
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`group relative flex gap-4 rounded-2xl border p-4 transition duration-200 cursor-pointer ${
                                    notification.isRead
                                        ? "border-white/5 bg-[#101117]/40 hover:border-white/10 hover:bg-[#101117]/60"
                                        : "border-orange-500/20 bg-orange-500/[0.02] hover:border-orange-500/30 hover:bg-orange-500/[0.04]"
                                }`}
                            >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.03] border border-white/10">
                                    {getIcon(notification.type)}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-semibold text-white">
                                            {notification.title}
                                        </h3>
                                        {!notification.isRead && (
                                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                                        )}
                                    </div>
                                    <p className="mt-1 text-xs leading-5 text-white/45">
                                        {notification.message}
                                    </p>
                                    <span className="mt-2 block text-[10px] text-white/25">
                                        {formatDate(notification.createdAt)}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={(e) => deleteSingle(notification.id, e)}
                                    aria-label="Dismiss notification"
                                    className="opacity-0 group-hover:opacity-100 self-start rounded-lg p-1.5 text-white/20 transition hover:bg-white/5 hover:text-white"
                                >
                                    <HiOutlineTrash className="text-lg text-red-500/80" />
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}