import { useState, useEffect } from "react";
import {
    generateQuiz,
    saveQuizResultApi,
    fetchQuizResultsHistory,
    deleteQuizResultApi,
    clearAllQuizResultsApi,
} from "../../api/aiApi";
import { useAuth } from "../../context/AuthContext";
import { hasSessionHint } from "../../api/tokenStore";
import { FiCheck, FiX, FiAward, FiClock, FiTrash2, FiMoreVertical, FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";

export default function QuizTaker() {
    const { user } = useAuth();
    const userId = user?._id || user?.id || "guest";

    const [topic, setTopic] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const loadHistory = async () => {
            if (!hasSessionHint()) return;
            try {
                const res = await fetchQuizResultsHistory();
                if (res?.data?.quizResults && isMounted) {
                    const historyList = res.data.quizResults;
                    setSessions(historyList);
                }
            } catch (err) {
                console.error("Error loading quiz history from DB:", err);
            }
        };

        if (userId && userId !== "guest" && hasSessionHint()) {
            loadHistory();
        }
        return () => {
            isMounted = false;
        };
    }, [userId]);

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
                const questions = res.data.questions;
                setQuizData(questions);

                if (userId && userId !== "guest" && hasSessionHint()) {
                    try {
                        const savedRes = await saveQuizResultApi({
                            topic,
                            score: 0,
                            totalQuestions: questions.length,
                            quizData: questions,
                            userAnswers: {},
                        });
                        if (savedRes?.data?.quizResult?._id) {
                            setCurrentSessionId(savedRes.data.quizResult._id);
                        } else {
                            setCurrentSessionId(Date.now().toString());
                        }
                        const historyRes = await fetchQuizResultsHistory();
                        if (historyRes?.data?.quizResults) {
                            setSessions(historyRes.data.quizResults);
                        }
                    } catch (err) {
                        console.error("Error auto-saving generated quiz to DB:", err);
                        setCurrentSessionId(Date.now().toString());
                    }
                } else {
                    setCurrentSessionId(Date.now().toString());
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to generate quiz");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptionSelect = (qIndex, option) => {
        if (showResults) return;
        setUserAnswers({ ...userAnswers, [qIndex]: option });
    };

    const handleSubmitQuiz = async () => {
        if (!quizData) return;
        let newScore = 0;
        quizData.forEach((q, idx) => {
            if (userAnswers[idx] === q.correctAnswer) {
                newScore++;
            }
        });
        setScore(newScore);
        setShowResults(true);

        if (userId && userId !== "guest" && hasSessionHint()) {
            try {
                await saveQuizResultApi({
                    id: currentSessionId,
                    topic,
                    score: newScore,
                    totalQuestions: quizData.length,
                    quizData,
                    userAnswers,
                });
                toast.success("Quiz completed! Score saved to database.");
                const res = await fetchQuizResultsHistory();
                if (res?.data?.quizResults) {
                    setSessions(res.data.quizResults);
                }
            } catch (err) {
                console.error("Error saving quiz result to DB:", err);
            }
        } else {
            toast.success("Quiz completed!");
        }
    };

    const startNewQuiz = () => {
        setTopic("");
        setQuizData(null);
        setUserAnswers({});
        setShowResults(false);
        setScore(0);
        setCurrentSessionId(null);
        setShowHistory(false);
    };

    const loadSession = (session) => {
        setTopic(session.topic || "");
        setQuizData(session.quizData || []);
        setUserAnswers(session.userAnswers || {});
        setShowResults(true);
        setScore(session.score || 0);
        setCurrentSessionId(session._id || session.id);
        setShowHistory(false);
    };

    const deleteSession = async (id) => {
        if (userId && userId !== "guest" && hasSessionHint()) {
            try {
                await deleteQuizResultApi(id);
                toast.info("Quiz result removed.");
            } catch (err) {
                console.error("Error deleting quiz result:", err);
            }
        }

        const newSessions = sessions.filter((s) => (s._id || s.id) !== id);
        setSessions(newSessions);

        if ((currentSessionId?._id || currentSessionId) === id) {
            startNewQuiz();
        }
    };

    const clearAllHistory = async () => {
        if (userId && userId !== "guest" && hasSessionHint()) {
            try {
                await clearAllQuizResultsApi();
                toast.info("Quiz history cleared.");
            } catch (err) {
                console.error("Error clearing quiz history:", err);
            }
        }
        setSessions([]);
        startNewQuiz();
    };

    return (
        <div className="relative flex flex-col flex-grow h-full min-h-0 bg-[#0a0a0a] rounded-lg border border-white/10 overflow-hidden shadow-lg">
            <div className="bg-[#050505] p-4 border-b border-white/10 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-white">AI Quiz</h2>
                    <p className="text-xs text-gray-400">Test your knowledge with AI generated quizzes</p>
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
                                        startNewQuiz();
                                    }}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-bold text-gray-300 transition hover:bg-white/5 hover:text-white whitespace-nowrap"
                                >
                                    <FiPlus className="text-sm text-orange-400" />
                                    New Quiz
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        if (userId && userId !== "guest" && hasSessionHint()) {
                                            fetchQuizResultsHistory().then((res) => {
                                                if (res?.data?.quizResults) setSessions(res.data.quizResults);
                                            }).catch(() => { });
                                        }
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
                            <h3 className="text-white font-semibold flex items-center gap-2"><FiClock /> Saved Quizzes</h3>
                            <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-white text-xl leading-none font-bold">&times;</button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 space-y-2">
                            {sessions.length === 0 ? (
                                <p className="text-gray-400 text-center py-8">No saved quizzes found.</p>
                            ) : (
                                sessions.map(session => {
                                    const sId = session._id || session.id;
                                    const title = session.topic || "Untitled Quiz";
                                    const date = new Date(session.updatedAt || session.createdAt).toLocaleString();
                                    const scoreText = `Score: ${session.score}/${session.totalQuestions || session.quizData?.length || 5} (${session.percentage ?? Math.round((session.score / (session.totalQuestions || 5)) * 100)}%)`;

                                    return (
                                        <div
                                            key={sId}
                                            onClick={() => loadSession(session)}
                                            className={`p-3 rounded-md cursor-pointer border transition-colors ${currentSessionId === sId ? 'bg-orange-600/10 border-orange-500' : 'bg-[#111111] border-white/10 hover:border-gray-500 hover:bg-[#1a1a1a]'}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <p className="text-sm text-gray-200 font-medium truncate">{title}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{date} • <span className="text-orange-400 font-semibold">{scoreText}</span></p>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteSession(sId); }}
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

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 flex flex-col min-h-0">
                {!quizData && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-full py-8 sm:py-12 px-2">
                        <FiAward className="text-5xl sm:text-6xl text-gray-700 mb-4 shrink-0" />
                        <h2 className="text-xl font-bold text-white mb-2 text-center">Generate an AI Quiz</h2>
                        <p className="text-gray-400 mb-6 text-center max-w-md text-sm sm:text-base">Enter a topic to generate a quick 5-question test to evaluate your knowledge.</p>
                        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-2.5 w-full max-w-md">
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Topic (e.g. React Hooks)"
                                className="w-full sm:flex-1 bg-[#111111] text-white rounded-md px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-orange-500 border border-white/10 text-sm sm:text-base"
                            />
                            <button
                                type="submit"
                                disabled={!topic.trim()}
                                className="w-full sm:w-auto shrink-0 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-md transition-colors disabled:opacity-50 font-bold text-sm sm:text-base whitespace-nowrap"
                            >
                                Generate Quiz
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




