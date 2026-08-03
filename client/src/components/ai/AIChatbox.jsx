import { useState, useRef, useEffect } from "react";
import { chatWithAi } from "../../api/aiApi";
import { FiSend, FiLoader, FiClock , FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";

export default function AIChatbox() {
    const defaultMessages = [];

    const [sessions, setSessions] = useState(() => {
        const saved = localStorage.getItem("ai_chat_sessions");
        return saved ? JSON.parse(saved) : [];
    });
    
    const [currentSessionId, setCurrentSessionId] = useState(() => {
        return localStorage.getItem("ai_current_session_id") || Date.now().toString();
    });

    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem("ai_chat_sessions");
        if (saved) {
            const parsedSessions = JSON.parse(saved);
            const currentId = localStorage.getItem("ai_current_session_id");
            const currentSession = parsedSessions.find(s => s.id === currentId);
            if (currentSession) return currentSession.messages;
        }
        return defaultMessages;
    });

    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const endRef = useRef(null);

    const scrollToBottom = () => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        
        setSessions(prev => {
            const existing = prev.find(s => s.id === currentSessionId);
            let updated;
            if (existing) {
                updated = prev.map(s => s.id === currentSessionId ? { ...s, messages, updatedAt: Date.now() } : s);
            } else {
                if (messages.length > 1) {
                    updated = [{ id: currentSessionId, messages, updatedAt: Date.now() }, ...prev];
                } else {
                    updated = prev;
                }
            }
            localStorage.setItem("ai_chat_sessions", JSON.stringify(updated));
            return updated;
        });
    }, [messages, currentSessionId]);

    const startNewChat = () => {
        const newId = Date.now().toString();
        setCurrentSessionId(newId);
        setMessages(defaultMessages);
        localStorage.setItem("ai_current_session_id", newId);
        setShowHistory(false);
    };

    const loadSession = (id) => {
        const session = sessions.find(s => s.id === id);
        if (session) {
            setCurrentSessionId(id);
            setMessages(session.messages);
            localStorage.setItem("ai_current_session_id", id);
        }
        setShowHistory(false);
    };

        const deleteSession = (id) => {
        const newSessions = sessions.filter(s => s.id !== id);
        setSessions(newSessions);
        
        // We need to determine the storage key dynamically based on the file since each file uses a different key
        const isChat = "client/src/components/ai/AIChatbox.jsx".includes("AIChatbox");
        const isRoadmap = "client/src/components/ai/AIChatbox.jsx".includes("Roadmap");
        const isQuiz = "client/src/components/ai/AIChatbox.jsx".includes("Quiz");
        
        let storageKey = "";
        let currentKey = "";
        if (isChat) { storageKey = "ai_chat_sessions"; currentKey = "ai_current_session_id"; }
        else if (isRoadmap) { storageKey = "ai_roadmap_sessions"; currentKey = "ai_current_roadmap_id"; }
        else if (isQuiz) { storageKey = "ai_quiz_sessions"; currentKey = "ai_current_quiz_id"; }
        
        localStorage.setItem(storageKey, JSON.stringify(newSessions));
        
        if (currentSessionId === id) {
            if (newSessions.length > 0) {
                const nextId = newSessions[0].id;
                setCurrentSessionId(nextId);
                localStorage.setItem(currentKey, nextId);
                // Also load the next session data if necessary
                if (typeof loadSession === 'function') {
                   loadSession(nextId);
                   setShowHistory(true); // Keep it open
                }
            } else {
                clearAllHistory();
            }
        }
    };

    const clearAllHistory = () => {
        setSessions([]);
        localStorage.removeItem("ai_chat_sessions");
        startNewChat();
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        const newMessages = [...messages, { role: "user", content: userMsg }];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const history = newMessages.slice(0, -1).map(m => ({
                role: m.role === "ai" ? "model" : "user",
                content: m.content
            }));
            
            const response = await chatWithAi(userMsg, history);
            setMessages([...newMessages, { role: "ai", content: response?.data?.reply || "Error getting response." }]);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to communicate with AI");
            setMessages([...newMessages, { role: "ai", content: "Sorry, I encountered an error." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex flex-col flex-grow h-full min-h-0 bg-[#0a0a0a] rounded-lg border border-white/10 overflow-hidden shadow-lg">
            <div className="bg-[#050505] p-4 border-b border-white/10 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
                    <p className="text-xs text-gray-400">Ask about programming, mentors, or concepts!</p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={startNewChat}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors border border-white/10 hover:border-gray-500 px-3 py-1.5 rounded-md"
                    >
                        + New Chat
                    </button>
                    <button 
                        onClick={() => setShowHistory(true)}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-500 transition-colors border border-white/10 hover:border-orange-500 px-3 py-1.5 rounded-md"
                    >
                        <FiClock /> History
                    </button>
                </div>
            </div>
            
            {showHistory && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-[#1a1a1a] w-full max-w-2xl rounded-lg border border-white/10 flex flex-col max-h-[80%]">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-white font-semibold flex items-center gap-2"><FiClock /> Previous Chats</h3>
                            <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-white text-xl leading-none">&times;</button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 space-y-2">
                            {sessions.length === 0 ? (
                                <p className="text-gray-400 text-center py-8">No previous chats found.</p>
                            ) : (
                                sessions.map(session => {
                                    const firstUserMsg = session.messages.find(m => m.role === 'user')?.content || "Empty Chat";
                                    const title = firstUserMsg.length > 50 ? firstUserMsg.substring(0, 50) + "..." : firstUserMsg;
                                    const date = new Date(session.updatedAt).toLocaleString();
                                    
                                    return (
                                        <div 
                                            key={session.id} 
                                            onClick={() => loadSession(session.id)}
                                            className={`p-3 rounded-md cursor-pointer border transition-colors ${currentSessionId === session.id ? 'bg-orange-600/10 border-orange-500' : 'bg-[#111111] border-white/10 hover:border-gray-500 hover:bg-[#1a1a1a]'}`}
                                        >
                                            <div className="flex justify-between items-start">
    <div className="flex-1 min-w-0 pr-2">
        <p className="text-sm text-gray-200 font-medium truncate">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{date}</p>
    </div>
    <button 
        onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
        className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
        title="Delete this history"
    >
        <FiTrash2 />
    </button>
</div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <div className="p-4 border-t border-white/10 flex justify-end gap-3">
                            <button onClick={() => setShowHistory(false)} className="px-4 py-2 text-gray-300 hover:text-white transition">Close</button>
                            <button onClick={clearAllHistory} className="bg-red-600/20 text-red-500 px-4 py-2 rounded-md hover:bg-red-600/30 transition">
                                Clear All History
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
                {messages.length === 0 && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                        <h2 className="text-xl md:text-2xl font-bold text-white tracking-wider text-center px-4 uppercase">Where Should We Begin ?</h2>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === "user" ? "bg-orange-500 text-black rounded-br-md" : "bg-[#1a1a1a] text-white/75 border border-white/10 rounded-bl-md"}`}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-[#1a1a1a] border border-white/10 p-3 rounded-2xl rounded-bl-md">
                            <FiLoader className="animate-spin text-orange-500" />
                        </div>
                    </div>
                )}
                <div ref={endRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-[#050505] border-t border-white/10 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-[#111111] text-white rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 border border-white/10"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-md transition-colors disabled:opacity-50"
                >
                    <FiSend />
                </button>
            </form>
        </div>
    );
}



