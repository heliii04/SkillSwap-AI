import { useState, useEffect } from "react";
import RoadmapForm from "./RoadmapForm";
import RoadmapViewer from "./RoadmapViewer";
import { FiMap, FiClock , FiTrash2 } from "react-icons/fi";

export default function RoadmapContainer() {
    const [sessions, setSessions] = useState(() => {
        const saved = localStorage.getItem("ai_roadmap_sessions");
        return saved ? JSON.parse(saved) : [];
    });
    
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [activeRoadmap, setActiveRoadmap] = useState(null);
    const [showHistory, setShowHistory] = useState(false);

    const handleRoadmapGenerated = (roadmap) => {
        const newId = Date.now().toString();
        setCurrentSessionId(newId);
        setActiveRoadmap(roadmap);
        
        setSessions(prev => {
            const updated = [{ id: newId, roadmap, updatedAt: Date.now() }, ...prev];
            localStorage.setItem("ai_roadmap_sessions", JSON.stringify(updated));
            return updated;
        });
    };

    const handleRoadmapUpdate = (updatedRoadmap) => {
        setActiveRoadmap(updatedRoadmap);
        setSessions(prev => {
            const updated = prev.map(s => s.id === currentSessionId ? { ...s, roadmap: updatedRoadmap, updatedAt: Date.now() } : s);
            localStorage.setItem("ai_roadmap_sessions", JSON.stringify(updated));
            return updated;
        });
    };

    const startNewRoadmap = () => {
        setCurrentSessionId(null);
        setActiveRoadmap(null);
        setShowHistory(false);
    };

    const loadSession = (id) => {
        const session = sessions.find(s => s.id === id);
        if (session) {
            setCurrentSessionId(id);
            setActiveRoadmap(session.roadmap);
        }
        setShowHistory(false);
    };

        const deleteSession = (id) => {
        const newSessions = sessions.filter(s => s.id !== id);
        setSessions(newSessions);
        
        // We need to determine the storage key dynamically based on the file since each file uses a different key
        const isChat = "client/src/components/ai/RoadmapContainer.jsx".includes("AIChatbox");
        const isRoadmap = "client/src/components/ai/RoadmapContainer.jsx".includes("Roadmap");
        const isQuiz = "client/src/components/ai/RoadmapContainer.jsx".includes("Quiz");
        
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
        localStorage.removeItem("ai_roadmap_sessions");
        startNewRoadmap();
    };

    return (
        <div className="relative flex flex-col flex-grow h-full min-h-0 bg-[#0a0a0a] rounded-lg border border-white/10 overflow-hidden shadow-lg">
            <div className="bg-[#050505] p-4 border-b border-white/10 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-white">AI Roadmap</h2>
                    <p className="text-xs text-gray-400">Generate personalized learning paths</p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={startNewRoadmap}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors border border-white/10 hover:border-gray-500 px-3 py-1.5 rounded-md font-bold"
                    >
                        + New Roadmap
                    </button>
                    <button className="font-bold" 
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
                            <h3 className="text-white font-semibold flex items-center gap-2"><FiClock /> Saved Roadmaps</h3>
                            <button className="font-bold" onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-white text-xl leading-none">&times;</button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 space-y-2">
                            {sessions.length === 0 ? (
                                <p className="text-gray-400 text-center py-8">No saved roadmaps found.</p>
                            ) : (
                                sessions.map(session => {
                                    const title = session.roadmap?.title || "Untitled Roadmap";
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
    <button className="font-bold" 
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
                            <button className="font-bold" onClick={() => setShowHistory(false)} className="px-4 py-2 text-gray-300 hover:text-white transition">Close</button>
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



