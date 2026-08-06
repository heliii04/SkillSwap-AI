import { useState, useEffect } from "react";
import { generateQuiz } from "../../api/aiApi";
import { useAuth } from "../../context/AuthContext";
import { FiCheck, FiX, FiAward, FiClock , FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";

export default function QuizTaker() {
    const { user } = useAuth();
    const userId = user?._id || user?.id || "guest";

    const storageKey = `ai_quiz_sessions_${userId}`;
    const currentKey = `ai_current_quiz_id_${userId}`;

    const [topic, setTopic] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        const parsed = saved ? JSON.parse(saved) : [];
        setSessions(parsed);

        const activeId = localStorage.getItem(currentKey);
        if (activeId) {
            const found = parsed.find((s) => s.id === activeId);
            if (found) {
                setCurrentSessionId(found.id);
                setTopic(found.topic || "");
                setQuizData(found.quizData || null);
                setUserAnswers(found.userAnswers || {});
                setShowResults(Boolean(found.showResults));
                setScore(found.score || 0);
                return;
            }
        }
        startNewQuiz();
    }, [userId, storageKey, currentKey]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;
        
        setIsLoading(true);
        setQuizData(null);
        setShowResults(false);
        setUserAnswers({});
        
        try {
            const res = await generateQuiz(topic, 5);
            if (res.success && res.data?.questions) {
                setQuizData(res.data.questions);
                const newId = Date.now().toString();
                setCurrentSessionId(newId);
                localStorage.setItem(currentKey, newId);

                setSessions((prev) => {
                    const updated = [{ id: newId, topic, quizData: res.data.questions, userAnswers: {}, showResults: false, score: 0, updatedAt: Date.now() }, ...prev];
                    localStorage.setItem(storageKey, JSON.stringify(updated));
                    return updated;
                });
            }
        } catch (error) {
            toast.error("Failed to generate quiz");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptionSelect = (qIndex, option) => {
        if (showResults) return;
        setUserAnswers({ ...userAnswers, [qIndex]: option });
    };

    const handleSubmitQuiz = () => {
        if (!quizData) return;
        let newScore = 0;
        quizData.forEach((q, idx) => {
            if (userAnswers[idx] === q.correctAnswer) {
                newScore++;
            }
        });
        setScore(newScore);
        setShowResults(true);

        if (currentSessionId) {
            setSessions((prev) => {
                const updated = prev.map((s) => s.id === currentSessionId ? { ...s, userAnswers, showResults: true, score: newScore, updatedAt: Date.now() } : s);
                localStorage.setItem(storageKey, JSON.stringify(updated));
                return updated;
            });
        }
    };

    const startNewQuiz = () => {
        setTopic("");
        setQuizData(null);
        setUserAnswers({});
        setShowResults(false);
        setScore(0);
        setCurrentSessionId(null);
        localStorage.removeItem(currentKey);
        setShowHistory(false);
    };

    const loadSession = (id) => {
        const session = sessions.find((s) => s.id === id);
        if (session) {
            setCurrentSessionId(session.id);
            setTopic(session.topic || "");
            setQuizData(session.quizData || null);
            setUserAnswers(session.userAnswers || {});
            setShowResults(Boolean(session.showResults));
            setScore(session.score || 0);
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
                loadSession(nextId);
            } else {
                clearAllHistory();
            }
        }
    };

    const clearAllHistory = () => {
        setSessions([]);
        localStorage.removeItem(storageKey);
        localStorage.removeItem(currentKey);
        startNewQuiz();
    };

    return (
        <div className="relative flex flex-col flex-grow h-full min-h-0 bg-[#0a0a0a] rounded-lg border border-white/10 overflow-hidden shadow-lg">
            <div className="bg-[#050505] p-4 border-b border-white/10 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-white">AI Quiz</h2>
                    <p className="text-xs text-gray-400">Test your knowledge with AI generated quizzes</p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={startNewQuiz}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors border border-white/10 hover:border-gray-500 px-3 py-1.5 rounded-md font-bold"
                    >
                        + New Quiz
                    </button>
                    <button 
                        onClick={() => {
                            const saved = localStorage.getItem(storageKey);
                            if (saved) setSessions(JSON.parse(saved));
                            setShowHistory(true);
                        }}
                        className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-orange-500 transition-colors border border-white/10 hover:border-orange-500 px-3 py-1.5 rounded-md"
                    >
                        <FiClock /> History
                    </button>
                </div>
            </div>

            {showHistory && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#1a1a1a] w-full max-w-2xl rounded-2xl border border-white/10 flex flex-col max-h-[85vh] shadow-2xl">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-white font-semibold flex items-center gap-2"><FiClock /> Saved Quizzes</h3>
                            <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-white text-xl leading-none font-bold">&times;</button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 space-y-2">
                            {sessions.length === 0 ? (
                                <p className="text-gray-400 text-center py-8">No saved quizzes found.</p>
                            ) : (
                                sessions.map(session => {
                                    const title = session.topic || "Untitled Quiz";
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
                                                    <p className="text-xs text-gray-500 mt-1">{date} - Score: {session.score}/{session.quizData?.length || 5}</p>
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

            <div className="flex-1 overflow-y-auto p-6 flex flex-col min-h-0">
                {!quizData && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full py-12">
                    <FiAward className="text-6xl text-gray-700 mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Generate an AI Quiz</h2>
                    <p className="text-gray-400 mb-6 text-center max-w-md">Enter a topic to generate a quick 5-question test to evaluate your knowledge.</p>
                    <form onSubmit={handleGenerate} className="flex gap-2 w-full max-w-md">
                        <input 
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Topic (e.g. React Hooks)"
                            className="flex-1 bg-[#111111] text-white rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 border border-white/10"
                        />
                        <button 
                            type="submit"
                            disabled={!topic.trim()}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50 font-bold"
                        >
                            Generate
                        </button>
                    </form>
                </div>
            )}

            {isLoading && (
                <div className="flex flex-col items-center justify-center h-full py-20">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-400">Crafting questions...</p>
                </div>
            )}

            {quizData && (
                <div className="space-y-8">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <h2 className="text-xl font-bold text-white capitalize">{topic} Quiz</h2>
                        {showResults && (
                            <div className="text-lg font-bold text-orange-500">
                                Score: {score} / {quizData.length}
                            </div>
                        )}
                    </div>

                    <div className="space-y-8">
                        {quizData.map((q, qIndex) => (
                            <div key={qIndex} className="bg-[#111111]/50 p-5 rounded-lg border border-white/10">
                                <h3 className="text-lg font-medium text-white mb-4">
                                    <span className="text-gray-500 mr-2">{qIndex + 1}.</span>
                                    {q.questionText}
                                </h3>
                                
                                <div className="space-y-3">
                                    {q.options && q.options.length > 0 && q.options.some(opt => opt.trim() !== "") ? (
                                        q.options.map((opt, oIndex) => {
                                            const isSelected = userAnswers[qIndex] === opt;
                                            const isCorrect = opt === q.correctAnswer;
                                            
                                            let btnClass = "w-full text-left p-3 rounded-md border transition-colors ";
                                            if (showResults) {
                                                if (isCorrect) btnClass += "bg-green-900/30 border-green-500 text-white";
                                                else if (isSelected && !isCorrect) btnClass += "bg-red-900/30 border-red-500 text-white";
                                                else btnClass += "bg-[#111111] border-white/10 text-gray-400";
                                            } else {
                                                if (isSelected) btnClass += "bg-orange-600/20 border-orange-500 text-white";
                                                else btnClass += "bg-[#111111] border-white/10 hover:border-gray-500 text-gray-200";
                                            }

                                            return (
                                                <button
                                                    key={oIndex}
                                                    onClick={() => handleOptionSelect(qIndex, opt)}
                                                    className={`${btnClass} font-bold`}
                                                    disabled={showResults}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span>{opt}</span>
                                                        {showResults && isCorrect && <FiCheck className="text-green-500" />}
                                                        {showResults && isSelected && !isCorrect && <FiX className="text-red-500" />}
                                                    </div>
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <textarea
                                            value={userAnswers[qIndex] || ""}
                                            onChange={(e) => handleOptionSelect(qIndex, e.target.value)}
                                            disabled={showResults}
                                            placeholder="Type your code or answer here..."
                                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-orange-500 min-h-[120px] font-mono text-sm resize-y"
                                        />
                                    )}
                                </div>

                                {showResults && (
                                    <div className="mt-4 p-4 bg-[#0a0a0a] rounded-md border border-white/10">
                                        {(!q.options || q.options.length === 0 || !q.options.some(opt => opt.trim() !== "")) && (
                                            <div className="mb-3">
                                                <strong className="text-green-400 block mb-1">Expected Answer / Solution:</strong>
                                                <div className="p-3 bg-[#050505] rounded border border-white/10 font-mono text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
                                                    {q.correctAnswer}
                                                </div>
                                            </div>
                                        )}
                                        <p className="text-sm text-gray-400"><strong className="text-gray-200">Explanation:</strong> {q.explanation}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {!showResults ? (
                        <button 
                            onClick={handleSubmitQuiz}
                            disabled={Object.keys(userAnswers).length < quizData.length}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white  py-3 rounded-md transition-colors disabled:opacity-50 font-bold"
                        >
                            Submit Quiz
                        </button>
                    ) : (
                        <button 
                            onClick={startNewQuiz}
                            className="w-full bg-[#1a1a1a] hover:bg-[#222222] text-white  py-3 rounded-md transition-colors font-bold"
                        >
                            Start New Quiz
                        </button>
                    )}
                </div>
            )}
            </div>
        </div>
    );
}




