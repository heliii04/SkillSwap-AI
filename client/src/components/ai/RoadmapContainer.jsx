import { useState, useEffect } from "react";
import RoadmapForm from "./RoadmapForm";
import RoadmapViewer from "./RoadmapViewer";
import { useAuth } from "../../context/AuthContext";
import useLockBodyScroll from "../../hooks/useLockBodyScroll";
import { FiMap, FiClock, FiTrash2, FiMoreVertical, FiPlus } from "react-icons/fi";

export default function RoadmapContainer() {
    const { user } = useAuth();
    const userId = user?._id || user?.id || "guest";

    const storageKey = `ai_roadmap_sessions_${userId}`;
    const currentKey = `ai_current_roadmap_id_${userId}`;

    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [activeRoadmap, setActiveRoadmap] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useLockBodyScroll(showHistory);

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        const parsed = saved ? JSON.parse(saved) : [];
        setSessions(parsed);

        // Always start fresh on mount/refresh/navigation
        setCurrentSessionId(null);
        setActiveRoadmap(null);
        localStorage.removeItem(currentKey);
    }, [userId, storageKey, currentKey]);

    const handleRoadmapGenerated = (roadmap) => {
        const newId = Date.now().toString();
        const rawSkill = roadmap?.skill || roadmap?.title || roadmap?.topic;
        const formattedTitle = rawSkill
            ? (rawSkill.toLowerCase().includes("roadmap") ? rawSkill : `${rawSkill} Roadmap`)
            : "Learning Roadmap";

        const enrichedRoadmap = {
            ...roadmap,
            title: roadmap?.title || formattedTitle,
        };

        setCurrentSessionId(newId);
        setActiveRoadmap(enrichedRoadmap);
        localStorage.setItem(currentKey, newId);

        setSessions((prev) => {
            const updated = [{ id: newId, roadmap: enrichedRoadmap, updatedAt: Date.now() }, ...prev];
            localStorage.setItem(storageKey, JSON.stringify(updated));
            return updated;
        });
    };

    const handleRoadmapUpdate = (updatedRoadmap) => {
        setActiveRoadmap(updatedRoadmap);
        setSessions((prev) => {
            const updated = prev.map((s) =>
                s.id === currentSessionId
                    ? { ...s, roadmap: updatedRoadmap, updatedAt: Date.now() }
                    : s
            );
            localStorage.setItem(storageKey, JSON.stringify(updated));
            return updated;
        });
    };

    const startNewRoadmap = () => {
        setCurrentSessionId(null);
        setActiveRoadmap(null);
        localStorage.removeItem(currentKey);
        setShowHistory(false);
    };

    const loadSession = (id) => {
        const session = sessions.find((s) => s.id === id);
        if (session) {
            setCurrentSessionId(id);
            setActiveRoadmap(session.roadmap);
            localStorage.setItem(currentKey, id);
        }
        setShowHistory(false);
    };

    const deleteSession = (id) => {
        const newSessions = sessions.filter((s) => s.id !== id);
        setSessions(newSessions);
        localStorage.setItem(storageKey, JSON.stringify(newSessions));

        if (currentSessionId === id) {
            if (newSessions.length > 0) {
                const nextId = newSessions[0].id;
                setCurrentSessionId(nextId);
                setActiveRoadmap(newSessions[0].roadmap);
                localStorage.setItem(currentKey, nextId);
            } else {
                clearAllHistory();
            }
        }
    };

    const clearAllHistory = () => {
        setSessions([]);
        localStorage.removeItem(storageKey);
        localStorage.removeItem(currentKey);
        startNewRoadmap();
    };

    return (
        <div className="relative flex flex-col flex-grow h-full min-h-0 bg-[#0a0a0a] rounded-lg border border-white/10 overflow-hidden shadow-lg">
            <div className="bg-[#050505] p-4 border-b border-white/10 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-white">AI Roadmap</h2>
                    <p className="text-xs text-gray-400">Generate personalized learning paths</p>
                </div>
                <div className="relative shrink-0">
                    <button
                        type="button"
                        onClick={() => setMenuOpen((prev) => !prev)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-white"
                        title="Options"
                    >
                        <FiMoreVertical className="text-lg" />
                    </button>

                    {menuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setMenuOpen(false)}
                            />
                            <div className="absolute right-0 top-11 z-50 min-w-[175px] rounded-xl border border-white/10 bg-[#12131a] p-1.5 shadow-2xl backdrop-blur-xl animate-fade-in space-y-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        startNewRoadmap();
                                    }}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-bold text-gray-300 transition hover:bg-white/5 hover:text-white whitespace-nowrap"
                                >
                                    <FiPlus className="text-sm text-orange-400" />
                                    New Roadmap
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        const saved = localStorage.getItem(storageKey);
                                        if (saved) setSessions(JSON.parse(saved));
                                        setShowHistory(true);
                                    }}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-bold text-gray-300 transition hover:bg-white/5 hover:text-white whitespace-nowrap"
                                >
                                    <FiClock className="text-sm text-orange-400" />
                                    History
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {showHistory && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#1a1a1a] w-full max-w-2xl rounded-2xl border border-white/10 flex flex-col max-h-[85vh] shadow-2xl">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-white font-semibold flex items-center gap-2"><FiClock /> Saved Roadmaps</h3>
                            <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-white text-xl leading-none font-bold">&times;</button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 space-y-2">
                            {sessions.length === 0 ? (
                                <p className="text-gray-400 text-center py-8">No saved roadmaps found.</p>
                            ) : (
                                sessions.map(session => {
                                    const rawSkill = session.roadmap?.skill || session.roadmap?.title || session.roadmap?.topic;
                                    const title = session.roadmap?.title || (rawSkill
                                        ? (rawSkill.toLowerCase().includes("roadmap") ? rawSkill : `${rawSkill} Roadmap`)
                                        : "Learning Roadmap");
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
                                                    className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors font-bold"
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
                            <button onClick={() => setShowHistory(false)} className="px-4 py-2 text-gray-300 hover:text-white transition font-bold">Close</button>
                            <button onClick={clearAllHistory} className="bg-red-600/20 text-red-500 px-4 py-2 rounded-md hover:bg-red-600/30 transition font-bold">
                                Clear All History
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-0 flex flex-col min-h-0">
                {!activeRoadmap ? (
                    <RoadmapForm onRoadmapGenerated={handleRoadmapGenerated} />
                ) : (
                    <div className="flex-grow flex flex-col p-4">
                        <RoadmapViewer roadmap={activeRoadmap} onUpdate={handleRoadmapUpdate} />
                    </div>
                )}
            </div>
        </div>
    );
}



