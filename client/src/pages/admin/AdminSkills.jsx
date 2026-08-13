import { useState, useEffect, useMemo } from "react";
import { FiLoader, FiUsers, FiSearch, FiX } from "react-icons/fi";
import axiosClient from "../../api/axiosClient";
import CustomSelect from "../../components/ui/CustomSelect";

export default function AdminSkills() {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [skillUsers, setSkillUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);

    const fetchSkills = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get("/admin/skills");
            setSkills(res.data?.data || []);
        } catch (err) {
            console.error("Fetch skills error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSkills();
    }, []);

    const handleViewUsers = async (skill) => {
        setSelectedSkill(skill);
        setUsersLoading(true);
        try {
            const res = await axiosClient.get(`/admin/skills/${skill._id}/users`);
            setSkillUsers(res.data?.data || []);
        } catch (err) {
            console.error("Fetch skill users error:", err);
            setSkillUsers([]);
        } finally {
            setUsersLoading(false);
        }
    };

    const categories = useMemo(() => {
        const set = new Set();
        skills.forEach((s) => {
            if (s.category) set.add(s.category);
        });
        return ["all", ...Array.from(set)];
    }, [skills]);

    const filteredSkills = useMemo(() => {
        return skills.filter((skill) => {
            const matchesSearch =
                !search ||
                skill.title.toLowerCase().includes(search.toLowerCase()) ||
                skill.category?.toLowerCase().includes(search.toLowerCase());
            const matchesCategory =
                categoryFilter === "all" || skill.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [skills, search, categoryFilter]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header & Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">All Platform Skills</h1>
                    <p className="mt-1 text-sm text-white/40">
                        Manage all skills registered by teachers and learners on SkillSwap AI
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="inline-flex min-w-[160px] items-center justify-center rounded-2xl border border-orange-500/25 bg-orange-500/10 px-6 py-3 text-sm font-bold tracking-wide text-orange-400 shadow-sm">
                        Total Skills: {skills.length}
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/10 bg-[#0d0e15] p-4">
                <div className="relative flex-1 max-w-md">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search skills or categories..."
                        className="w-full rounded-xl border border-white/10 bg-[#090a0f] py-2.5 pl-10 pr-10 text-sm text-white outline-none placeholder:text-white/20 focus:border-orange-500/60"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                        >
                            <FiX />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-white/40 font-medium shrink-0">Category:</span>
                    <CustomSelect
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        options={categories.map((cat) => ({
                            value: cat,
                            label: cat.charAt(0).toUpperCase() + cat.slice(1)
                        }))}
                    />
                </div>
            </div>

            {/* Skills Table / List */}
            <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <FiLoader className="text-3xl text-orange-500 animate-spin" />
                    </div>
                ) : filteredSkills.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-white/40">
                        <FiSearch className="text-4xl text-orange-400/50 mb-3" />
                        <p className="text-base font-semibold">No skills found</p>
                        <p className="text-xs mt-1">Try adjusting your search or category filter.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredSkills.map((skill) => (
                            <div
                                key={skill._id}
                                className="group relative rounded-2xl border border-white/10 bg-white/[0.015] p-5 transition hover:border-orange-500/30 hover:bg-white/[0.03]"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <span className="inline-block rounded-md border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-orange-400 capitalize">
                                            {skill.category || "General"}
                                        </span>
                                        <h3 className="mt-2 text-lg font-bold text-white truncate">
                                            {skill.title}
                                        </h3>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4 text-xs text-white/40">
                                    <div className="flex items-center gap-1.5 font-medium">
                                        <FiUsers className="text-orange-400 text-sm" />
                                        <span>{skill.count || 1} User(s)</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleViewUsers(skill)}
                                        className="font-bold text-orange-400 hover:text-orange-300 transition"
                                    >
                                        View Users &rarr;
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Users Modal */}
            {selectedSkill && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#101117] p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div>
                                <span className="text-xs uppercase tracking-widest text-orange-400 font-semibold">
                                    Skill Users
                                </span>
                                <h2 className="text-xl font-bold text-white mt-1">
                                    {selectedSkill.title}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedSkill(null)}
                                className="rounded-xl border border-white/10 p-2 text-white/50 hover:bg-white/5 hover:text-white"
                            >
                                <FiX className="text-lg" />
                            </button>
                        </div>

                        <div className="mt-4">
                            {usersLoading ? (
                                <div className="flex justify-center py-8">
                                    <FiLoader className="text-2xl text-orange-500 animate-spin" />
                                </div>
                            ) : skillUsers.length === 0 ? (
                                <p className="py-8 text-center text-sm text-white/40">
                                    No active users found for this skill.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {skillUsers.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm"
                                        >
                                            <div>
                                                <p className="font-semibold text-white">
                                                    {item.user?.name || "Unknown User"}
                                                </p>
                                                <p className="text-xs text-white/40">{item.user?.email}</p>
                                            </div>
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${item.type === "teach"
                                                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                    }`}
                                            >
                                                {item.type === "teach" ? "wants to Teach" : "Wants to Learn"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
