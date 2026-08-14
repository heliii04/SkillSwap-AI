import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";

import { getAccessToken } from "../../api/tokenStore";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../context/AuthContext";
import useLockBodyScroll from "../../hooks/useLockBodyScroll";

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
    HiOutlineDocumentText,
    HiOutlineArrowDownTray,
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



const API_URL =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api/v1";

export default function Messages() {
    const { user, isAuthLoading } = useAuth();
    const [searchParams] = useSearchParams();
    const queryChatId = searchParams.get("chatId");

    const [conversations, setConversations] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedMessageIds, setSelectedMessageIds] = useState([]);
    const [selectDeleteModalOpen, setSelectDeleteModalOpen] = useState(false);

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

    const [isMobileScreen, setIsMobileScreen] = useState(
        typeof window !== "undefined" ? window.innerWidth < 1024 : false
    );

    useEffect(() => {
        const handleResize = () => {
            setIsMobileScreen(window.innerWidth < 1024);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useLockBodyScroll((isMobileScreen && mobileChatOpen) || Boolean(selectedDocument) || isSelectionMode || selectDeleteModalOpen);

    const messagesEndRef =
        useRef(null);
    const selectedConversationIdRef = useRef(selectedConversationId);

    useEffect(() => {
        selectedConversationIdRef.current = selectedConversationId;
    }, [selectedConversationId]);

    useEffect(() => {
        if (isAuthLoading) return;
        let isMounted = true;

        const fetchConversations = async (showLoading = false) => {
            if (showLoading) {
                setLoading(true);
            }
            try {
                const response = await axiosClient.get("/chats");
                const chats = response.data?.data?.chats || [];

                if (isMounted) {
                    setConversations(chats);

                    if (showLoading) {
                        if (queryChatId) {
                            setSelectedConversationId(queryChatId);
                            setMobileChatOpen(true);
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

        const socketHost = API_URL.replace(/\/api\/v1\/?$/, "").replace(/\/api\/?$/, "");
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
                    const isCurrentlyOpen = selectedConversationIdRef.current && String(updatedChat.id) === String(selectedConversationIdRef.current);
                    const chatToUse = isCurrentlyOpen ? { ...updatedChat, unreadCount: 0 } : updatedChat;
                    const exists = prev.some((c) => c.id === chatToUse.id);
                    if (exists) {
                        return [
                            chatToUse,
                            ...prev.filter((c) => c.id !== chatToUse.id),
                        ];
                    }
                    return [chatToUse, ...prev];
                });
            }
        });

        return () => {
            isMounted = false;
            socket.off("chat_list_update");
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
            import.meta.env.VITE_API_BASE_URL ||
            import.meta.env.VITE_API_URL ||
            "http://localhost:5000/api/v1";

        const fetchMessages = async (showLoading = false) => {
            if (showLoading) {
                setMessagesLoading(true);
            }
            try {
                axiosClient.post(`/chats/${selectedConversationId}/read`).catch(() => {});
                const response = await axiosClient.get(`/chats/${selectedConversationId}/messages`);
                if (isMounted) {
                    const fetchedMessages = response.data?.data?.messages || [];
                    setMessages(fetchedMessages);
                    setConversations((prev) =>
                        prev.map((c) =>
                            String(c.id) === String(selectedConversationId)
                                ? { ...c, unreadCount: 0 }
                                : c
                        )
                    );
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

        const socketHost = API_URL.replace(/\/api\/v1\/?$/, "").replace(/\/api\/?$/, "");
        const socket = io(socketHost, {
            withCredentials: true,
            auth: { token: getAccessToken() },
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

                const targetChatId = msg.chatId || selectedConversationIdRef.current;
                const isChatOpen = selectedConversationIdRef.current && String(targetChatId) === String(selectedConversationIdRef.current);

                if (isChatOpen && formattedMsg.sender !== "me") {
                    axiosClient.post(`/chats/${selectedConversationIdRef.current}/read`).catch(() => {});
                }

                setMessages((prev) => {
                    if (prev.some((m) => String(m.id) === String(formattedMsg.id))) return prev;
                    if (formattedMsg.sender === "me") {
                        const tempIndex = prev.findIndex((m) => String(m.id).startsWith("temp_"));
                        if (tempIndex !== -1) {
                            const next = [...prev];
                            next[tempIndex] = formattedMsg;
                            return next;
                        }
                    }
                    return [...prev, formattedMsg];
                });

                setConversations((current) =>
                    current.map((c) => {
                        const isMatch = (targetChatId && String(c.id) === String(targetChatId)) || (selectedConversationIdRef.current && String(c.id) === String(selectedConversationIdRef.current));
                        if (isMatch) {
                            const isOpen = selectedConversationIdRef.current && String(c.id) === String(selectedConversationIdRef.current);
                            return {
                                ...c,
                                lastMessage: {
                                    id: formattedMsg.id,
                                    text: formattedMsg.text,
                                    createdAt: formattedMsg.createdAt,
                                    sender: formattedMsg.sender,
                                },
                                unreadCount: isOpen ? 0 : (formattedMsg.sender === "me" ? c.unreadCount : (c.unreadCount + 1)),
                            };
                        }
                        return c;
                    })
                );
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
            if (isMounted) {
                const currentUserId = user?.id || user?._id;
                if (deleteType === "everyone" || (deleteType === "me" && userId?.toString() === currentUserId?.toString())) {
                    setConversations(prev => prev.filter(c => c.id !== chatId));
                    if (selectedConversationId === chatId) {
                        setSelectedConversationId(null);
                    }
                }
            }
        });

        socket.on("messages_deleted", ({ chatId, messageIds, deleteType, deletedByName }) => {
            if (isMounted) {
                if (deleteType === "everyone") {
                    if (chatId === selectedConversationId) {
                        setMessages((prev) =>
                            prev.map((m) => {
                                if (messageIds?.includes(m.id)) {
                                    return {
                                        ...m,
                                        isDeletedForEveryone: true,
                                        text: `delete message from "${deletedByName || "User"}"`,
                                    };
                                }
                                return m;
                            })
                        );
                    }
                    setConversations((prev) =>
                        prev.map((c) => {
                            if (c.id === chatId && c.lastMessage && messageIds?.includes(c.lastMessage.id)) {
                                return {
                                    ...c,
                                    lastMessage: {
                                        ...c.lastMessage,
                                        text: `delete message from "${deletedByName || "User"}"`,
                                    },
                                };
                            }
                            return c;
                        })
                    );
                } else {
                    if (chatId === selectedConversationId) {
                        setMessages((prev) => prev.filter((m) => !messageIds?.includes(m.id)));
                    }
                }
            }
        });

        return () => {
            isMounted = false;
            socket.off("new_message");
            socket.off("chat_block_update");
            socket.off("chat_cleared");
            socket.off("chat_deleted");
            socket.off("messages_deleted");
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
        setSelectedConversationId(conversationId);
        axiosClient.post(`/chats/${conversationId}/read`).catch(() => {});
        setConversations((prev) =>
            prev.map((c) =>
                String(c.id) === String(conversationId)
                    ? { ...c, unreadCount: 0 }
                    : c
            )
        );
        setIsSelectionMode(false);
        setSelectedMessageIds([]);
        setMobileChatOpen(true);
    };

    const handleSendMessage =
        async () => {
            const trimmedMessage =
                messageText.trim();

            if (
                (!trimmedMessage && !selectedDocument) ||
                !selectedConversation ||
                sending
            ) {
                return;
            }

            let payloadText = trimmedMessage;
            if (selectedDocument) {
                let cloudUrl = selectedDocument.dataUrl;
                if (selectedDocument.rawFile) {
                    try {
                        const formData = new FormData();
                        formData.append("file", selectedDocument.rawFile);
                        const uploadRes = await axiosClient.post("/chats/upload-document", formData, {
                            headers: { "Content-Type": "multipart/form-data" },
                        });
                        if (uploadRes.data?.data?.fileUrl) {
                            cloudUrl = uploadRes.data.data.fileUrl;
                        }
                    } catch (uploadErr) {
                        console.error("Cloudinary upload error, using fallback:", uploadErr);
                    }
                }

                const docPayload = JSON.stringify({
                    fileName: selectedDocument.name,
                    fileSize: selectedDocument.sizeFormatted,
                    fileData: cloudUrl,
                    fileType: selectedDocument.type
                });
                payloadText = trimmedMessage ? `${trimmedMessage}\n[DOC_ATTACHMENT:${docPayload}]` : `[DOC_ATTACHMENT:${docPayload}]`;
            }

            const tempId = `temp_${Date.now()}`;
            const optimisticMsg = {
                id: tempId,
                sender: "me",
                text: payloadText,
                createdAt: new Date().toISOString(),
                status: "sending"
            };

            // Instantly render optimistic message and reset inputs (0ms perceived latency)
            setMessages((prev) => [...prev, optimisticMsg]);
            setConversations((current) =>
                current.map((c) =>
                    c.id === selectedConversation.id
                        ? {
                            ...c,
                            lastMessage: {
                                id: tempId,
                                text: payloadText,
                                createdAt: optimisticMsg.createdAt,
                                sender: "me",
                            },
                        }
                        : c
                )
            );
            setMessageText("");
            setSelectedDocument(null);

            try {
                setSending(true);

                const response = await axiosClient.post(`/chats/${selectedConversation.id}/messages`, {
                    text: payloadText,
                });

                const newMsg = response.data?.data?.message;

                if (newMsg) {
                    setMessages((prev) => {
                        const hasRealMsg = prev.some((m) => String(m.id) === String(newMsg.id));
                        if (hasRealMsg) {
                            return prev.filter((m) => !String(m.id).startsWith("temp_"));
                        }
                        return prev.map((m) => (m.id === tempId ? newMsg : m));
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
                }
            } catch (err) {
                console.error("Error sending message:", err);
                toast.error(err.message || "Failed to send message");
                // Mark optimistic message as failed
                setMessages((prev) =>
                    prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m))
                );
            } finally {
                setSending(false);
            }
        };

    const canDeleteForEveryone = useMemo(() => {
        if (selectedMessageIds.length === 0) return false;
        const selectedMsgs = messages.filter((m) => selectedMessageIds.includes(m.id));
        return (
            selectedMsgs.length > 0 &&
            selectedMsgs.every(
                (m) => m.sender === "me" && !m.isDeletedForEveryone
            )
        );
    }, [messages, selectedMessageIds]);

    const toggleMessageSelection = (msgId) => {
        setSelectedMessageIds((prev) =>
            prev.includes(msgId)
                ? prev.filter((id) => id !== msgId)
                : [...prev, msgId]
        );
    };

    const handleSelectAllMessages = () => {
        if (selectedMessageIds.length === messages.length) {
            setSelectedMessageIds([]);
        } else {
            setSelectedMessageIds(messages.map((m) => m.id));
        }
    };

    const handleDeleteSelectedMessages = () => {
        if (selectedMessageIds.length === 0) return;
        setSelectDeleteModalOpen(true);
    };

    const handleConfirmDeleteSelected = async (deleteType) => {
        setSelectDeleteModalOpen(false);
        if (!selectedConversation || selectedMessageIds.length === 0) return;

        try {
            const response = await axiosClient.post(
                `/chats/${selectedConversation.id}/messages/delete`,
                {
                    messageIds: selectedMessageIds,
                    deleteType,
                }
            );
            if (response.data?.success) {
                if (deleteType === "everyone") {
                    const deleterName = response.data.deletedByName || user?.name || "User";
                    setMessages((prev) =>
                        prev.map((m) => {
                            if (selectedMessageIds.includes(m.id)) {
                                return {
                                    ...m,
                                    isDeletedForEveryone: true,
                                    text: `delete message from "${deleterName}"`,
                                };
                            }
                            return m;
                        })
                    );
                    setConversations((prev) =>
                        prev.map((c) => {
                            if (c.id === selectedConversation.id && c.lastMessage && selectedMessageIds.includes(c.lastMessage.id)) {
                                return {
                                    ...c,
                                    lastMessage: {
                                        ...c.lastMessage,
                                        text: `delete message from "${deleterName}"`,
                                    },
                                };
                            }
                            return c;
                        })
                    );
                } else {
                    setMessages((prev) =>
                        prev.filter((m) => !selectedMessageIds.includes(m.id))
                    );
                }
                setSelectedMessageIds([]);
                setIsSelectionMode(false);
            }
        } catch (err) {
            console.error("Error deleting selected messages:", err);
            alert(err.message || "Failed to delete selected messages");
        }
    };

    const handleCancelSelection = () => {
        setIsSelectionMode(false);
        setSelectedMessageIds([]);
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
                                        isSelectionMode={isSelectionMode}
                                        selectedCount={selectedMessageIds.length}
                                        totalCount={messages.length}
                                        onStartSelection={() => setIsSelectionMode(true)}
                                        onSelectAll={handleSelectAllMessages}
                                        onDeleteSelected={handleDeleteSelectedMessages}
                                        onCancelSelection={handleCancelSelection}
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
                                            isSelectionMode={isSelectionMode}
                                            selectedMessageIds={selectedMessageIds}
                                            onToggleSelect={toggleMessageSelection}
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
                                        selectedDocument={selectedDocument}
                                        setSelectedDocument={setSelectedDocument}
                                    />
                                </>
                            ) : (
                                <NoConversationSelected />
                            )}
                        </div>
                    </div>
                </section>
            </div>

            {selectDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f1015] p-6 shadow-2xl">
                        <h3 className="text-lg font-semibold text-white">
                            Delete {selectedMessageIds.length} {selectedMessageIds.length === 1 ? "Message" : "Messages"}
                        </h3>
                        <p className="mt-2 text-sm text-white/50 leading-relaxed">
                            {canDeleteForEveryone
                                ? "Do you want to delete these selected messages only for yourself, or delete them for everyone?"
                                : "Do you want to delete these selected messages for yourself?"}
                        </p>
                        <div className="mt-6 flex flex-col gap-2">
                            <button
                                onClick={() => handleConfirmDeleteSelected("me")}
                                className="w-full rounded-xl bg-white/5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                            >
                                Delete for me
                            </button>
                            {canDeleteForEveryone && (
                                <button
                                    onClick={() => handleConfirmDeleteSelected("everyone")}
                                    className="w-full rounded-xl bg-red-500/10 border border-red-500/20 py-3 text-sm font-bold text-red-400 transition hover:bg-red-500/20"
                                >
                                    Delete for everyone
                                </button>
                            )}
                            <button
                                onClick={() => setSelectDeleteModalOpen(false)}
                                className="mt-2 w-full rounded-xl py-3 text-sm font-bold text-white/30 transition hover:text-white/50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/30 transition hover:bg-white/5 hover:text-white font-bold"
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
                } font-bold`}
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
                    {(() => {
                        const isDeletedLastMsg = lastMessage?.text?.startsWith("delete message from");
                        return (
                            <p
                                className={`min-w-0 flex-1 truncate text-xs ${conversation.unreadCount > 0
                                    ? "font-medium text-white/70"
                                    : "text-white/30"
                                    } ${isDeletedLastMsg ? "italic text-white/40" : ""}`}
                            >
                                {lastMessage?.sender === "me" && !isDeletedLastMsg && (
                                    <span className="mr-1 text-white/25">
                                        You:
                                    </span>
                                )}

                                {lastMessage?.text || "No messages yet"}
                            </p>
                        );
                    })()}

                    {conversation.unreadCount > 0 && !active && (
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
    isSelectionMode = false,
    selectedCount = 0,
    totalCount = 0,
    onStartSelection,
    onSelectAll,
    onDeleteSelected,
    onCancelSelection,
}) {
    const { user, blockedBy = [] } = conversation;
    const { user: currentUser } = useAuth();
    const currentUserId = currentUser?.id || currentUser?._id;
    const isBlockedByMe = blockedBy.some(id => id.toString() === currentUserId?.toString());

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    const handleBlock = async () => {
        setDropdownOpen(false);
        try {
            const response = await axiosClient.post(`/chats/${conversation.id}/block`);
            if (response.data?.success) {
                onBlockToggle(response.data.data.blockedBy);
            }
        } catch (err) {
            console.error("Error blocking chat:", err);
            alert(err.message || "Failed to block user");
        }
    };

    const handleClear = async () => {
        setDropdownOpen(false);
        if (!window.confirm("Are you sure you want to clear this chat? This cannot be undone.")) return;
        try {
            const response = await axiosClient.delete(`/chats/${conversation.id}/messages`);
            if (response.data?.success) {
                onClear();
            }
        } catch (err) {
            console.error("Error clearing chat:", err);
            alert(err.message || "Failed to clear chat");
        }
    };

    const handleDelete = async (type) => {
        setDeleteModalOpen(false);
        try {
            const response = await axiosClient.delete(`/chats/${conversation.id}?type=${type}`);
            if (response.data?.success) {
                onDelete();
            }
        } catch (err) {
            console.error("Error deleting chat:", err);
            alert(err.message || "Failed to delete chat");
        }
    };

    if (isSelectionMode) {
        return (
            <header className="relative flex min-h-[82px] items-center justify-between gap-4 border-b border-white/10 bg-[#13141c] px-4 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onCancelSelection}
                        className="rounded-xl border border-white/10 p-2.5 text-white/60 hover:bg-white/10 hover:text-white transition font-bold"
                        title="Cancel Selection"
                    >
                        <HiOutlineXMark className="text-xl" />
                    </button>
                    <div>
                        <h2 className="font-bold text-white text-sm sm:text-base">
                            {selectedCount} {selectedCount === 1 ? "Message" : "Messages"} Selected
                        </h2>
                        <p className="text-[11px] text-white/40">Click any message to select or deselect</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onSelectAll}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition font-bold"
                    >
                        {selectedCount === totalCount && totalCount > 0 ? "Deselect All" : "Select All"}
                    </button>
                    <button
                        type="button"
                        disabled={selectedCount === 0}
                        onClick={onDeleteSelected}
                        className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition disabled:opacity-40 font-bold"
                    >
                        <HiOutlineTrash className="text-sm" /> Delete ({selectedCount})
                    </button>
                </div>
            </header>
        );
    }

    return (
        <header className="relative flex min-h-[82px] items-center justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    aria-label="Back to conversations"
                    className="rounded-xl border border-white/10 p-2.5 text-white/45 transition hover:border-orange-500/30 hover:text-orange-400 lg:hidden font-bold"
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
                        className="rounded-xl border border-white/10 p-2.5 text-white/40 transition hover:border-orange-500/30 hover:bg-orange-500/5 hover:text-orange-400 font-bold"
                    >
                        <HiOutlineEllipsisVertical className="text-xl" />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 top-12 z-50 w-44 rounded-2xl border border-white/10 bg-[#0f1015] p-2 shadow-2xl backdrop-blur-xl">
                            <div className="space-y-0.5">
                                <button onClick={handleBlock} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs text-white/70 transition hover:bg-white/5 hover:text-white font-bold">
                                    <HiOutlineNoSymbol className="text-base text-red-500/80" /> {isBlockedByMe ? "Unblock" : "Block"}
                                </button>
                                <button onClick={() => { setDropdownOpen(false); onStartSelection(); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs text-white/70 transition hover:bg-white/5 hover:text-white font-bold">
                                    <HiOutlineCheckCircle className="text-base text-orange-400" /> Select messages
                                </button>
                                <button onClick={handleClear} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs text-white/70 transition hover:bg-white/5 hover:text-white font-bold">
                                    <HiOutlineTrash className="text-base text-red-500/80" /> Clear chat
                                </button>
                                <button onClick={() => { setDropdownOpen(false); setDeleteModalOpen(true); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs text-white/70 transition hover:bg-white/5 hover:text-white font-bold">
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
                                className="w-full rounded-xl bg-white/5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 font-bold"
                            >
                                Delete for me
                            </button>
                            <button
                                onClick={() => handleDelete("everyone")}
                                className="w-full rounded-xl bg-red-500/10 border border-red-500/20 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 font-bold"
                            >
                                Delete for everyone
                            </button>
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="mt-2 w-full rounded-xl py-3 text-sm font-semibold text-white/30 transition hover:text-white/50 font-bold"
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
                } font-bold`}
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
    isSelectionMode = false,
    selectedMessageIds = [],
    onToggleSelect,
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
                                            isSelectionMode={isSelectionMode}
                                            isSelected={selectedMessageIds.includes(message.id)}
                                            onToggleSelect={onToggleSelect}
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
    isSelectionMode = false,
    isSelected = false,
    onToggleSelect,
}) {
    const isMine =
        message.sender === "me";

    let docAttachment = null;
    let mainText = message.text || "";

    if (mainText.includes("[DOC_ATTACHMENT:")) {
        try {
            const parts = mainText.split("[DOC_ATTACHMENT:");
            mainText = parts[0].trim();
            const jsonStr = parts[1].slice(0, parts[1].lastIndexOf("]"));
            docAttachment = JSON.parse(jsonStr);
        } catch (e) {
            console.error("Error parsing document attachment:", e);
        }
    }

    const isDeleted = message.isDeletedForEveryone || mainText.startsWith("delete message from");

    const handleClick = () => {
        if (!isDeleted && isSelectionMode && typeof onToggleSelect === "function") {
            onToggleSelect(message.id);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`flex items-end gap-2.5 transition-all duration-150 ${
                isMine
                    ? "justify-end"
                    : "justify-start"
                } ${isSelectionMode && !isDeleted ? "cursor-pointer group select-none" : ""}`}
        >
            {isSelectionMode && !isMine && !isDeleted && (
                <div className="mb-2 shrink-0">
                    <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                            isSelected
                                ? "border-orange-500 bg-orange-500 text-black font-bold"
                                : "border-white/30 bg-white/5 group-hover:border-orange-400"
                        }`}
                    >
                        {isSelected && <HiOutlineCheck className="text-xs stroke-[3]" />}
                    </div>
                </div>
            )}

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
                    className={`rounded-2xl px-4 py-3 transition-all ${
                        isDeleted
                            ? "rounded-md border border-white/10 bg-white/[0.03] text-white/40 italic flex items-center gap-2 text-xs"
                            : isMine
                            ? "rounded-br-md bg-orange-500 text-black font-medium"
                            : "rounded-bl-md border border-white/10 bg-[#15161d] text-white/90"
                        } ${isSelected ? "ring-2 ring-orange-500 shadow-lg shadow-orange-500/10 scale-[1.01]" : ""}`}
                >
                    {isDeleted ? (
                        <>
                            <HiOutlineTrash className="text-sm shrink-0 opacity-70" />
                            <span>{mainText}</span>
                        </>
                    ) : (
                        <>
                            {docAttachment && (
                                <div className={`mb-2 flex items-center justify-between gap-3 rounded-xl p-3 border ${
                                    isMine
                                        ? "bg-black/15 border-black/20 text-black"
                                        : "bg-white/5 border-white/10 text-white"
                                }`}>
                                    <div className="flex items-center gap-2.5 overflow-hidden">
                                        <HiOutlineDocumentText className="text-2xl shrink-0 opacity-90" />
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-bold leading-tight">{docAttachment.fileName}</p>
                                            <p className="text-[10px] opacity-75 mt-0.5">{docAttachment.fileSize || "Document"}</p>
                                        </div>
                                    </div>
                                    {docAttachment.fileData && (
                                        <button
                                            type="button"
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                try {
                                                    const fileUrl = docAttachment.fileData;
                                                    const fileName = docAttachment.fileName || "document";
                                                    if (fileUrl.startsWith("data:")) {
                                                        const link = document.createElement("a");
                                                        link.href = fileUrl;
                                                        link.download = fileName;
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                        return;
                                                    }
                                                    const response = await fetch(fileUrl);
                                                    const blob = await response.blob();
                                                    const blobUrl = window.URL.createObjectURL(blob);
                                                    const link = document.createElement("a");
                                                    link.href = blobUrl;
                                                    link.download = fileName;
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                    window.URL.revokeObjectURL(blobUrl);
                                                } catch (err) {
                                                    window.open(docAttachment.fileData, "_blank");
                                                }
                                            }}
                                            className={`shrink-0 flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition border ${
                                                isMine
                                                    ? "bg-black text-orange-400 border-black hover:bg-black/80"
                                                    : "bg-orange-500 text-black border-orange-500 hover:bg-orange-400"
                                            }`}
                                        >
                                            <HiOutlineArrowDownTray className="text-sm" /> Download
                                        </button>
                                    )}
                                </div>
                            )}

                            {mainText && (
                                <p className="whitespace-pre-wrap break-words text-sm leading-6">
                                    {mainText}
                                </p>
                            )}
                        </>
                    )}
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

            {isSelectionMode && isMine && !isDeleted && (
                <div className="mb-2 shrink-0">
                    <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                            isSelected
                                ? "border-orange-500 bg-orange-500 text-black font-bold"
                                : "border-white/30 bg-white/5 group-hover:border-orange-400"
                        }`}
                    >
                        {isSelected && <HiOutlineCheck className="text-xs stroke-[3]" />}
                    </div>
                </div>
            )}
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
    selectedDocument,
    setSelectedDocument,
}) {
    const fileInputRef = useRef(null);
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

    const formatBytes = (bytes) => {
        if (!bytes) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert("Document size exceeds 10MB limit. Please select a smaller document.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setSelectedDocument({
                name: file.name,
                sizeFormatted: formatBytes(file.size),
                type: file.type,
                dataUrl: event.target?.result,
                rawFile: file,
            });
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const canSend = (value.trim().length > 0 || Boolean(selectedDocument)) && !sending;

    return (
        <footer className="border-t border-white/10 bg-[#101117] p-3 sm:p-4">
            <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.pptx,.zip,.rar,application/*,text/*"
                onChange={handleFileChange}
                className="hidden"
            />

            {selectedDocument && (
                <div className="mx-auto mb-2 flex max-w-4xl items-center justify-between gap-3 rounded-xl border border-orange-500/40 bg-orange-500/10 px-3.5 py-2 text-xs font-semibold text-orange-300">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <HiOutlineDocumentText className="text-lg shrink-0 text-orange-400" />
                        <span className="truncate">{selectedDocument.name}</span>
                        <span className="text-[10px] text-white/50 shrink-0">({selectedDocument.sizeFormatted})</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSelectedDocument(null)}
                        className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white transition"
                        title="Remove document"
                    >
                        <HiOutlineXMark className="text-base" />
                    </button>
                </div>
            )}

            <div className="mx-auto flex max-w-4xl items-end gap-2">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Attach document"
                    title="Upload document (.pdf, .doc, .docx, .txt, etc.)"
                    className={`mb-0.5 shrink-0 rounded-xl border p-3 font-bold transition ${
                        selectedDocument
                            ? "border-orange-500 text-orange-400 bg-orange-500/10"
                            : "border-white/10 text-white/60 hover:border-orange-500/50 hover:text-orange-400 bg-[#090a0f]"
                    }`}
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
                        placeholder={selectedDocument ? "Add a message with document (optional)..." : "Write a message..."}
                        className="max-h-36 min-h-[48px] w-full resize-none bg-transparent px-4 py-3.5 text-sm leading-5 text-white outline-none placeholder:text-white/20"
                    />
                </div>

                <button
                    type="button"
                    onClick={onSend}
                    disabled={!canSend}
                    aria-label="Send message"
                    className="mb-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40 font-bold"
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
        <div className="relative flex flex-1 flex-col items-center justify-center p-8 text-center bg-[#0a0a0a] select-none">
            <div className="relative z-10 flex flex-col items-center max-w-lg">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-[#111111] text-gray-300 shadow-xl">
                    <HiOutlineChatBubbleLeftRight className="text-5xl text-orange-500" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wider uppercase">
                    Where Should We Begin ?
                </h2>

                <p className="mt-4 text-sm sm:text-base leading-relaxed text-gray-400 max-w-md font-medium">
                    Select a conversation from the left to start chatting, exchanging skills, and collaborating in real-time.
                </p>

                <div className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-xs text-gray-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                    <span className="font-semibold text-gray-300">Ready for Skill Exchange</span>
                </div>
            </div>
        </div>
    );
};

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