import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    useRef,
} from "react";

import { getAccessToken } from "../api/tokenStore";

import {
    HiOutlineBookOpen,
    HiOutlineCheck,
    HiOutlineAcademicCap,
    HiOutlinePencilSquare,
    HiOutlinePlus,
    HiOutlineTag,
    HiOutlineTrash,
    HiOutlineUserGroup,
    HiOutlineXMark,
    HiOutlineClock,
} from "react-icons/hi2";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

const categories = [
    {
        value: "technology",
        label: "Technology",
    },
    {
        value: "design",
        label: "Design",
    },
    {
        value: "business",
        label: "Business",
    },
    {
        value: "marketing",
        label: "Marketing",
    },
    {
        value: "languages",
        label: "Languages",
    },
    {
        value: "music",
        label: "Music",
    },
    {
        value: "academics",
        label: "Academics",
    },
    {
        value: "fitness",
        label: "Fitness",
    },
    {
        value: "photography",
        label: "Photography",
    },
    {
        value: "lifestyle",
        label: "Lifestyle",
    },
    {
        value: "other",
        label: "Other",
    },
];

const currentLevels = [
    {
        value: "complete-beginner",
        label: "Complete Beginner",
    },
    {
        value: "beginner",
        label: "Beginner",
    },
    {
        value: "intermediate",
        label: "Intermediate",
    },
    {
        value: "advanced",
        label: "Advanced",
    },
];

const targetLevels = [
    {
        value: "beginner",
        label: "Beginner",
    },
    {
        value: "intermediate",
        label: "Intermediate",
    },
    {
        value: "advanced",
        label: "Advanced",
    },
    {
        value: "expert",
        label: "Expert",
    },
];

const priorityLevels = [
    {
        value: "low",
        label: "Low Priority",
    },
    {
        value: "medium",
        label: "Medium Priority",
    },
    {
        value: "high",
        label: "High Priority",
    },
];

const learningModes = [
    {
        value: "online",
        label: "Online",
    },
    {
        value: "offline",
        label: "Offline",
    },
    {
        value: "both",
        label: "Online & Offline",
    },
];

const weekDays = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
];

const emptyForm = {
    title: "",
    category: "technology",
    currentLevel: "complete-beginner",
    targetLevel: "beginner",
    learningGoal: "",
    priority: "medium",
    preferredLearningMode: "online",

    availability: {
        days: [],
        timeSlot: "flexible",
    },

    tagsInput: "",
    isActive: true,
};

export default function SkillsWant() {
    const [skills, setSkills] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState(null);

    const [modalOpen, setModalOpen] =
        useState(false);

    const [editingSkill, setEditingSkill] =
        useState(null);

    const [formData, setFormData] =
        useState(emptyForm);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const activeSkills = useMemo(
        () =>
            skills.filter(
                (skill) =>
                    skill.isActive
            ).length,
        [skills]
    );

    const loadSkills =
        useCallback(async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_URL}/skills/learn`,
                    {
                        method: "GET",
                        credentials: "include",
                        headers: {
                            Accept: "application/json",
                            Authorization: `Bearer ${getAccessToken()}`,
                        },
                    }
                );

                const data =
                    await response
                        .json()
                        .catch(() => null);

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                        "Unable to load learning goals"
                    );
                }

                setSkills(
                    data?.data?.skills ||
                    []
                );
            } catch (requestError) {
                setError(
                    requestError.message ||
                    "Unable to load learning goals"
                );
            } finally {
                setLoading(false);
            }
        }, []);

    useEffect(() => {
        loadSkills();
    }, [loadSkills]);

    useEffect(() => {
        if (modalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [modalOpen]);

    const openCreateModal = () => {
        setEditingSkill(null);
        setFormData(emptyForm);
        setError("");
        setSuccess("");
        setModalOpen(true);
    };

    const openEditModal = (skill) => {
        setEditingSkill(skill);

        setFormData({
            title: skill.title,
            category:
                skill.category,
            currentLevel: skill.currentLevel,
            targetLevel: skill.targetLevel,
            learningGoal:
                skill.learningGoal,
            priority: skill.priority,
            preferredLearningMode:
                skill.preferredLearningMode,

            availability: {
                days:
                    skill.availability
                        ?.days || [],

                timeSlot:
                    skill.availability
                        ?.timeSlot ||
                    "flexible",
            },

            tagsInput:
                skill.tags?.join(", ") ||
                "",

            isActive:
                skill.isActive,
        });

        setError("");
        setSuccess("");
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) {
            return;
        }

        setModalOpen(false);
        setEditingSkill(null);
        setFormData(emptyForm);
    };

    const handleChange = (
        event
    ) => {
        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setError("");

        if (
            name ===
            "availability.timeSlot"
        ) {
            setFormData((current) => ({
                ...current,

                availability: {
                    ...current.availability,

                    timeSlot: value,
                },
            }));

            return;
        }

        setFormData((current) => ({
            ...current,

            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    const toggleDay = (day) => {
        setFormData((current) => {
            const selectedDays =
                current.availability.days;

            const days =
                selectedDays.includes(
                    day
                )
                    ? selectedDays.filter(
                        (item) =>
                            item !== day
                    )
                    : [
                        ...selectedDays,
                        day,
                    ];

            return {
                ...current,

                availability: {
                    ...current.availability,
                    days,
                },
            };
        });
    };

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const levelOrder = {
                "complete-beginner": 0,
                beginner: 1,
                intermediate: 2,
                advanced: 3,
                expert: 4,
            };

            if (
                levelOrder[formData.targetLevel] <
                levelOrder[formData.currentLevel]
            ) {
                throw new Error(
                    "Target level cannot be lower than current level"
                );
            }

            const tags =
                formData.tagsInput
                    .split(",")
                    .map((tag) =>
                        tag.trim()
                    )
                    .filter(Boolean);

            const payload = {
                title:
                    formData.title.trim(),

                category:
                    formData.category,

                currentLevel:
                    formData.currentLevel,

                targetLevel:
                    formData.targetLevel,

                learningGoal:
                    formData.learningGoal.trim(),

                priority:
                    formData.priority,

                preferredLearningMode:
                    formData.preferredLearningMode,

                availability:
                    formData.availability,

                tags,

                isActive:
                    formData.isActive,
            };

            const isEditing =
                Boolean(editingSkill);

            const url = isEditing
                ? `${API_URL}/skills/learn/${editingSkill.id}`
                : `${API_URL}/skills/learn`;

            const response = await fetch(
                url,
                {
                    method: isEditing
                        ? "PATCH"
                        : "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Accept: "application/json",
                        Authorization: `Bearer ${getAccessToken()}`,
                    },

                    body: JSON.stringify(
                        payload
                    ),
                }
            );

            const data =
                await response
                    .json()
                    .catch(() => null);

            if (!response.ok) {
                const validationMessage =
                    data?.errors
                        ?.map(
                            (item) =>
                                item.message
                        )
                        .filter(Boolean)
                        .join(", ");

                throw new Error(
                    validationMessage ||
                    data?.message ||
                    "Unable to save learning goal"
                );
            }

            const savedSkill =
                data?.data?.skill;

            if (isEditing) {
                setSkills((current) =>
                    current.map(
                        (skill) =>
                            skill.id ===
                                savedSkill.id
                                ? savedSkill
                                : skill
                    )
                );
            } else {
                setSkills((current) => [
                    savedSkill,
                    ...current,
                ]);
            }

            setModalOpen(false);
            setEditingSkill(null);
            setFormData(emptyForm);

            setSuccess(
                isEditing
                    ? "Learning goal updated successfully."
                    : "Learning goal added successfully."
            );
        } catch (requestError) {
            setError(
                requestError.message ||
                "Unable to save learning goal"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (
        skill
    ) => {
        const confirmed =
            window.confirm(
                `Delete "${skill.title}" from your learning goals?`
            );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(skill.id);
            setError("");
            setSuccess("");

            const response = await fetch(
                `${API_URL}/skills/learn/${skill.id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${getAccessToken()}`,
                    },
                }
            );

            const data =
                await response
                    .json()
                    .catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    "Unable to delete learning goal"
                );
            }

            setSkills((current) =>
                current.filter(
                    (item) =>
                        item.id !==
                        skill.id
                )
            );

            setSuccess(
                "Learning goal deleted successfully."
            );
        } catch (requestError) {
            setError(
                requestError.message ||
                "Unable to delete learning goal"
            );
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <main className="px-4 pb-12 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1500px]">
                <section className="relative overflow-hidden rounded-[28px] border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-[#111218] to-[#0d0e13] p-6 sm:p-8">
                    <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />

                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
                                <HiOutlineBookOpen className="text-lg" />
                                Skills I Want
                            </div>

                            <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">
                                Discover what you can learn.
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">
                                Add the skills you want to learn and your current levels so SkillSwap AI can match you with the right mentors.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={
                                openCreateModal
                            }
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-orange-400"
                        >
                            <HiOutlinePlus className="text-xl" />
                            Add learning goal
                        </button>
                    </div>
                </section>

                {error && (
                    <Alert
                        type="error"
                        message={error}
                        onClose={() =>
                            setError("")
                        }
                    />
                )}

                {success && (
                    <Alert
                        type="success"
                        message={success}
                        onClose={() =>
                            setSuccess("")
                        }
                    />
                )}

                <section className="mt-5 grid gap-4 sm:grid-cols-3">
                    <StatCard
                        label="Total learning goals"
                        value={skills.length}
                        icon={
                            HiOutlineBookOpen
                        }
                    />

                    <StatCard
                        label="Active goals"
                        value={activeSkills}
                        icon={
                            HiOutlineCheck
                        }
                    />

                    <StatCard
                        label="Learning modes"
                        value={
                            new Set(
                                skills.map(
                                    (skill) =>
                                        skill.preferredLearningMode
                                )
                            ).size
                        }
                        icon={
                            HiOutlineUserGroup
                        }
                    />
                </section>

                <section className="mt-8">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">
                            Your aspirations
                        </p>

                        <h2 className="mt-2 text-2xl font-semibold">
                            Learning goals
                        </h2>

                        <p className="mt-2 text-sm text-white/40">
                            Manage the skills you want to learn.
                        </p>
                    </div>

                    {loading ? (
                        <LoadingState />
                    ) : skills.length ===
                        0 ? (
                        <EmptyState
                            onAdd={
                                openCreateModal
                            }
                        />
                    ) : (
                        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {skills.map(
                                (skill) => (
                                    <SkillCard
                                        key={
                                            skill.id
                                        }
                                        skill={
                                            skill
                                        }
                                        deleting={
                                            deletingId ===
                                            skill.id
                                        }
                                        onEdit={() =>
                                            openEditModal(
                                                skill
                                            )
                                        }
                                        onDelete={() =>
                                            handleDelete(
                                                skill
                                            )
                                        }
                                    />
                                )
                            )}
                        </div>
                    )}
                </section>
            </div>

            {modalOpen && (
                <SkillModal
                    formData={formData}
                    editing={
                        Boolean(
                            editingSkill
                        )
                    }
                    saving={saving}
                    onChange={
                        handleChange
                    }
                    onToggleDay={
                        toggleDay
                    }
                    onClose={
                        closeModal
                    }
                    onSubmit={
                        handleSubmit
                    }
                />
            )}
        </main>
    );
}

function SkillCard({
    skill,
    deleting,
    onEdit,
    onDelete,
}) {
    return (
        <article className="group flex min-h-80 flex-col rounded-[24px] border border-white/10 bg-[#101117] p-5 transition hover:-translate-y-1 hover:border-orange-500/35 sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-black">
                    <HiOutlineBookOpen className="text-2xl" />
                </span>

                <span
                    className={`rounded-full border px-3 py-1.5 text-xs ${skill.isActive
                        ? "border-green-500/25 bg-green-500/10 text-green-300"
                        : "border-white/10 bg-white/[0.03] text-white/35"
                        }`}
                >
                    {skill.isActive
                        ? "Active"
                        : "Inactive"}
                </span>
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-orange-400">
                <span>
                    {skill.category}
                </span>

                <span className="text-white/20">
                    •
                </span>

                <span className="capitalize">
                    {skill.priority} Priority
                </span>
            </div>

            <h3 className="mt-3 text-xl font-semibold">
                {skill.title}
            </h3>

            <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-white/40">
                {skill.learningGoal}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
                <Badge
                    icon={HiOutlineAcademicCap}
                    text={`Current: ${skill.currentLevel}`}
                />

                <Badge
                    icon={HiOutlineAcademicCap}
                    text={`Target: ${skill.targetLevel}`}
                />

                <Badge
                    icon={HiOutlineUserGroup}
                    text={skill.preferredLearningMode}
                />
            </div>

            {skill.tags?.length >
                0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {skill.tags
                            .slice(0, 4)
                            .map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-lg bg-white/[0.04] px-2.5 py-1 text-xs text-white/35"
                                >
                                    #{tag}
                                </span>
                            ))}
                    </div>
                )}

            <div className="mt-6 flex gap-3 border-t border-white/10 pt-5">
                <button
                    type="button"
                    onClick={onEdit}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/55 transition hover:border-orange-500/30 hover:text-orange-400"
                >
                    <HiOutlinePencilSquare />
                    Edit
                </button>

                <button
                    type="button"
                    onClick={onDelete}
                    disabled={deleting}
                    className="inline-flex items-center justify-center rounded-xl border border-red-500/20 px-4 py-3 text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                    aria-label="Delete goal"
                >
                    <HiOutlineTrash />
                </button>
            </div>
        </article>
    );
}

function SkillModal({
    formData,
    editing,
    saving,
    onChange,
    onToggleDay,
    onClose,
    onSubmit,
}) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-white/10 bg-[#101117]">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#101117]/95 px-5 py-5 backdrop-blur-xl sm:px-7">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                            Learning goal
                        </p>

                        <h2 className="mt-2 text-xl font-semibold">
                            {editing
                                ? "Edit learning goal"
                                : "Add a new learning goal"}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-xl border border-white/10 p-2.5 text-white/50 transition hover:bg-white/5 hover:text-white"
                    >
                        <HiOutlineXMark className="text-xl" />
                    </button>
                </div>

                <form
                    onSubmit={onSubmit}
                    className="space-y-6 p-5 sm:p-7"
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <FormField
                            label="Skill title"
                            name="title"
                            value={
                                formData.title
                            }
                            onChange={
                                onChange
                            }
                            placeholder="Example: React Development"
                            maxLength={80}
                            required
                        />

                        <SelectField
                            label="Category"
                            name="category"
                            value={
                                formData.category
                            }
                            onChange={
                                onChange
                            }
                            options={
                                categories
                            }
                        />
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">
                        <SelectField
                            label="Current level"
                            name="currentLevel"
                            value={
                                formData.currentLevel
                            }
                            onChange={
                                onChange
                            }
                            options={currentLevels}
                        />

                        <SelectField
                            label="Target level"
                            name="targetLevel"
                            value={
                                formData.targetLevel
                            }
                            onChange={
                                onChange
                            }
                            options={targetLevels}
                        />

                        <SelectField
                            label="Priority"
                            name="priority"
                            value={
                                formData.priority
                            }
                            onChange={
                                onChange
                            }
                            options={priorityLevels}
                        />
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        <SelectField
                            label="Preferred learning mode"
                            name="preferredLearningMode"
                            value={
                                formData.preferredLearningMode
                            }
                            onChange={
                                onChange
                            }
                            options={
                                learningModes
                            }
                        />

                        <FormField
                            label="Tags"
                            name="tagsInput"
                            value={
                                formData.tagsInput
                            }
                            onChange={onChange}
                            placeholder="react, javascript, frontend"
                            icon={HiOutlineTag}
                        />
                    </div>

                    <TextAreaField
                        label="Learning Goal description"
                        name="learningGoal"
                        value={
                            formData.learningGoal
                        }
                        onChange={onChange}
                        maxLength={500}
                        placeholder="Explain what you want to achieve with this skill, how you plan to use it, etc."
                    />

                    <div>
                        <p className="text-sm font-medium text-white/60">
                            Available days
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {weekDays.map(
                                (day) => {
                                    const selected =
                                        formData.availability.days.includes(
                                            day
                                        );

                                    return (
                                        <button
                                            key={
                                                day
                                            }
                                            type="button"
                                            onClick={() =>
                                                onToggleDay(
                                                    day
                                                )
                                            }
                                            className={`rounded-xl border px-3 py-2 text-xs font-medium capitalize transition ${selected
                                                ? "border-orange-500 bg-orange-500 text-black"
                                                : "border-white/10 text-white/40 hover:border-orange-500/30 hover:text-white"
                                                }`}
                                        >
                                            {day.slice(
                                                0,
                                                3
                                            )}
                                        </button>
                                    );
                                }
                            )}
                        </div>
                    </div>

                    <SelectField
                        label="Preferred time"
                        name="availability.timeSlot"
                        value={
                            formData.availability.timeSlot
                        }
                        onChange={onChange}
                        options={[
                            {
                                value: "morning",
                                label: "Morning",
                            },
                            {
                                value: "afternoon",
                                label: "Afternoon",
                            },
                            {
                                value: "evening",
                                label: "Evening",
                            },
                            {
                                value: "flexible",
                                label: "Flexible",
                            },
                        ]}
                    />

                    <label className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#090a0f] p-4">
                        <div>
                            <p className="text-sm font-medium">
                                Active goal
                            </p>

                            <p className="mt-1 text-xs text-white/35">
                                Other users can match with you on this skill when active.
                            </p>
                        </div>

                        <input
                            type="checkbox"
                            name="isActive"
                            checked={
                                formData.isActive
                            }
                            onChange={onChange}
                            className="h-5 w-5 accent-orange-500"
                        />
                    </label>

                    <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/55 transition hover:bg-white/5 hover:text-white"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving
                                ? "Saving..."
                                : editing
                                    ? "Update goal"
                                    : "Add goal"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
}) {
    return (
        <article className="rounded-2xl border border-white/10 bg-[#101117] p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-3xl font-semibold">
                        {value}
                    </p>

                    <p className="mt-1 text-sm text-white/40">
                        {label}
                    </p>
                </div>

                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                    <Icon className="text-xl" />
                </span>
            </div>
        </article>
    );
}

function Badge({
    icon: Icon,
    text,
}) {
    return (
        <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs capitalize text-white/35">
            <Icon />
            {text}
        </span>
    );
}

function EmptyState({
    onAdd,
}) {
    return (
        <div className="mt-5 flex min-h-80 flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-[#101117] px-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                <HiOutlineBookOpen className="text-3xl" />
            </span>

            <h3 className="mt-5 text-xl font-semibold">
                No learning goals yet
            </h3>

            <p className="mt-2 max-w-md text-sm leading-7 text-white/40">
                Add your first learning goal so other users can discover what you want to learn and request a skill exchange.
            </p>

            <button
                type="button"
                onClick={onAdd}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
            >
                <HiOutlinePlus />
                Add first goal
            </button>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="mt-5 flex min-h-72 items-center justify-center rounded-[24px] border border-white/10 bg-[#101117]">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-orange-500" />
        </div>
    );
}

function Alert({
    type,
    message,
    onClose,
}) {
    const success =
        type === "success";

    return (
        <div
            className={`mt-5 flex items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm ${success
                ? "border-green-500/30 bg-green-500/10 text-green-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
                }`}
        >
            <p>{message}</p>

            <button
                type="button"
                onClick={onClose}
            >
                <HiOutlineXMark className="text-lg" />
            </button>
        </div>
    );
}

function FormField({
    label,
    icon: Icon,
    ...props
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium text-white/60">
                {label}
            </span>

            <div className="relative">
                {Icon && (
                    <Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                )}

                <input
                    {...props}
                    className={`w-full rounded-xl border border-white/10 bg-[#090a0f] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-orange-500/60 ${Icon ? "pl-11" : ""
                        }`}
                />
            </div>
        </label>
    );
}

function SelectField({
    label,
    name,
    value,
    onChange,
    options,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find((opt) => opt.value === value) || options[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (val) => {
        onChange({
            target: {
                name,
                value: val,
            },
        });
        setIsOpen(false);
    };

    return (
        <div className="relative block animate-fade-in" ref={dropdownRef}>
            <span className="mb-2 block text-sm font-medium text-white/60">
                {label}
            </span>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#090a0f] px-4 py-3.5 text-sm text-white outline-none transition duration-200 hover:border-orange-500/50 focus:border-orange-500/60"
            >
                <span className="truncate">{selectedOption?.label || ""}</span>
                <svg
                    className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-orange-500" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {isOpen && (
                <ul className="absolute left-0 z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-white/10 bg-[#111218] py-1.5 shadow-2xl shadow-black/80 backdrop-blur-xl">
                    {options.map((option) => {
                        const isSelected = option.value === value;
                        return (
                            <li key={option.value}>
                                <button
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={`flex w-full items-center px-4 py-3 text-left text-sm transition duration-150 hover:bg-orange-500/10 hover:text-orange-400 ${
                                        isSelected
                                            ? "bg-orange-500/5 text-orange-400 font-semibold"
                                            : "text-white/80"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

function TextAreaField({
    label,
    value,
    maxLength,
    ...props
}) {
    return (
        <label className="block">
            <div className="mb-2 flex justify-between gap-3">
                <span className="text-sm font-medium text-white/60">
                    {label}
                </span>

                <span className="text-xs text-white/25">
                    {value.length}/
                    {maxLength}
                </span>
            </div>

            <textarea
                {...props}
                value={value}
                maxLength={maxLength}
                rows={5}
                className="w-full resize-none rounded-xl border border-white/10 bg-[#090a0f] px-4 py-3.5 text-sm leading-7 text-white outline-none placeholder:text-white/20 focus:border-orange-500/60"
            />
        </label>
    );
}
