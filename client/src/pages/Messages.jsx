import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";

import { getAccessToken } from "../api/tokenStore";
import { useAuth } from "../context/AuthContext";

import {
    HiOutlineArrowLeft,
    HiOutlineChatBubbleLeftRight,
    HiOutlineCheck,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineEllipsisVertical,
    HiOutlineMagnifyingGlass,
    HiOutlinePaperAirplane,
    HiOutlinePaperClip,
    HiOutlinePhone,
    HiOutlineUserGroup,
    HiOutlineVideoCamera,
    HiOutlineXMark,
    HiOutlineLockClosed,
    HiOutlineStar,
    HiOutlineFlag,
    HiOutlineNoSymbol,
    HiOutlineTrash,
    HiOutlineLink,
    HiOutlineUser,
} from "react-icons/hi2";

/*
|--------------------------------------------------------------------------
| Dummy conversations
|--------------------------------------------------------------------------
|
| Backend integration ke baad:
|
| GET  /api/v1/chats
  POST /api/v1/chats
  GET  /api/v1/chats/:chatId/messages
  POST /api/v1/chats/:chatId/messages
|
| Aur real-time messaging ke liye Socket.IO use karenge.
|
*/



export default function Messages() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const queryChatId = searchParams.get("chatId");

    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);

    const [
        selectedConversationId,
        setSelectedConversationId,
    ] = useState(null);

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        messageText,
        setMessageText,
    ] = useState("");

    const [
        sending,
        setSending,
    ] = useState(false);

    const [
        mobileChatOpen,
        setMobileChatOpen,
    ] = useState(false);

    const messagesEndRef =
        useRef(null);

    useEffect(() => {
        let isMounted = true;

        const API_URL =
            import.meta.env.VITE_API_URL ||
            "http://localhost:5000/api";

        const fetchConversations = async (showLoading = false) => {
            if (showLoading) {
                setLoading(true);
            }
            try {
                const token = getAccessToken();
                const headers = {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                };

                const response = await fetch(`${API_URL}/chats`, { credentials: "include", headers });
                if (response.ok) {
                    const resData = await response.json();
                    const chats = resData?.data?.chats || [];

                    if (isMounted) {
                        setConversations(chats);

                        if (showLoading) {
                            if (queryChatId) {
                                setSelectedConversationId(queryChatId);
                                setMobileChatOpen(true);
                            } else if (chats.length > 0 && !selectedConversationId) {
                                setSelectedConversationId(chats[0].id);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching conversations:", err);
            } finally {
                if (isMounted && showLoading) {
                    setLoading(false);
                }
            }
        };

        fetchConversations(true);

        const socketHost = API_URL.replace("/api", "");
        const socket = io(socketHost, {
            withCredentials: true,
        });

        const currentUserId = user?.id || user?._id;
        if (currentUserId) {
            socket.emit("register_user", currentUserId);
        }

        socket.on("chat_list_update", (updatedChat) => {
            if (isMounted) {
                setConversations((prev) => {
                    const exists = prev.some((c) => c.id === updatedChat.id);
                    if (exists) {
                        return [
                            updatedChat,
                            ...prev.filter((c) => c.id !== updatedChat.id),
                        ];
                    }
                    return [updatedChat, ...prev];
                });
            }
        });

        return () => {
            isMounted = false;
            socket.disconnect();
        };
    }, [queryChatId, user]);

    useEffect(() => {
        if (!selectedConversationId) {
            setMessages([]);
            return;
        }

        let isMounted = true;

        const API_URL =
            import.meta.env.VITE_API_URL ||
            "http://localhost:5000/api";

        const fetchMessages = async (showLoading = false) => {
            if (showLoading) {
                setMessagesLoading(true);
            }
            try {
                const token = getAccessToken();
                const headers = {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                };

                const response = await fetch(`${API_URL}/chats/${selectedConversationId}/messages`, { credentials: "include", headers });
                if (response.ok) {
                    const resData = await response.json();
                    if (isMounted) {
                        const fetchedMessages = resData?.data?.messages || [];
                        setMessages(fetchedMessages);
                    }
                }
            } catch (err) {
                console.error("Error fetching messages:", err);
            } finally {
                if (isMounted && showLoading) {
                    setMessagesLoading(false);
                }
            }
        };

        fetchMessages(true);

        const socketHost = API_URL.replace("/api", "");
        const socket = io(socketHost, {
            withCredentials: true,
        });

        socket.emit("join_chat", selectedConversationId);

        socket.on("new_message", (msg) => {
            if (isMounted) {
                const currentUserId = user?.id || user?._id;
                const formattedMsg = {
                    id: msg.id,
                    text: msg.text,
                    createdAt: msg.createdAt,
                    status: msg.status,
                    sender: msg.senderId?.toString() === currentUserId?.toString() ? "me" : "other"
                };

                setMessages((prev) => {
                    if (prev.some((m) => String(m.id) === String(formattedMsg.id))) return prev;
                    return [...prev, formattedMsg];
                });
            }
        });

        socket.on("chat_block_update", ({ chatId, blockedBy }) => {
            if (isMounted && chatId === selectedConversationId) {
                setConversations(prev => prev.map(c => {
                    if (c.id === chatId) {
                        return { ...c, blockedBy };
                    }
                    return c;
                }));
            }
        });

        socket.on("chat_cleared", ({ chatId }) => {
            if (isMounted && chatId === selectedConversationId) {
                setMessages([]);
            }
        });

        socket.on("chat_deleted", ({ chatId, deleteType, userId }) => {
            if (isMounted && chatId === selectedConversationId) {
                const currentUserId = user?.id || user?._id;
                if (deleteType === "everyone" || userId?.toString() !== currentUserId?.toString()) {
                    setConversations(prev => prev.filter(c => c.id !== chatId));
                    setSelectedConversationId(null);
                }
            }
        });

        return () => {
            isMounted = false;
            socket.disconnect();
        };
    }, [selectedConversationId]);

    const selectedConversation =
        useMemo(
            () =>
                conversations.find(
                    (conversation) =>
                        conversation.id ===
                        selectedConversationId
                ) || null,
            [
                conversations,
                selectedConversationId,
            ]
        );

    const filteredConversations =
        useMemo(() => {
            const searchValue =
                search
                    .trim()
                    .toLowerCase();

            if (!searchValue) {
                return conversations;
            }

            return conversations.filter(
                (conversation) => {
                    const lastMessage =
                        getLastMessage(
                            conversation
                        );

                    const searchableText = [
                        conversation.user.name,
                        conversation.user.role,
                        conversation
                            .skillExchange
                            .teaching,
                        conversation
                            .skillExchange
                            .learning,
                        lastMessage?.text || "",
                    ]
                        .join(" ")
                        .toLowerCase();

                    return searchableText.includes(
                        searchValue
                    );
                }
            );
        }, [
            conversations,
            search,
        ]);

    const unreadTotal =
        useMemo(
            () =>
                conversations.reduce(
                    (
                        total,
                        conversation
                    ) =>
                        total +
                        conversation.unreadCount,
                    0
                ),
            [conversations]
        );

    const onlineCount =
        useMemo(
            () =>
                conversations.filter(
                    (conversation) =>
                        conversation.user
                            .online
                ).length,
            [conversations]
        );

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView(
            {
                behavior: "smooth",
            }
        );
    }, [
        selectedConversationId,
        messages.length,
    ]);

    const selectConversation = (
        conversationId
    ) => {
        setSelectedConversationId(
            conversationId
        );

        setMobileChatOpen(true);
    };

    const handleSendMessage =
        async () => {
            const trimmedMessage =
                messageText.trim();

            if (
                !trimmedMessage ||
                !selectedConversation ||
                sending
            ) {
                return;
            }

            try {
                setSending(true);

                const API_URL =
                    import.meta.env.VITE_API_URL ||
                    "http://localhost:5000/api";

                const token = getAccessToken();
                const headers = {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                };

                const response = await fetch(`${API_URL}/chats/${selectedConversation.id}/messages`, {
                    method: "POST",
                    headers,
                    credentials: "include",
                    body: JSON.stringify({ text: trimmedMessage }),
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.message || "Failed to send message");
                }

                const resData = await response.json();
                const newMsg = resData?.data?.message;

                if (newMsg) {
                    setMessages((prev) => {
                        if (prev.some((m) => String(m.id) === String(newMsg.id))) return prev;
                        return [...prev, newMsg];
                    });
                    setConversations((current) =>
                        current.map((c) =>
                            c.id === selectedConversation.id
                                ? {
                                    ...c,
                                    lastMessage: {
                                        id: newMsg.id,
                                        text: newMsg.text,
                                        createdAt: newMsg.createdAt,
                                        sender: "me",
                                    },
                                }
                                : c
                        )
                    );
                    setMessageText("");
                }
            } catch (err) {
                console.error("Error sending message:", err);
                alert(err.message || "Failed to send message");
            } finally {
                setSending(false);
            }
        };

    const handleKeyDown = (
        event
    ) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const clearSearch = () => {
        setSearch("");
    };

    return (
        <main className="px-4 pb-8 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1500px]">
                <MessagesHero
                    unreadTotal={
                        unreadTotal
                    }
                    onlineCount={
                        onlineCount
                    }
                />

                <section className="mt-6 overflow-hidden rounded-[26px] border border-white/10 bg-[#101117]">
                    <div className="grid h-[calc(100vh-260px)] min-h-[620px] lg:grid-cols-[350px_minmax(0,1fr)]">
                        <ConversationSidebar
                            loading={loading}
                            conversations={
                                filteredConversations
                            }
                            selectedConversationId={
                                selectedConversationId
                            }
                            search={search}
                            onSearchChange={
                                setSearch
                            }
                            onClearSearch={
                                clearSearch
                            }
                            onSelect={
                                selectConversation
                            }
                            mobileChatOpen={
                                mobileChatOpen
                            }
                        />

                        <div
                            className={`min-w-0 min-h-0 ${mobileChatOpen
                                ? "flex"
                                : "hidden"
                                } flex-col lg:flex`}
                        >
                            {selectedConversation ? (
                                <>
                                    <ChatHeader
                                        conversation={
                                            selectedConversation
                                        }
                                        onBack={() =>
                                            setMobileChatOpen(
                                                false
                                            )
                                        }
                                        onClear={() => setMessages([])}
                                        onDelete={() => {
                                            setConversations(prev => prev.filter(c => c.id !== selectedConversation.id));
                                            setSelectedConversationId(null);
                                        }}
                                        onBlockToggle={(blockedBy) => {
                                            setConversations(prev => prev.map(c => {
                                                if (c.id === selectedConversation.id) {
                                                    return { ...c, blockedBy };
                                                }
                                                return c;
                                            }));
                                        }}
                                    />

                                    {messagesLoading ? (
                                        <div className="flex-1 flex items-center justify-center bg-[#0c0d12]">
                                            <p className="text-sm text-white/45">Loading messages...</p>
                                        </div>
                                    ) : (
                                        <ChatMessages
                                            conversation={
                                                selectedConversation
                                            }
                                            messages={messages}
                                            messagesEndRef={
                                                messagesEndRef
                                            }
                                        />
                                    )}

                                    <MessageComposer
                                        value={
                                            messageText
                                        }
                                        sending={
                                            sending
                                        }
                                        onChange={
                                            setMessageText
                                        }
                                        onKeyDown={
                                            handleKeyDown
                                        }
                                        onSend={
                                            handleSendMessage
                                        }
                                        blockedBy={
                                            selectedConversation.blockedBy
                                        }
                                        currentUserId={
                                            user?.id || user?._id
                                        }
                                    />
                                </>
                            ) : (
                                <NoConversationSelected />
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

/*
|--------------------------------------------------------------------------
| Hero
|--------------------------------------------------------------------------
*/

function MessagesHero({
    unreadTotal,
    onlineCount,
}) {
    return (
        <section className="relative overflow-hidden rounded-[28px] border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-[#111218] to-[#0d0e13] p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />

            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
                        <HiOutlineChatBubbleLeftRight className="text-lg" />

                        Messages
                    </div>

                    <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">
                        Connect with your skill
                        partners.
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">
                        Discuss learning goals,
                        schedule sessions and stay
                        connected with your
                        accepted skill exchange
                        partners.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:w-auto">
                    <HeroStat
                        label="Unread"
                        value={unreadTotal}
                        icon={
                            HiOutlineChatBubbleLeftRight
                        }
                    />

                    <HeroStat
                        label="Online"
                        value={onlineCount}
                        icon={
                            HiOutlineUserGroup
                        }
                    />
                </div>
            </div>
        </section>
    );
}

function HeroStat({
    label,
    value,
    icon: Icon,
}) {
    return (
        <div className="min-w-32 rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-2xl font-semibold">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-white/40">
                        {label}
                    </p>
                </div>

                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                    <Icon className="text-xl" />
                </span>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Conversation sidebar
|--------------------------------------------------------------------------
*/

function ConversationSidebar({
    loading,
    conversations,
    selectedConversationId,
    search,
    onSearchChange,
    onClearSearch,
    onSelect,
    mobileChatOpen,
}) {
    return (
        <aside
            className={`${mobileChatOpen
                ? "hidden"
                : "flex"
                } min-w-0 min-h-0 flex-col border-r border-white/10 lg:flex`}
        >
            <div className="border-b border-white/10 p-4 sm:p-5">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                        Conversations
                    </p>

                    <h2 className="mt-1 text-xl font-semibold">
                        Your messages
                    </h2>
                </div>

                <div className="relative mt-4">
                    <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-white/25" />

                    <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                            onSearchChange(
                                event.target
                                    .value
                            )
                        }
                        placeholder="Search conversations..."
                        className="w-full rounded-xl border border-white/10 bg-[#090a0f] py-3 pl-11 pr-11 text-sm text-white outline-none placeholder:text-white/20 focus:border-orange-500/60"
                    />

                    {search && (
                        <button
                            type="button"
                            onClick={
                                onClearSearch
                            }
                            aria-label="Clear search"
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/30 transition hover:bg-white/5 hover:text-white"
                        >
                            <HiOutlineXMark className="text-lg" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-white/45">Loading chats...</p>
                    </div>
                ) : conversations.length === 0 ? (
                    <NoConversations />
                ) : (
                    conversations.map(
                        (conversation) => (
                            <ConversationItem
                                key={
                                    conversation.id
                                }
                                conversation={
                                    conversation
                                }
                                active={
                                    selectedConversationId ===
                                    conversation.id
                                }
                                onClick={() =>
                                    onSelect(
                                        conversation.id
                                    )
                                }
                            />
                        )
                    )
                )}
            </div>
        </aside>
    );
}

function ConversationItem({
    conversation,
    active,
    onClick,
}) {
    const lastMessage =
        getLastMessage(conversation);

    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full gap-3 border-b border-white/[0.06] p-4 text-left transition sm:p-5 ${active
                ? ""
                : "hover:bg-white/[0.025]"
                }`}
        >
            <UserAvatar
                user={conversation.user}
                size="medium"
            />

            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p
                            className={`truncate text-sm font-semibold ${conversation.unreadCount >
                                0
                                ? "text-white"
                                : "text-white/75"
                                }`}
                        >
                            {
                                conversation.user
                                    .name
                            }
                        </p>

                        <p className="mt-0.5 truncate text-xs text-white/30">
                            {
                                conversation.user
                                    .role
                            }
                        </p>
                    </div>

                    {lastMessage && (
                        <span
                            className={`shrink-0 text-[10px] ${conversation.unreadCount >
                                0
                                ? "font-semibold text-orange-400"
                                : "text-white/25"
                                }`}
                        >
                            {formatConversationTime(
                                lastMessage.createdAt
                            )}
                        </span>
                    )}
                </div>

                <div className="mt-3 flex items-end gap-3">
                    <p
                        className={`min-w-0 flex-1 truncate text-xs ${conversation.unreadCount >
                            0
                            ? "font-medium text-white/70"
                            : "text-white/30"
                            }`}
                    >
                        {lastMessage?.sender ===
                            "me" && (
                                <span className="mr-1 text-white/25">
                                    You:
                                </span>
                            )}

                        {lastMessage?.text ||
                            "No messages yet"}
                    </p>

                    {conversation.unreadCount >
                        0 && (
                            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-black">
                                {
                                    conversation.unreadCount
                                }
                            </span>
                        )}
                </div>

                <div className="mt-3 flex items-center gap-2 overflow-hidden">
                    <span className="truncate rounded-md border border-white/10 bg-white/[0.025] px-2 py-1 text-[10px] text-white/30">
                        {
                            conversation
                                .skillExchange
                                .teaching
                        }
                    </span>

                    <span className="text-[10px] text-orange-400">
                        ↔
                    </span>

                    <span className="truncate rounded-md border border-white/10 bg-white/[0.025] px-2 py-1 text-[10px] text-white/30">
                        {
                            conversation
                                .skillExchange
                                .learning
                        }
                    </span>
                </div>
            </div>
        </button>
    );
}

/*
|--------------------------------------------------------------------------
| Chat header
|--------------------------------------------------------------------------
*/

function ChatHeader({
    conversation,
    onBack,
    onClear,
    onDelete,
    onBlockToggle,
}) {
    const { user } = conversation;
    const { user: currentUser } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const dropdownRef = useRef(null);

    const token = getAccessToken();
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    const isBlockedByMe = conversation.blockedBy?.some(
        (id) => id.toString() === (currentUser?._id?.toString() || currentUser?.id?.toString())
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleBlock = async () => {
        setDropdownOpen(false);
        try {
            const response = await fetch(`${API_URL}/chats/${conversation.id}/block`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include"
            });
            if (response.ok) {
                const resData = await response.json();
                onBlockToggle(resData.data.blockedBy);
            }
        } catch (err) {
            console.error("Error blocking chat:", err);
        }
    };

    const handleClear = async () => {
        setDropdownOpen(false);
        if (!window.confirm("Are you sure you want to clear all messages in this chat?")) return;
        try {
            const response = await fetch(`${API_URL}/chats/${conversation.id}/clear`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include"
            });
            if (response.ok) {
                onClear();
            }
        } catch (err) {
            console.error("Error clearing chat:", err);
        }
    };

    const handleDelete = async (deleteType) => {
        setDeleteModalOpen(false);
        try {
            const response = await fetch(`${API_URL}/chats/${conversation.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({ deleteType })
            });
            if (response.ok) {
                onDelete();
            }
        } catch (err) {
            console.error("Error deleting chat:", err);
        }
    };

    const handleDummyClick = () => {
        setDropdownOpen(false);
        alert("This option is currently mock/disabled.");
    };

    return (
        <header className="relative flex min-h-[82px] items-center justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    aria-label="Back to conversations"
                    className="rounded-xl border border-white/10 p-2.5 text-white/45 transition hover:border-orange-500/30 hover:text-orange-400 lg:hidden"
                >
                    <HiOutlineArrowLeft className="text-xl" />
                </button>

                <UserAvatar
                    user={user}
                    size="medium"
                />

                <div className="min-w-0">
                    <h2 className="truncate font-semibold">
                        {user.name}
                    </h2>

                    <p
                        className={`mt-1 flex items-center gap-1.5 text-xs ${user.online
                            ? "text-green-400"
                            : "text-white/30"
                            }`}
                    >
                        <span
                            className={`h-2 w-2 rounded-full ${user.online
                                ? "bg-green-500"
                                : "bg-white/20"
                                }`}
                        />

                        {user.online
                            ? "Online now"
                            : `Last seen ${formatLastSeen(
                                user.lastSeen
                            )}`}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        aria-label="More options"
                        className="rounded-xl border border-white/10 p-2.5 text-white/40 transition hover:border-orange-500/30 hover:bg-orange-500/5 hover:text-orange-400"
                    >
                        <HiOutlineEllipsisVertical className="text-xl" />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 top-12 z-50 w-44 rounded-2xl border border-white/10 bg-[#0f1015] p-2 shadow-2xl backdrop-blur-xl">
                            <div className="space-y-0.5">
                                <button onClick={handleBlock} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs text-white/70 transition hover:bg-white/5 hover:text-white">
                                    <HiOutlineNoSymbol className="text-base text-red-500/80" /> {isBlockedByMe ? "Unblock" : "Block"}
                                </button>
                                <button onClick={handleClear} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs text-white/70 transition hover:bg-white/5 hover:text-white">
                                    <HiOutlineTrash className="text-base text-red-500/80" /> Clear chat
                                </button>
                                <button onClick={() => { setDropdownOpen(false); setDeleteModalOpen(true); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs text-white/70 transition hover:bg-white/5 hover:text-white">
                                    <HiOutlineTrash className="text-base text-red-500/80" /> Delete chat
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {deleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f1015] p-6 shadow-2xl">
                        <h3 className="text-lg font-semibold text-white">Delete Chat</h3>
                        <p className="mt-2 text-sm text-white/50 leading-relaxed">
                            Do you want to delete this chat only for yourself, or delete it for everyone?
                        </p>
                        <div className="mt-6 flex flex-col gap-2">
                            <button
                                onClick={() => handleDelete("me")}
                                className="w-full rounded-xl bg-white/5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Delete for me
                            </button>
                            <button
                                onClick={() => handleDelete("everyone")}
                                className="w-full rounded-xl bg-red-500/10 border border-red-500/20 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
                            >
                                Delete for everyone
                            </button>
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="mt-2 w-full rounded-xl py-3 text-sm font-semibold text-white/30 transition hover:text-white/50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

function HeaderAction({
    label,
    icon: Icon,
    hideOnSmall = false,
}) {
    return (
        <button
            type="button"
            aria-label={label}
            className={`rounded-xl border border-white/10 p-2.5 text-white/40 transition hover:border-orange-500/30 hover:bg-orange-500/5 hover:text-orange-400 ${hideOnSmall
                ? "hidden sm:block"
                : ""
                }`}
        >
            <Icon className="text-xl" />
        </button>
    );
}

/*
|--------------------------------------------------------------------------
| Chat messages
|--------------------------------------------------------------------------
*/

function ChatMessages({
    conversation,
    messages = [],
    messagesEndRef,
}) {
    const groupedMessages =
        groupMessagesByDate(
            messages
        );

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0c0d12] px-4 py-6 sm:px-6">
            <SkillExchangeBanner
                conversation={
                    conversation
                }
            />

            <div className="mx-auto mt-6 max-w-4xl space-y-7">
                {Object.entries(
                    groupedMessages
                ).map(
                    ([
                        date,
                        messages,
                    ]) => (
                        <div key={date}>
                            <DateSeparator
                                date={date}
                            />

                            <div className="mt-5 space-y-3">
                                {messages.map(
                                    (
                                        message
                                    ) => (
                                        <MessageBubble
                                            key={
                                                message.id
                                            }
                                            message={
                                                message
                                            }
                                            user={
                                                conversation.user
                                            }
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    )
                )}

                <div
                    ref={messagesEndRef}
                />
            </div>
        </div>
    );
}

function SkillExchangeBanner({
    conversation,
}) {
    return (
        <div className="mx-auto max-w-4xl rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                        Active skill exchange
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-semibold text-white/75">
                            You teach:
                        </span>

                        <span className="rounded-lg bg-orange-500/10 px-2.5 py-1 text-orange-300">
                            {
                                conversation
                                    .skillExchange
                                    .teaching
                            }
                        </span>

                        <span className="text-white/20">
                            •
                        </span>

                        <span className="font-semibold text-white/75">
                            You learn:
                        </span>

                        <span className="rounded-lg border border-white/10 px-2.5 py-1 text-white/50">
                            {
                                conversation
                                    .skillExchange
                                    .learning
                            }
                        </span>
                    </div>
                </div>

                <span className="inline-flex items-center gap-2 text-xs text-green-400">
                    <HiOutlineCheckCircle className="text-lg" />

                    Match accepted
                </span>
            </div>
        </div>
    );
}

function DateSeparator({
    date,
}) {
    return (
        <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-white/[0.07]" />

            <span className="rounded-full border border-white/10 bg-[#101117] px-3 py-1.5 text-[10px] font-medium text-white/30">
                {formatDateSeparator(
                    date
                )}
            </span>

            <div className="h-px flex-1 bg-white/[0.07]" />
        </div>
    );
}

function MessageBubble({
    message,
    user,
}) {
    const isMine =
        message.sender === "me";

    return (
        <div
            className={`flex items-end gap-2 ${isMine
                ? "justify-end"
                : "justify-start"
                }`}
        >
            {!isMine && (
                <UserAvatar
                    user={user}
                    size="small"
                />
            )}

            <div
                className={`max-w-[82%] sm:max-w-[68%] ${isMine
                    ? "items-end"
                    : "items-start"
                    } flex flex-col`}
            >
                <div
                    className={`rounded-2xl px-4 py-3 ${isMine
                        ? "rounded-br-md bg-orange-500 text-black"
                        : "rounded-bl-md border border-white/10 bg-[#15161d] text-white/75"
                        }`}
                >
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">
                        {message.text}
                    </p>
                </div>

                <div
                    className={`mt-1.5 flex items-center gap-1.5 px-1 text-[10px] ${isMine
                        ? "text-white/30"
                        : "text-white/25"
                        }`}
                >
                    <span>
                        {formatMessageTime(
                            message.createdAt
                        )}
                    </span>

                    {isMine && (
                        <MessageStatus
                            status={
                                message.status
                            }
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

function MessageStatus({
    status,
}) {
    if (status === "read") {
        return (
            <span
                title="Read"
                className="text-orange-400"
            >
                <HiOutlineCheckCircle />
            </span>
        );
    }

    if (
        status === "delivered"
    ) {
        return (
            <span
                title="Delivered"
                className="text-white/40"
            >
                <HiOutlineCheckCircle />
            </span>
        );
    }

    return (
        <span
            title="Sent"
            className="text-white/25"
        >
            <HiOutlineCheck />
        </span>
    );
}

/*
|--------------------------------------------------------------------------
| Message composer
|--------------------------------------------------------------------------
*/

function MessageComposer({
    value,
    sending,
    onChange,
    onKeyDown,
    onSend,
    blockedBy = [],
    currentUserId,
}) {
    const isBlocked = blockedBy.length > 0;
    const blockedByMe = blockedBy.some(id => id.toString() === currentUserId?.toString());

    if (isBlocked) {
        return (
            <footer className="border-t border-white/10 bg-[#101117] p-6 text-center">
                <p className="text-sm font-medium text-white/50">
                    {blockedByMe
                        ? "You have blocked this user. Unblock this user from the menu option to send messages."
                        : "This chat is blocked. You cannot send messages."}
                </p>
            </footer>
        );
    }

    const canSend =
        value.trim().length > 0 &&
        !sending;

    return (
        <footer className="border-t border-white/10 bg-[#101117] p-3 sm:p-4">
            <div className="mx-auto flex max-w-4xl items-end gap-2">
                <button
                    type="button"
                    aria-label="Attach file"
                    className="mb-0.5 shrink-0 rounded-xl border border-white/10 p-3 text-white/35 transition hover:border-orange-500/30 hover:text-orange-400"
                >
                    <HiOutlinePaperClip className="text-xl" />
                </button>

                <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#090a0f] focus-within:border-orange-500/60">
                    <textarea
                        value={value}
                        onChange={(event) =>
                            onChange(
                                event.target
                                    .value
                            )
                        }
                        onKeyDown={
                            onKeyDown
                        }
                        rows={1}
                        maxLength={2000}
                        placeholder="Write a message..."
                        className="max-h-36 min-h-[48px] w-full resize-none bg-transparent px-4 py-3.5 text-sm leading-5 text-white outline-none placeholder:text-white/20"
                    />
                </div>

                <button
                    type="button"
                    onClick={onSend}
                    disabled={!canSend}
                    aria-label="Send message"
                    className="mb-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {sending ? (
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                    ) : (
                        <HiOutlinePaperAirplane className="text-xl" />
                    )}
                </button>
            </div>

            <div className="mx-auto mt-2 flex max-w-4xl items-center justify-between px-1">
                <p className="text-[10px] text-white/20">
                    Press Enter to send,
                    Shift + Enter for a new
                    line.
                </p>

                <span className="text-[10px] text-white/20">
                    {value.length}/2000
                </span>
            </div>
        </footer>
    );
}

/*
|--------------------------------------------------------------------------
| Shared UI
|--------------------------------------------------------------------------
*/

function UserAvatar({
    user,
    size = "medium",
}) {
    const sizeClasses = {
        small:
            "h-8 w-8 rounded-xl text-[10px]",
        medium:
            "h-12 w-12 rounded-2xl text-sm",
    };

    return (
        <div
            className={`relative flex shrink-0 items-center justify-center bg-orange-500 font-bold text-black ${sizeClasses[size]}`}
        >
            {user.initials}

            {size === "medium" && (
                <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#101117] ${user.online
                        ? "bg-green-500"
                        : "bg-white/25"
                        }`}
                />
            )}
        </div>
    );
}

function NoConversations() {
    return (
        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                <HiOutlineMagnifyingGlass className="text-2xl" />
            </span>

            <h3 className="mt-4 font-semibold">
                No conversations found
            </h3>

            <p className="mt-2 text-sm leading-6 text-white/35">
                Try searching by user name
                or skill.
            </p>
        </div>
    );
}

function NoConversationSelected() {
    return (
        <div className="flex h-full flex-col items-center justify-center bg-[#0c0d12] px-6 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-[24px] border border-orange-500/20 bg-orange-500/10 text-orange-400">
                <HiOutlineChatBubbleLeftRight className="text-4xl" />
            </span>

            <h2 className="mt-6 text-2xl font-semibold">
                Select a conversation
            </h2>

            <p className="mt-3 max-w-md text-sm leading-7 text-white/35">
                Choose one of your accepted
                skill partners to view messages
                and continue your conversation.
            </p>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function getLastMessage(
    conversation
) {
    return (
        conversation.lastMessage || null
    );
}

function sortConversationsByLatest(
    conversations
) {
    return [...conversations].sort(
        (first, second) => {
            const firstMessage =
                getLastMessage(first);

            const secondMessage =
                getLastMessage(second);

            const firstTime =
                firstMessage
                    ? new Date(
                        firstMessage.createdAt
                    ).getTime()
                    : 0;

            const secondTime =
                secondMessage
                    ? new Date(
                        secondMessage.createdAt
                    ).getTime()
                    : 0;

            return (
                secondTime -
                firstTime
            );
        }
    );
}

function groupMessagesByDate(
    messages
) {
    return messages.reduce(
        (groups, message) => {
            const dateKey =
                new Date(
                    message.createdAt
                )
                    .toISOString()
                    .split("T")[0];

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }

            groups[dateKey].push(
                message
            );

            return groups;
        },
        {}
    );
}

function formatMessageTime(
    dateValue
) {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit",
        }
    ).format(date);
}

function formatConversationTime(
    dateValue
) {
    if (!dateValue) return "";
    const messageDate =
        new Date(dateValue);
    if (isNaN(messageDate.getTime())) {
        return "";
    }

    const today = new Date();

    const isToday =
        messageDate.toDateString() ===
        today.toDateString();

    if (isToday) {
        return new Intl.DateTimeFormat(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        ).format(messageDate);
    }

    const yesterday =
        new Date(today);

    yesterday.setDate(
        today.getDate() - 1
    );

    const isYesterday =
        messageDate.toDateString() ===
        yesterday.toDateString();

    if (isYesterday) {
        return "Yesterday";
    }

    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
        }
    ).format(messageDate);
}

function formatDateSeparator(
    dateValue
) {
    const messageDate =
        new Date(
            `${dateValue}T00:00:00`
        );

    const today = new Date();

    if (
        messageDate.toDateString() ===
        today.toDateString()
    ) {
        return "Today";
    }

    const yesterday =
        new Date(today);

    yesterday.setDate(
        today.getDate() - 1
    );

    if (
        messageDate.toDateString() ===
        yesterday.toDateString()
    ) {
        return "Yesterday";
    }

    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }
    ).format(messageDate);
}

function formatLastSeen(
    dateValue
) {
    if (!dateValue) {
        return "recently";
    }

    const lastSeen =
        new Date(dateValue);

    const today = new Date();

    if (
        lastSeen.toDateString() ===
        today.toDateString()
    ) {
        return new Intl.DateTimeFormat(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        ).format(lastSeen);
    }

    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
        }
    ).format(lastSeen);
}