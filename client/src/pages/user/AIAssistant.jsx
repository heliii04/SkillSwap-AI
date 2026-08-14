import { useState } from "react";
import AIChatbox from "../../components/ai/AIChatbox";
import RoadmapContainer from "../../components/ai/RoadmapContainer";
import QuizTaker from "../../components/ai/QuizTaker";
import { FiMessageSquare, FiMap, FiAward } from "react-icons/fi";
import { HiOutlineCpuChip } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";

export default function AIAssistant() {
    const [activeTab, setActiveTab] = useState("chat");

    const tabs = [
        { id: "chat", label: "AI Chat", icon: <FiMessageSquare /> },
        { id: "roadmap", label: "Roadmap", icon: <FiMap /> },
        { id: "quiz", label: "Quiz", icon: <FiAward /> }
    ];

    return (
        <main className="px-4 pb-8 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1500px]">
                <AIAssistantHero />

                <section className="mt-6 overflow-hidden rounded-[26px] border border-white/10 bg-[#121212]">
                    <div className="flex flex-col h-[calc(100vh-260px)] min-h-[620px]">
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 p-2.5 sm:p-4 border-b border-white/10 shrink-0 w-full">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 border w-full min-w-0 ${activeTab === tab.id
                                            ? "border-orange-500/25 text-orange-400 bg-orange-500/10"
                                            : "border-transparent text-white/40 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <span className="shrink-0 text-sm sm:text-base">{tab.icon}</span>
                                    <span className="truncate">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex-grow flex flex-col min-h-0 bg-[#0a0a0a]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex-grow flex flex-col h-full min-h-0 p-4 sm:p-6 overflow-y-auto custom-scrollbar"
                                >
                                    {activeTab === "chat" && (
                                        <div className="w-full mx-auto flex-grow flex flex-col min-h-0">
                                            <AIChatbox />
                                        </div>
                                    )}

                                    {activeTab === "roadmap" && (
                                        <div className="w-full mx-auto flex-grow flex flex-col min-h-0">
                                            <RoadmapContainer />
                                        </div>
                                    )}

                                    {activeTab === "quiz" && (
                                        <div className="w-full mx-auto flex-grow flex flex-col min-h-0">
                                            <QuizTaker />
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

function AIAssistantHero() {
    return (
        <section className="relative overflow-hidden rounded-[28px] border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-[#111111] to-[#050505] p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />

            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
                        <HiOutlineCpuChip className="text-lg" />
                        AI Assistant
                    </div>

                    <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">
                        Your Personal Learning Companion.
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">
                        Chat with our AI, generate structured roadmaps for any skill, or take personalized quizzes to evaluate and validate your knowledge.
                    </p>
                </div>
            </div>
        </section>
    );
}
