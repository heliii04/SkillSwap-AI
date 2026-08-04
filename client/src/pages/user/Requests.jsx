import {
    useMemo,
    useState,
    useEffect,
} from "react";

import { useNavigate } from "react-router-dom";

import { getAccessToken } from "../../api/tokenStore";

import {
    HiOutlineAcademicCap,
    HiOutlineArrowRight,
    HiOutlineCheck,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineEnvelope,
    HiOutlineMagnifyingGlass,
    HiOutlineMapPin,
    HiOutlinePaperAirplane,
    HiOutlineSparkles,
    HiOutlineUserGroup,
    HiOutlineXMark,
} from "react-icons/hi2";

const formatAvailability = (availability) => {
    if (!availability) return "Flexible";
    if (typeof availability === "string") return availability;
    
    const timeSlot = availability.timeSlot ? availability.timeSlot.charAt(0).toUpperCase() + availability.timeSlot.slice(1) : "";
    const days = availability.days && availability.days.length > 0 
        ? availability.days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(", ") 
        : "";
        
    if (timeSlot && days) {
        return `${timeSlot} (${days})`;
    }
    return timeSlot || days || "Flexible";
};

const tabs = [
    {
        value: "all",
        label: "All requests",
    },
    {
        value: "incoming",
        label: "Incoming",
    },
    {
        value: "sent",
        label: "Sent",
    },
    {
        value: "accepted",
        label: "Accepted",
    },
    {
        value: "rejected",
        label: "Rejected",
    },
];

export default function Requests() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const [
        activeTab,
        setActiveTab,
    ] = useState("all");

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        selectedRequest,
        setSelectedRequest,
    ] = useState(null);

    const [
        actionLoadingId,
        setActionLoadingId,
    ] = useState(null);

    const [
        message,
        setMessage,
    ] = useState("");

    const openChat = async (swapRequestId) => {
        try {
            setActionLoadingId(swapRequestId);
            setMessage("");

            const API_URL =
                import.meta.env.VITE_API_URL ||
                "http://localhost:5000/api";

            const token = getAccessToken();
            const headers = {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };

            const response = await fetch(`${API_URL}/chats`, {
                method: "POST",
                headers,
                credentials: "include",
                body: JSON.stringify({ swapRequestId }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Failed to start or locate chat");
            }

            const resData = await response.json();
            const chatId = resData?.data?.chat?.id;

            if (chatId) {
                navigate(`/messages?chatId=${chatId}`);
            } else {
                throw new Error("Chat ID was not returned by the server");
            }
        } catch (err) {
            console.error("Error opening chat:", err);
            alert(err.message || "Failed to open chat");
        } finally {
            setActionLoadingId(null);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const API_URL =
            import.meta.env.VITE_API_URL ||
            "http://localhost:5000/api";

        const fetchRequests = async () => {
            try {
                const token = getAccessToken();
                const headers = {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                };

                const [receivedRes, sentRes] = await Promise.all([
                    fetch(`${API_URL}/swap-requests/received?limit=50`, { credentials: "include", headers }),
                    fetch(`${API_URL}/swap-requests/sent?limit=50`, { credentials: "include", headers })
                ]);

                if (receivedRes.ok && sentRes.ok) {
                    const receivedData = await receivedRes.json();
                    const sentData = await sentRes.json();

                    const receivedReqs = (receivedData?.data?.requests || []).map(req => ({
                        ...req,
                        direction: "incoming",
                        user: {
                            name: req.sender?.name || "User",
                            initials: req.sender?.name 
                                ? req.sender.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                                : "U",
                            role: req.sender?.headline || "SkillSwap member",
                            location: req.sender?.location 
                                ? [req.sender.location.city, req.sender.location.country].filter(Boolean).join(", ")
                                : "Unknown Location",
                            verified: true,
                        },
                        offeredSkill: req.senderSkill || { title: "None", level: "" },
                        requestedSkill: req.receiverSkill || { title: "None", level: "" },
                        mode: req.senderSkill?.teachingMode || "online",
                        preferredTime: formatAvailability(req.senderSkill?.availability)
                    }));

                    const sentReqs = (sentData?.data?.requests || []).map(req => ({
                        ...req,
                        direction: "sent",
                        user: {
                            name: req.receiver?.name || "User",
                            initials: req.receiver?.name 
                                ? req.receiver.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                                : "U",
                            role: req.receiver?.headline || "SkillSwap member",
                            location: req.receiver?.location 
                                ? [req.receiver.location.city, req.receiver.location.country].filter(Boolean).join(", ")
                                : "Unknown Location",
                            verified: true,
                        },
                        offeredSkill: req.senderSkill || { title: "None", level: "" },
                        requestedSkill: req.receiverSkill || { title: "None", level: "" },
                        mode: req.receiverSkill?.teachingMode || "online",
                        preferredTime: formatAvailability(req.receiverSkill?.availability)
                    }));

                    const merged = [...receivedReqs, ...sentReqs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                    if (isMounted) {
                        setRequests(merged);
                        setLoading(false);
                    }
                }
            } catch (err) {
                console.error("Error fetching requests:", err);
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchRequests();
        return () => {
            isMounted = false;
        };
    }, []);

    const counts = useMemo(
        () => ({
            total:
                requests.length,

            incoming:
                requests.filter(
                    (request) =>
                        request.direction ===
                        "incoming" &&
                        request.status ===
                        "pending"
                ).length,

            sent:
                requests.filter(
                    (request) =>
                        request.direction ===
                        "sent" &&
                        request.status ===
                        "pending"
                ).length,

            accepted:
                requests.filter(
                    (request) =>
                        request.status ===
                        "accepted"
                ).length,
        }),
        [requests]
    );

    const filteredRequests =
        useMemo(() => {
            const searchValue =
                search
                    .trim()
                    .toLowerCase();

            return requests.filter(
                (request) => {
                    const matchesTab =
                        activeTab === "all" ||
                        (activeTab ===
                            "incoming" &&
                            request.direction ===
                            "incoming") ||
                        (activeTab ===
                            "sent" &&
                            request.direction ===
                            "sent") ||
                        request.status ===
                        activeTab;

                    const searchableText = [
                        request.user.name,
                        request.user.role,
                        request.user.location,
                        request.offeredSkill
                            .title,
                        request.requestedSkill
                            .title,
                        request.message,
                    ]
                        .join(" ")
                        .toLowerCase();

                    const matchesSearch =
                        !searchValue ||
                        searchableText.includes(
                            searchValue
                        );

                    return (
                        matchesTab &&
                        matchesSearch
                    );
                }
            );
        }, [
            requests,
            activeTab,
            search,
        ]);

    const updateStatus = async (
        requestId,
        status
    ) => {
        try {
            setActionLoadingId(
                requestId
            );
            setMessage("");

            const API_URL =
                import.meta.env.VITE_API_URL ||
                "http://localhost:5000/api";

            const token = getAccessToken();
            const headers = {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            };

            const action = status === "accepted" ? "accept" : status === "rejected" ? "reject" : status;
            const response = await fetch(`${API_URL}/swap-requests/${requestId}/${action}`, {
                method: "PATCH",
                headers,
                credentials: "include"
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || `Failed to ${status} request`);
            }

            setRequests(
                (current) =>
                    current.map(
                        (request) =>
                            request.id ===
                                requestId
                                ? {
                                    ...request,
                                    status,
                                }
                                : request
                    )
            );

            setSelectedRequest(
                (current) =>
                    current?.id ===
                        requestId
                        ? {
                            ...current,
                            status,
                        }
                        : current
            );

            if (
                status ===
                "accepted"
            ) {
                setMessage(
                    "Request accepted successfully."
                );
            }

            if (
                status ===
                "rejected"
            ) {
                setMessage(
                    "Request rejected successfully."
                );
            }
        } catch (err) {
            console.error(`Error updating request status to ${status}:`, err);
            alert(err.message || `Failed to ${status} request`);
        } finally {
            setActionLoadingId(
                null
            );
        }
    };

    const cancelRequest = async (
        requestId
    ) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to cancel this request?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoadingId(
                requestId
            );
            setMessage("");

            const API_URL =
                import.meta.env.VITE_API_URL ||
                "http://localhost:5000/api";

            const token = getAccessToken();
            const headers = {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            };

            const response = await fetch(`${API_URL}/swap-requests/${requestId}/cancel`, {
                method: "PATCH",
                headers,
                credentials: "include"
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Failed to cancel request");
            }

            setRequests(
                (current) =>
                    current.filter(
                        (request) =>
                            request.id !==
                            requestId
                    )
            );

            setSelectedRequest(null);

            setMessage(
                "Request cancelled successfully."
            );
        } catch (err) {
            console.error("Error cancelling request:", err);
            alert(err.message || "Failed to cancel request");
        } finally {
            setActionLoadingId(
                null
            );
        }
    };

    return (
        <main className="px-4 pb-12 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1500px]">
                <RequestsHero />

                {message && (
                    <SuccessAlert
                        message={message}
                        onClose={() =>
                            setMessage("")
                        }
                    />
                )}

                <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Total requests"
                        value={counts.total}
                        icon={
                            HiOutlineEnvelope
                        }
                    />

                    <StatCard
                        label="Incoming"
                        value={
                            counts.incoming
                        }
                        icon={
                            HiOutlineUserGroup
                        }
                    />

                    <StatCard
                        label="Sent"
                        value={counts.sent}
                        icon={
                            HiOutlinePaperAirplane
                        }
                    />

                    <StatCard
                        label="Accepted"
                        value={
                            counts.accepted
                        }
                        icon={
                            HiOutlineCheckCircle
                        }
                    />
                </section>

                <section className="mt-8">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">
                            Skill exchanges
                        </p>

                        <h2 className="mt-2 text-2xl font-semibold">
                            Manage your requests
                        </h2>

                        <p className="mt-2 text-sm text-white/40">
                            Review incoming
                            requests and track the
                            requests you have sent.
                        </p>
                    </div>

                    <div className="mt-5 rounded-[24px] border border-white/10 bg-[#101117] p-4 sm:p-5">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <RequestTabs
                                activeTab={
                                    activeTab
                                }
                                onChange={
                                    setActiveTab
                                }
                            />

                            <div className="relative w-full xl:max-w-sm">
                                <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-white/25" />

                                <input
                                    type="search"
                                    value={
                                        search
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setSearch(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Search requests..."
                                    className="w-full rounded-xl border border-white/10 bg-[#090a0f] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-orange-500/60"
                                />
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="mt-8 flex min-h-[300px] items-center justify-center rounded-[24px] border border-white/10 bg-[#101117]">
                            <div className="text-center">
                                <p className="text-sm text-white/45">Loading requests...</p>
                            </div>
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <EmptyState
                            activeTab={
                                activeTab
                            }
                            onReset={() => {
                                setActiveTab(
                                    "all"
                                );
                                setSearch("");
                            }}
                        />
                    ) : (
                        <div className="mt-5 space-y-4">
                            {filteredRequests.map(
                                (
                                    request
                                ) => (
                                    <RequestCard
                                        key={
                                            request.id
                                        }
                                        request={
                                            request
                                        }
                                        loading={
                                            actionLoadingId ===
                                            request.id
                                        }
                                        onView={() =>
                                            setSelectedRequest(
                                                request
                                            )
                                        }
                                        onAccept={() =>
                                            updateStatus(
                                                request.id,
                                                "accepted"
                                            )
                                        }
                                        onReject={() =>
                                            updateStatus(
                                                request.id,
                                                "rejected"
                                            )
                                        }
                                        onCancel={() =>
                                            cancelRequest(
                                                request.id
                                            )
                                        }
                                        onOpenChat={() =>
                                            openChat(
                                                request.id
                                            )
                                        }
                                    />
                                )
                            )}
                        </div>
                    )}
                </section>
            </div>

            {selectedRequest && (
                <RequestModal
                    request={
                        selectedRequest
                    }
                    loading={
                        actionLoadingId ===
                        selectedRequest.id
                    }
                    onClose={() =>
                        setSelectedRequest(
                            null
                        )
                    }
                    onAccept={() =>
                        updateStatus(
                            selectedRequest.id,
                            "accepted"
                        )
                    }
                    onReject={() =>
                        updateStatus(
                            selectedRequest.id,
                            "rejected"
                        )
                    }
                    onCancel={() =>
                        cancelRequest(
                            selectedRequest.id
                        )
                    }
                    onOpenChat={() =>
                        openChat(
                            selectedRequest.id
                        )
                    }
                />
            )}
        </main>
    );
}

function RequestsHero() {
    return (
        <section className="relative overflow-hidden rounded-[28px] border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-[#111218] to-[#0d0e13] p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />

            <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
                    <HiOutlineEnvelope className="text-lg" />
                    Match Requests
                </div>

                <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">
                    Manage your skill exchange
                    requests.
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">
                    Accept suitable partners,
                    reject unwanted requests and
                    keep track of the skill swaps
                    you have already sent.
                </p>
            </div>
        </section>
    );
}

function RequestTabs({
    activeTab,
    onChange,
}) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => {
                const active =
                    activeTab ===
                    tab.value;

                return (
                    <button className="font-bold"
                        key={tab.value}
                        type="button"
                        onClick={() =>
                            onChange(
                                tab.value
                            )
                        }
                        className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${active
                                ? "bg-orange-500 text-black"
                                : "border border-white/10 bg-[#090a0f] text-white/40 hover:border-orange-500/30 hover:text-white"
                            }`}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}

function RequestCard({
    request,
    loading,
    onView,
    onAccept,
    onReject,
    onCancel,
    onOpenChat,
}) {
    return (
        <article className="rounded-[24px] border border-white/10 bg-[#101117] p-5 transition hover:border-orange-500/30 sm:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                    <Avatar
                        user={request.user}
                    />

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-semibold">
                                {
                                    request.user
                                        .name
                                }
                            </h3>

                            <DirectionBadge
                                direction={
                                    request.direction
                                }
                            />

                            <StatusBadge
                                status={
                                    request.status
                                }
                            />
                        </div>

                        <p className="mt-1 text-sm text-white/45">
                            {
                                request.user
                                    .role
                            }
                        </p>

                        <div className="mt-2 flex flex-wrap gap-4 text-xs text-white/30">
                            <span className="inline-flex items-center gap-1.5">
                                <HiOutlineMapPin className="text-orange-400" />

                                {
                                    request.user
                                        .location
                                }
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                                <HiOutlineClock className="text-orange-400" />

                                {formatDate(
                                    request.createdAt
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                    <SkillBox
                        label={
                            request.direction ===
                                "incoming"
                                ? "They offer"
                                : "You offer"
                        }
                        skill={
                            request.offeredSkill
                        }
                    />

                    <span className="hidden h-10 w-10 items-center justify-center rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-400 sm:flex">
                        <HiOutlineArrowRight className="animate-arrow-move"  />
                    </span>

                    <SkillBox
                        label={
                            request.direction ===
                                "incoming"
                                ? "They want"
                                : "You want"
                        }
                        skill={
                            request.requestedSkill
                        }
                    />
                </div>
            </div>

            <p className="mt-5 line-clamp-2 text-sm leading-7 text-white/40">
                {request.message}
            </p>

            <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-3 text-xs text-white/35">
                    <span className="rounded-lg border border-white/10 px-3 py-2 capitalize">
                        {request.mode}
                    </span>

                    <span className="rounded-lg border border-white/10 px-3 py-2">
                        {
                            request.preferredTime
                        }
                    </span>
                </div>

                <RequestActions
                    request={request}
                    loading={loading}
                    onView={onView}
                    onAccept={onAccept}
                    onReject={onReject}
                    onCancel={onCancel}
                    onOpenChat={onOpenChat}
                />
            </div>
        </article>
    );
}

function RequestActions({
    request,
    loading,
    onView,
    onAccept,
    onReject,
    onCancel,
    onOpenChat,
}) {
    return (
        <div className="flex flex-wrap gap-2">
            <button
                type="button"
                onClick={onView}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm  text-white/50 transition hover:border-orange-500/30 hover:text-orange-400 font-bold"
            >
                View details
            </button>

            {request.direction ===
                "incoming" &&
                request.status ===
                "pending" && (
                    <>
                        <button
                            type="button"
                            onClick={
                                onReject
                            }
                            disabled={
                                loading
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 px-4 py-2.5 text-sm  text-red-300 transition hover:bg-red-500/10 disabled:opacity-50 font-bold"
                        >
                            <HiOutlineXMark />
                            Reject
                        </button>

                        <button
                            type="button"
                            onClick={
                                onAccept
                            }
                            disabled={
                                loading
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm  text-black transition hover:bg-orange-400 disabled:opacity-50 font-bold"
                        >
                            <HiOutlineCheck />
                            Accept
                        </button>
                    </>
                )}

            {request.direction ===
                "sent" &&
                request.status ===
                "pending" && (
                    <button
                        type="button"
                        onClick={
                            onCancel
                        }
                        disabled={
                            loading
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 px-4 py-2.5 text-sm  text-red-300 transition hover:bg-red-500/10 disabled:opacity-50 font-bold"
                    >
                        <HiOutlineXMark />
                        Cancel request
                    </button>
                )}

            {request.status ===
                "accepted" && (
                    <button
                        type="button"
                        onClick={onOpenChat}
                        className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm  text-black transition hover:bg-orange-400 font-bold"
                    >
                        Open chat
                        <HiOutlineArrowRight className="animate-arrow-move"  />
                    </button>
                )}
        </div>
    );
}

function SkillBox({
    label,
    skill,
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-[#090a0f] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-white/25">
                {label}
            </p>

            <p className="mt-2 font-semibold">
                {skill.title}
            </p>

            <p className="mt-1 text-xs capitalize text-orange-400">
                {skill.level}
            </p>
        </div>
    );
}

function Avatar({ user }) {
    return (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500 font-bold text-black">
            {user.initials}
        </div>
    );
}

function DirectionBadge({
    direction,
}) {
    return (
        <span
            className={`rounded-full border px-3 py-1 text-xs capitalize ${direction ===
                    "incoming"
                    ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
                    : "border-purple-500/20 bg-purple-500/10 text-purple-300"
                }`}
        >
            {direction}
        </span>
    );
}

function StatusBadge({ status }) {
    const styles = {
        pending:
            "border-orange-500/20 bg-orange-500/10 text-orange-300",

        accepted:
            "border-green-500/20 bg-green-500/10 text-green-300",

        rejected:
            "border-red-500/20 bg-red-500/10 text-red-300",
    };

    return (
        <span
            className={`rounded-full border px-3 py-1 text-xs capitalize ${styles[status]
                }`}
        >
            {status}
        </span>
    );
}

function RequestModal({
    request,
    loading,
    onClose,
    onAccept,
    onReject,
    onCancel,
    onOpenChat,
}) {
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <button
                type="button"
                aria-label="Close request details"
                onClick={onClose}
                className="absolute inset-0 h-full w-full font-bold"
            />

            <div className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-white/10 bg-[#101117]">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#101117]/95 px-5 py-5 backdrop-blur-xl sm:px-7">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                            Request details
                        </p>

                        <h2 className="mt-2 text-xl font-semibold">
                            Skill exchange
                            request
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-white/10 p-2.5 text-white/50 transition hover:bg-white/5 hover:text-white font-bold"
                    >
                        <HiOutlineXMark className="text-xl" />
                    </button>
                </div>

                <div className="p-5 sm:p-7">
                    <div className="flex items-start gap-4">
                        <Avatar
                            user={
                                request.user
                            }
                        />

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-xl font-semibold">
                                    {
                                        request
                                            .user
                                            .name
                                    }
                                </h3>

                                <DirectionBadge
                                    direction={
                                        request.direction
                                    }
                                />

                                <StatusBadge
                                    status={
                                        request.status
                                    }
                                />
                            </div>

                            <p className="mt-1 text-sm text-white/45">
                                {
                                    request
                                        .user
                                        .role
                                }
                            </p>

                            <div className="mt-2 flex items-center gap-2 text-xs text-white/30">
                                <HiOutlineMapPin className="text-orange-400" />

                                {
                                    request
                                        .user
                                        .location
                                }
                            </div>
                        </div>
                    </div>

                    <div className="mt-7 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                        <SkillBox
                            label={
                                request.direction ===
                                    "incoming"
                                    ? "They offer"
                                    : "You offer"
                            }
                            skill={
                                request.offeredSkill
                            }
                        />

                        <span className="hidden h-11 w-11 items-center justify-center rounded-full bg-orange-500 text-black sm:flex">
                            <HiOutlineArrowRight className="animate-arrow-move"  />
                        </span>

                        <SkillBox
                            label={
                                request.direction ===
                                    "incoming"
                                    ? "They want"
                                    : "You want"
                            }
                            skill={
                                request.requestedSkill
                            }
                        />
                    </div>

                    <div className="mt-6 rounded-2xl border border-white/10 bg-[#090a0f] p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/30">
                            Message
                        </p>

                        <p className="mt-3 text-sm leading-7 text-white/45">
                            {
                                request.message
                            }
                        </p>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <DetailBox
                            label="Mode"
                            value={
                                request.mode
                            }
                            icon={
                                HiOutlineUserGroup
                            }
                        />

                        <DetailBox
                            label="Preferred time"
                            value={
                                request.preferredTime
                            }
                            icon={
                                HiOutlineClock
                            }
                        />

                        <DetailBox
                            label="Requested"
                            value={formatDate(
                                request.createdAt
                            )}
                            icon={
                                HiOutlineAcademicCap
                            }
                        />
                    </div>

                    {request.status ===
                        "accepted" && (
                            <div className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/10 p-5">
                                <div className="flex items-start gap-3">
                                    <HiOutlineCheckCircle className="mt-0.5 shrink-0 text-2xl text-green-300" />

                                    <div>
                                        <p className="font-semibold text-green-200">
                                            Match
                                            accepted
                                        </p>

                                        <p className="mt-2 text-sm leading-7 text-green-100/50">
                                            You can
                                            now start a
                                            conversation
                                            and plan the
                                            first skill
                                            exchange
                                            session.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                    <div className="mt-7 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={
                                onClose
                            }
                            className="rounded-xl border border-white/10 px-5 py-3 text-sm  text-white/55 transition hover:bg-white/5 hover:text-white font-bold"
                        >
                            Close
                        </button>

                        {request.direction ===
                            "incoming" &&
                            request.status ===
                            "pending" && (
                                <>
                                    <button
                                        type="button"
                                        onClick={
                                            onReject
                                        }
                                        disabled={
                                            loading
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 px-5 py-3 text-sm  text-red-300 transition hover:bg-red-500/10 disabled:opacity-50 font-bold"
                                    >
                                        <HiOutlineXMark />
                                        Reject
                                    </button>

                                    <button
                                        type="button"
                                        onClick={
                                            onAccept
                                        }
                                        disabled={
                                            loading
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm  text-black transition hover:bg-orange-400 disabled:opacity-50 font-bold"
                                    >
                                        <HiOutlineCheck />
                                        Accept
                                    </button>
                                </>
                            )}

                        {request.direction ===
                            "sent" &&
                            request.status ===
                            "pending" && (
                                <button
                                    type="button"
                                    onClick={
                                        onCancel
                                    }
                                    disabled={
                                        loading
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 px-5 py-3 text-sm  text-red-300 transition hover:bg-red-500/10 disabled:opacity-50 font-bold"
                                >
                                    <HiOutlineXMark />
                                    Cancel
                                    request
                                </button>
                            )}

                        {request.status ===
                            "accepted" && (
                                <button
                                    type="button"
                                    onClick={onOpenChat}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm  text-black transition hover:bg-orange-400 font-bold"
                                >
                                    Open chat

                                    <HiOutlineArrowRight className="animate-arrow-move"  />
                                </button>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailBox({
    label,
    value,
    icon: Icon,
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-[#090a0f] p-4">
            <Icon className="text-xl text-orange-400" />

            <p className="mt-3 text-xs text-white/30">
                {label}
            </p>

            <p className="mt-1 text-sm font-semibold capitalize">
                {value}
            </p>
        </div>
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
}) {
    return (
        <article className="rounded-2xl border border-white/10 bg-[#101117] p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-3xl font-semibold">
                        {value}
                    </p>

                    <p className="mt-1 text-sm text-white/40">
                        {label}
                    </p>
                </div>

                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                    <Icon className="text-xl" />
                </span>
            </div>
        </article>
    );
}

function SuccessAlert({
    message,
    onClose,
}) {
    return (
        <div className="mt-5 flex items-start justify-between gap-4 rounded-xl border border-green-500/25 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            <div className="flex items-center gap-2">
                <HiOutlineCheckCircle className="shrink-0 text-lg" />

                <p>{message}</p>
            </div>

            <button className="font-bold"
                type="button"
                onClick={onClose}
            >
                <HiOutlineXMark className="text-lg" />
            </button>
        </div>
    );
}

function EmptyState({
    activeTab,
    onReset,
}) {
    return (
        <div className="mt-5 flex min-h-96 flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-[#101117] px-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                <HiOutlineSparkles className="text-3xl" />
            </span>

            <h3 className="mt-5 text-xl font-semibold">
                No requests found
            </h3>

            <p className="mt-2 max-w-md text-sm leading-7 text-white/40">
                There are no requests matching
                the selected{" "}
                <span className="capitalize">
                    {activeTab}
                </span>{" "}
                filter or search term.
            </p>

            <button
                type="button"
                onClick={onReset}
                className="mt-6 rounded-xl bg-orange-500 px-5 py-3 text-sm  text-black transition hover:bg-orange-400 font-bold"
            >
                Show all requests
            </button>
        </div>
    );
}

function formatDate(dateValue) {
    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    ).format(new Date(dateValue));
}

