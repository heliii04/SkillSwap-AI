import { useState } from "react";
import { updateRoadmapProgress, getDailyPlan } from "../../api/aiApi";
import { FiCheckCircle, FiCircle, FiCalendar } from "react-icons/fi";
import { toast } from "react-toastify";

export default function RoadmapViewer({ roadmap, onUpdate }) {
    const [loadingTask, setLoadingTask] = useState(null);
    const [dailyPlan, setDailyPlan] = useState(null);
    const [loadingPlan, setLoadingPlan] = useState(false);
    const [availableMins, setAvailableMins] = useState(45);
    const [aiMessage, setAiMessage] = useState("");
    const [nextFocus, setNextFocus] = useState("");

    const handleToggleTask = async (weekNum, taskTitle, currentState) => {
        setLoadingTask(taskTitle);
        try {
            const res = await updateRoadmapProgress(roadmap._id, weekNum, taskTitle, !currentState);
            if (res.success) {
                onUpdate(res.data.roadmap);
                setAiMessage(res.data.aiMessage);
                setNextFocus(res.data.nextFocus);
                toast.success("Progress updated!");
            }
        } catch (error) {
            toast.error("Failed to update progress");
        } finally {
            setLoadingTask(null);
        }
    };

    const handleGetDailyPlan = async () => {
        setLoadingPlan(true);
        try {
            const res = await getDailyPlan(roadmap._id, availableMins);
            if (res.success) {
                setDailyPlan(res.data);
                toast.success("Daily plan generated!");
            }
        } catch (error) {
            toast.error("Failed to generate daily plan");
        } finally {
            setLoadingPlan(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-white/10 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Your {roadmap.skill} Roadmap</h2>
                    <div className="text-orange-500 font-bold">{roadmap.progress}% Completed</div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-[#111111] rounded-full h-2.5 mb-6">
                    <div className="bg-orange-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${roadmap.progress}%` }}></div>
                </div>

                {aiMessage && (
                    <div className="bg-[#111111] p-4 rounded-md mb-6 border border-white/10">
                        <p className="text-gray-300 italic">"{aiMessage}"</p>
                        <p className="text-orange-400 font-semibold mt-2">Next Focus: {nextFocus}</p>
                    </div>
                )}

                <div className="space-y-6">
                    {roadmap.weeks.map((week) => (
                        <div key={week.weekNumber} className="border-l-2 border-orange-500 pl-4">
                            <h3 className="text-lg font-semibold text-white mb-2">Week {week.weekNumber}: {week.focus}</h3>
                            <div className="space-y-3">
                                {week.tasks.map((task, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-3 bg-[#111111] rounded-md">
                                        <button 
                                            onClick={() => handleToggleTask(week.weekNumber, task.title, task.isCompleted)}
                                            disabled={loadingTask === task.title}
                                            className="mt-1 flex-shrink-0"
                                        >
                                            {loadingTask === task.title ? (
                                                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                            ) : task.isCompleted ? (
                                                <FiCheckCircle className="text-orange-500 w-5 h-5" />
                                            ) : (
                                                <FiCircle className="text-gray-500 w-5 h-5" />
                                            )}
                                        </button>
                                        <div>
                                            <h4 className={`font-medium ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                                                {task.title}
                                            </h4>
                                            <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Daily Plan Section */}
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-white/10 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <FiCalendar className="text-orange-500" /> Get Daily Plan
                </h3>
                <div className="flex gap-4 mb-4">
                    <input 
                        type="number" 
                        value={availableMins}
                        onChange={(e) => setAvailableMins(Number(e.target.value))}
                        className="bg-[#111111] text-white rounded-md px-4 py-2 focus:outline-none w-32"
                        placeholder="Minutes"
                    />
                    <button 
                        onClick={handleGetDailyPlan}
                        disabled={loadingPlan}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                    >
                        {loadingPlan ? "Generating..." : "Generate Plan"}
                    </button>
                </div>
                
                {dailyPlan && (
                    <div className="mt-6 space-y-3">
                        <h4 className="text-md font-semibold text-white">Today's Schedule ({dailyPlan.totalMinutes} mins)</h4>
                        {dailyPlan.plan.map((item, idx) => (
                            <div key={idx} className="p-3 border border-white/10 rounded-md bg-[#111111]/50 flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="text-orange-500 font-bold w-16 flex-shrink-0">{item.durationMinutes}m</div>
                                <div>
                                    <div className="font-medium text-gray-200">{item.activity}</div>
                                    <div className="text-sm text-gray-400">{item.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

