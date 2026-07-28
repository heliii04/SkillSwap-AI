import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    FiSearch,
    FiFilter,
    FiMapPin,
    FiStar,
    FiUsers,
    FiArrowRight,
    FiBookOpen,
    FiClock,
    FiX,
} from "react-icons/fi";

const popularSkills = [
    "React",
    "Python",
    "AI & ML",
    "UI/UX",
    "Node.js",
];

const categories = [
    "All",
    "Technology",
    "Design",
    "Business",
    "Marketing",
    "Languages",
    "Music",
    "Academics",
    "Fitness",
    "Photography",
];

const skillLevels = [
    "All Levels",
    "Beginner",
    "Intermediate",
    "Advanced",
    "Expert",
];

const interactionModes = [
    "All Modes",
    "Online",
    "Offline",
    "Both",
];

const skillsData = [
    {
        id: 1,
        title: "React Development",
        category: "Technology",
        description:
            "Learn React fundamentals, components, hooks, routing and real-world project development.",
        teacher: {
            name: "Aarav Shah",
            avatar: "AS",
        },
        teaches: "React Development",
        wantsToLearn: "UI/UX Design",
        level: "Advanced",
        mode: "Online",
        location: "Ahmedabad",
        rating: 4.9,
        reviews: 38,
        learners: 124,
        availability: "Evening",
        tags: ["React", "JavaScript", "Frontend"],
    },
    {
        id: 2,
        title: "UI/UX Design",
        category: "Design",
        description:
            "Understand user research, wireframes, prototypes and modern interface design using Figma.",
        teacher: {
            name: "Diya Patel",
            avatar: "DP",
        },
        teaches: "UI/UX Design",
        wantsToLearn: "Digital Marketing",
        level: "Intermediate",
        mode: "Both",
        location: "Surat",
        rating: 4.8,
        reviews: 26,
        learners: 86,
        availability: "Flexible",
        tags: ["Figma", "UI Design", "Prototyping"],
    },
    {
        id: 3,
        title: "Python Programming",
        category: "Technology",
        description:
            "Learn Python from basics to object-oriented programming, APIs and practical projects.",
        teacher: {
            name: "Rohan Mehta",
            avatar: "RM",
        },
        teaches: "Python Programming",
        wantsToLearn: "Public Speaking",
        level: "Expert",
        mode: "Online",
        location: "Mumbai",
        rating: 4.9,
        reviews: 52,
        learners: 173,
        availability: "Morning",
        tags: ["Python", "API", "Backend"],
    },
    {
        id: 4,
        title: "Spoken English",
        category: "Languages",
        description:
            "Improve your vocabulary, pronunciation, confidence and everyday English communication.",
        teacher: {
            name: "Ananya Joshi",
            avatar: "AJ",
        },
        teaches: "Spoken English",
        wantsToLearn: "Photography",
        level: "Intermediate",
        mode: "Both",
        location: "Vadodara",
        rating: 4.7,
        reviews: 31,
        learners: 98,
        availability: "Afternoon",
        tags: ["English", "Communication", "Speaking"],
    },
    {
        id: 5,
        title: "Digital Marketing",
        category: "Marketing",
        description:
            "Learn social media marketing, content strategy, SEO and campaign planning.",
        teacher: {
            name: "Krisha Desai",
            avatar: "KD",
        },
        teaches: "Digital Marketing",
        wantsToLearn: "Web Development",
        level: "Advanced",
        mode: "Online",
        location: "Rajkot",
        rating: 4.8,
        reviews: 22,
        learners: 75,
        availability: "Evening",
        tags: ["SEO", "Social Media", "Content"],
    },
    {
        id: 6,
        title: "Guitar Basics",
        category: "Music",
        description:
            "Start playing guitar with basic chords, rhythm practice and beginner-friendly songs.",
        teacher: {
            name: "Kabir Verma",
            avatar: "KV",
        },
        teaches: "Guitar Basics",
        wantsToLearn: "Video Editing",
        level: "Beginner",
        mode: "Offline",
        location: "Ahmedabad",
        rating: 4.6,
        reviews: 18,
        learners: 46,
        availability: "Weekend",
        tags: ["Guitar", "Music", "Chords"],
    },
];

export default function BrowseSkills() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedLevel, setSelectedLevel] = useState("All Levels");
    const [selectedMode, setSelectedMode] = useState("All Modes");
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const filteredSkills = useMemo(() => {
        return skillsData.filter((skill) => {
            const normalizedSearch = searchTerm.toLowerCase().trim();

            const matchesSearch =
                !normalizedSearch ||
                skill.title.toLowerCase().includes(normalizedSearch) ||
                skill.description.toLowerCase().includes(normalizedSearch) ||
                skill.category.toLowerCase().includes(normalizedSearch) ||
                skill.tags.some((tag) =>
                    tag.toLowerCase().includes(normalizedSearch)
                );

            const matchesCategory =
                selectedCategory === "All" ||
                skill.category === selectedCategory;

            const matchesLevel =
                selectedLevel === "All Levels" ||
                skill.level === selectedLevel;

            const matchesMode =
                selectedMode === "All Modes" ||
                skill.mode === selectedMode ||
                skill.mode === "Both";

            return (
                matchesSearch &&
                matchesCategory &&
                matchesLevel &&
                matchesMode
            );
        });
    }, [
        searchTerm,
        selectedCategory,
        selectedLevel,
        selectedMode,
    ]);

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("All");
        setSelectedLevel("All Levels");
        setSelectedMode("All Modes");
    };

    const hasActiveFilters =
        searchTerm ||
        selectedCategory !== "All" ||
        selectedLevel !== "All Levels" ||
        selectedMode !== "All Modes";

    return (
        <main className="min-h-screen bg-[#07080d] text-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden border-b border-white/10">
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-300" style={{ marginTop: '25px' }}>
                            <FiBookOpen />
                            Discover skills from our community
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl pb-2 leading-[1.2]">
                            Find the right skill.
                            <span className="block text-orange-500 py-1.5">
                                Meet the right mentor.
                            </span>
                        </h1>

                        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
                            Browse skills shared by real people, connect with
                            suitable learning partners and grow together through
                            skill exchange.
                        </p>

                        {/* Search */}
                        <div
                            className="
            mx-auto mt-8 max-w-2xl
            rounded-2xl
            border border-white/10
            bg-[#111218]
            p-2
            transition-all duration-300
            focus-within:border-orange-500/40
            focus-within:shadow-[0_0_30px_rgba(249,115,22,0.15)]
          "
                        >
                            <div className="flex items-center">
                                <FiSearch className="ml-4 shrink-0 text-white/35" />

                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(event.target.value)
                                    }
                                    placeholder="Search React, design, English..."
                                    className="
                min-w-0 flex-1
                bg-transparent
                px-4 py-3
                text-sm text-white
                outline-none
                placeholder:text-white/30
                sm:text-base
              "
                                    style={{ outline: "none", boxShadow: "none" }}
                                />

                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchTerm("")}
                                        className="mr-2 rounded-lg p-2 text-white/30 hover:bg-white/10 hover:text-white"
                                        aria-label="Clear search"
                                    >
                                        <FiX />
                                    </button>
                                )}

                                <button
                                    type="button"
                                    className="
                shrink-0 rounded-xl
                bg-orange-500
                px-5 py-3
                text-sm font-semibold text-white
                transition-colors duration-300
                hover:bg-orange-400
              "
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Popular skills */}
                        <div
                            className="
            mt-4 flex flex-wrap
            items-center justify-center gap-2
          "
                        >
                            <span className="mr-1 text-xs text-white/35">
                                Popular:
                            </span>

                            {popularSkills.map((skill) => (
                                <button
                                    key={skill}
                                    type="button"
                                    onClick={() => setSearchTerm(skill)}
                                    className="
                rounded-full
                border border-white/10
                bg-[#111218]
                px-4 py-2
                text-xs text-white/55
                transition-all duration-300
                hover:border-orange-400/40
                hover:text-orange-300
              "
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                {/* Categories */}
                <div className="custom-scrollbar mb-8 flex gap-3 overflow-x-auto pb-3">
                    {categories.map((category) => (
                        <button
                            key={category}
                            type="button"
                            onClick={() => setSelectedCategory(category)}
                            className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-medium transition ${selectedCategory === category
                                ? "border-orange-500 bg-orange-500 text-black font-semibold shadow-lg shadow-orange-500/20"
                                : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-400"
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
                    {/* Desktop Filters */}
                    <aside className="hidden lg:block sticky top-24 self-start">
                        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FiFilter className="text-orange-400" />
                                    <h2 className="font-semibold">Filters</h2>
                                </div>

                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="text-xs font-medium text-orange-400 hover:text-orange-300"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            <FilterContent
                                selectedLevel={selectedLevel}
                                setSelectedLevel={setSelectedLevel}
                                selectedMode={selectedMode}
                                setSelectedMode={setSelectedMode}
                            />
                        </div>
                    </aside>

                    {/* Skills Area */}
                    <div>
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-semibold">
                                    Browse Skills
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    {filteredSkills.length} skill
                                    {filteredSkills.length !== 1 ? "s" : ""}{" "}
                                    available
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowMobileFilters(true)}
                                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm lg:hidden"
                            >
                                <FiFilter />
                                Filters
                            </button>
                        </div>

                        {filteredSkills.length > 0 ? (
                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {filteredSkills.map((skill) => (
                                    <SkillCard
                                        key={skill.id}
                                        skill={skill}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-6 py-20 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-2xl text-orange-400">
                                    <FiSearch />
                                </div>

                                <h3 className="mt-5 text-xl font-semibold">
                                    No skills found
                                </h3>

                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                                    Try changing your search keyword or removing
                                    some filters.
                                </p>

                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="mt-6 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-orange-400"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Mobile Filter Drawer */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        onClick={() => setShowMobileFilters(false)}
                        className="absolute inset-0 h-full w-full bg-black/70 backdrop-blur-sm"
                        aria-label="Close filters"
                    />

                    <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[#101119] p-6">
                        <div className="mb-7 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FiFilter className="text-orange-400" />
                                <h2 className="text-lg font-semibold">
                                    Filters
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowMobileFilters(false)}
                                className="rounded-lg bg-white/5 p-2 text-gray-400 hover:text-white"
                            >
                                <FiX />
                            </button>
                        </div>

                        <FilterContent
                            selectedLevel={selectedLevel}
                            setSelectedLevel={setSelectedLevel}
                            selectedMode={selectedMode}
                            setSelectedMode={setSelectedMode}
                        />

                        <div className="mt-8 flex gap-3">
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold"
                            >
                                Clear
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowMobileFilters(false)}
                                className="flex-1 rounded-xl bg-orange-500 text-black hover:bg-orange-400 px-4 py-3 text-sm font-semibold"
                            >
                                Show Results
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

function FilterContent({
    selectedLevel,
    setSelectedLevel,
    selectedMode,
    setSelectedMode,
}) {
    return (
        <div className="space-y-7">
            <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-300">
                    Skill Level
                </h3>

                <div className="space-y-2">
                    {skillLevels.map((level) => (
                        <button
                            key={level}
                            type="button"
                            onClick={() => setSelectedLevel(level)}
                            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm ${selectedLevel === level
                                ? "border-orange-500/50 bg-orange-500/10 text-orange-300"
                                : "border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            {level}

                            <span
                                className={`h-2.5 w-2.5 rounded-full ${selectedLevel === level
                                    ? "bg-orange-500"
                                    : "bg-white/10"
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-300">
                    Learning Mode
                </h3>

                <div className="space-y-2">
                    {interactionModes.map((mode) => (
                        <button
                            key={mode}
                            type="button"
                            onClick={() => setSelectedMode(mode)}
                            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm ${selectedMode === mode
                                ? "border-orange-500/50 bg-orange-500/10 text-orange-300"
                                : "border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            {mode}

                            <span
                                className={`h-2.5 w-2.5 rounded-full ${selectedMode === mode
                                    ? "bg-orange-500"
                                    : "bg-white/10"
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SkillCard({ skill }) {
    return (
        <article className="group flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.035] p-5 transition duration-300 hover:-translate-y-1 hover:border-orange-500/40 hover:bg-white/[0.055] hover:shadow-2xl hover:shadow-orange-950/10">
            <div className="flex items-start justify-between gap-4">
                <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-300">
                    {skill.category}
                </span>

                <div className="flex items-center gap-1 text-sm">
                    <FiStar className="fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-white">
                        {skill.rating}
                    </span>
                    <span className="text-gray-600">
                        ({skill.reviews})
                    </span>
                </div>
            </div>

            <h3 className="mt-5 text-xl font-semibold transition group-hover:text-orange-400">
                {skill.title}
            </h3>

            <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-400">
                {skill.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
                {skill.tags.map((tag) => (
                    <span
                        key={tag}
                        className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-gray-400"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            <div className="mt-5 space-y-3 border-t border-white/10 pt-5 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                    <FiBookOpen className="shrink-0 text-orange-400" />
                    <span>
                        Level:{" "}
                        <strong className="font-medium text-gray-200">
                            {skill.level}
                        </strong>
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <FiMapPin className="shrink-0 text-orange-400" />
                    <span>
                        {skill.mode} · {skill.location}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <FiClock className="shrink-0 text-orange-400" />
                    <span>{skill.availability}</span>
                </div>

                <div className="flex items-center gap-2">
                    <FiUsers className="shrink-0 text-orange-400" />
                    <span>{skill.learners} interested learners</span>
                </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/5 bg-black/20 p-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-sm font-bold text-black">
                        {skill.teacher.avatar}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                            {skill.teacher.name}
                        </p>

                        <p className="truncate text-xs text-gray-500">
                            Wants to learn {skill.wantsToLearn}
                        </p>
                    </div>
                </div>
            </div>

            <Link
                to={`/skills/${skill.id}`}
                className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-black hover:bg-orange-400"
            >
                View Skill
                <FiArrowRight />
            </Link>
        </article>
    );
}