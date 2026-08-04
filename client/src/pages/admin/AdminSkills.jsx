import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FiLoader, FiEye, FiX, FiUsers } from "react-icons/fi";
import axiosClient from "../../api/axiosClient";

export default function AdminSkills() {
    const [searchParams] = useSearchParams();
    const currentSection = searchParams.get("section") || "skills";

    const [skillsList, setSkillsList] = useState([]);
    const [skillsLoading, setSkillsLoading] = useState(false);

    // View Skill Users State
    const [viewSkillModalOpen, setViewSkillModalOpen] = useState(false);
    const [viewSkillUsers, setViewSkillUsers] = useState([]);
    const [viewSkillTitle, setViewSkillTitle] = useState("");
    const [viewSkillLoading, setViewSkillLoading] = useState(false);

    // Lock background scroll when view modal is open
    useEffect(() => {
        if (viewSkillModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [viewSkillModalOpen]);

    const fetchSkillsList = async () => {
        setSkillsLoading(true);
        try {
            const response = await axiosClient.get("/admin/skills");
            setSkillsList(response.data?.data || []);
        } catch (err) {
            console.error("Error fetching skills list:", err);
        } finally {
            setSkillsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSkillsList();
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const handleViewSkillUsers = async (skill) => {
        setViewSkillTitle(skill.title);
        setViewSkillModalOpen(true);
        setViewSkillLoading(true);
        try {
            const res = await axiosClient.get(`/admin/skills/${skill._id}/users`);
            setViewSkillUsers(res.data?.data || []);
        } catch (error) {
            console.error("Error fetching skill users:", error);
            setViewSkillUsers([]);
        } finally {
            setViewSkillLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                <h2 className="text-lg font-bold mb-4">
                    {currentSection === "reported-skills" ? "Reported Skills" : "All Registered Skills"}
                </h2>
                {skillsLoading ? (
                    <div className="flex justify-center py-10">
                        <FiLoader className="text-2xl text-orange-500 animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-xs font-bold uppercase text-white/60">
                                    <th className="py-3 px-4">Title</th>
                                    <th className="py-3 px-4">Category</th>
                                    <th className="py-3 px-4">Type</th>
                                    <th className="py-3 px-4">Skill Count</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {skillsList
                                    .filter((s) => currentSection !== "reported-skills" || s.category === "other")
                                    .map((s) => (
                                        <tr key={s._id} className="hover:bg-white/[0.01]">
                                            <td className="py-3 px-4 font-semibold">{s.title}</td>
                                            <td className="py-3 px-4 text-white/60 capitalize">{s.category}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-1.5 flex-wrap">
                                                    {(Array.isArray(s.type) ? s.type : [s.type]).map((t, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-0.5 rounded text-xs font-semibold bg-orange-500/10 text-orange-400 uppercase"
                                                        >
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-white/45 font-semibold">{s.count || 0}</td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    onClick={() => handleViewSkillUsers(s)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20"
                                                >
                                                    <FiEye /> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal for View Skill Users */}
            {viewSkillModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0d0e15] p-6 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <FiUsers className="text-blue-400" /> Users associated with "{viewSkillTitle}"
                                </h3>
                                <p className="text-xs text-white/40 mt-1">Users offering or learning this skill</p>
                            </div>
                            <button
                                onClick={() => setViewSkillModalOpen(false)}
                                className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"
                            >
                                <FiX className="h-5 w-5" />
                            </button>
                        </div>

                        {viewSkillLoading ? (
                            <div className="flex justify-center py-10">
                                <FiLoader className="text-2xl text-orange-500 animate-spin" />
                            </div>
                        ) : viewSkillUsers.length === 0 ? (
                            <div className="py-8 text-center text-white/40 text-sm">
                                No active users found with this skill.
                            </div>
                        ) : (
                            <div className="max-h-[350px] overflow-y-auto space-y-3 custom-scrollbar pr-1">
                                {viewSkillUsers.map(({ user: u, type }) => (
                                    <div
                                        key={u._id}
                                        className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-white/[0.02]"
                                    >
                                        <div>
                                            <p className="font-semibold text-white text-sm">{u.name}</p>
                                            <p className="text-xs text-white/40">{u.email}</p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                type === "teach"
                                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                            }`}
                                        >
                                            {type === "teach" ? "Teacher" : "Learner"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
