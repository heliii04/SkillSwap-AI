import {
    useMemo,
    useState,
    useEffect,
    useRef,
} from "react";
import MatchBadge from "../../components/ui/MatchBadge";

import {
    HiOutlineAcademicCap,
    HiOutlineAdjustmentsHorizontal,
    HiOutlineArrowRight,
    HiOutlineBookOpen,
    HiOutlineCheckBadge,
    HiOutlineClock,
    HiOutlineMapPin,
    HiOutlineMagnifyingGlass,
    HiOutlineSparkles,
    HiOutlineStar,
    HiOutlineUserGroup,
    HiOutlineXMark,
} from "react-icons/hi2";

/*
|--------------------------------------------------------------------------
| Dummy data
|--------------------------------------------------------------------------
|
| Backend integration ke baad is data ko API response se replace karenge.
|
*/


import useLockBodyScroll from "../../hooks/useLockBodyScroll";
import useDebounce from "../../hooks/useDebounce";
import axiosClient from "../../api/axiosClient";
import UserProfileModal from "../../components/profile/UserProfileModal";

const categoryOptions = [
    {
        value: "all",
        label: "All categories",
    },
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
];

const modeOptions = [
    {
        value: "all",
        label: "All modes",
    },
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

const levelOptions = [
    {
        value: "all",
        label: "All levels",
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
    {
        value: "expert",
        label: "Expert",
    },
];

const sortOptions = [
    {
        value: "match",
        label: "Best match",
    },
    {
        value: "rating",
        label: "Highest rating",
    },
    {
        value: "sessions",
        label: "Most experienced",
    },
    {
        value: "name",
        label: "Name A-Z",
    },
    {
        value: "name-desc",
        label: "Name Z-A",
    },
];

const defaultFilters = {
    search: "",
    category: "all",
    mode: "all",
    level: "all",
    sortBy: "match",
};

export default function Search() {
    const [filters, setFilters] = useState(defaultFilters);
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        Promise.all([
            axiosClient.get("/profile/all"),
            axiosClient.get("/matches", { params: { limit: 100 } }).catch(() => ({ data: { data: { matches: [] } } }))
        ])
            .then(([res, matchesRes]) => {
                if (isMounted) {
                    const matchesList = matchesRes.data?.data?.matches || [];
                    const matchMap = new Map();
                    matchesList.forEach(m => {
                        matchMap.set(m.user.id.toString(), m.score);
                    });

                    const dynamicMentors = res.data.data.map(user => {
                        const userId = user.id || user._id || Math.random().toString();

                        let score = matchMap.get(userId.toString());
                        if (!score) {
                            const charCodeSum = userId.toString().split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
                            score = 40 + (charCodeSum % 30);
                        }

                        return {
                            id: userId,
                            name: user.name,
                            initials: user.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U",
                            avatar: user.avatar,
                            role: user.headline || "",
                            location: user.location?.city ? `${user.location.city}${user.location.country ? `, ${user.location.country}` : ""}` : "Online",
                            rating: user.rating || 0,
                            reviews: user.reviews || 0,
                            completedSessions: user.sessions || 0,
                            matchPercentage: score,
                            verified: user.isEmailVerified,
                            availability: "Available",
                            mode: user.mode || "online",
                            level: user.level || "all",
                            category: user.category || "all",
                            teaches: user.teaches || [],
                            wants: user.wants || [],
                            bio: user.bio || "",
                        }
                    });
                    setMentors(dynamicMentors);
                }
            })
            .catch(err => {
                console.error("Error fetching mentors:", err);
                if (isMounted) setError(err.message || "Failed to fetch mentors");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, []);

    const [
        selectedMentor,
        setSelectedMentor,
    ] = useState(null);

    const debouncedSearchTerm = useDebounce(filters.search, 300);

    const filteredMentors = useMemo(() => {
        const searchValue =
            debouncedSearchTerm
                .trim()
                .toLowerCase();

        const results = mentors.filter(
            (mentor) => {
                const searchableText = [
                    mentor.name,
                    mentor.role,
                    mentor.location,
                    mentor.bio,
                    ...mentor.teaches,
                    ...mentor.wants,
                ]
                    .join(" ")
                    .toLowerCase();

                const matchesSearch =
                    !searchValue ||
                    searchableText.includes(
                        searchValue
                    );

                const matchesCategory =
                    filters.category ===
                    "all" ||
                    mentor.category ===
                    filters.category;

                const matchesMode =
                    filters.mode ===
                    "all" ||
                    mentor.mode ===
                    filters.mode ||
                    mentor.mode === "both";

                const matchesLevel =
                    filters.level ===
                    "all" ||
                    mentor.level ===
                    filters.level;

                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesMode &&
                    matchesLevel
                );
            }
        );

        return [...results].sort(
            (first, second) => {
                switch (filters.sortBy) {
                    case "rating":
                        return (
                            second.rating -
                            first.rating
                        );

                    case "sessions":
                        return (
                            second.completedSessions -
                            first.completedSessions
                        );

                    case "name":
                        return first.name.localeCompare(
                            second.name
                        );

                    case "name-desc":
                        return second.name.localeCompare(
                            first.name
                        );

                    default:
                        return (
                            second.matchPercentage -
                            first.matchPercentage
                        );
                }
            }
        );
    }, [mentors, debouncedSearchTerm, filters.category, filters.mode, filters.level, filters.sortBy]);

    const activeFilterCount =
        useMemo(() => {
            let count = 0;

            if (
                filters.category !== "all"
            ) {
                count += 1;
            }

            if (filters.mode !== "all") {
                count += 1;
            }

            if (filters.level !== "all") {
                count += 1;
            }

            return count;
        }, [filters]);

    const handleFilterChange = (
        event
    ) => {
        const { name, value } =
            event.target;

        setFilters((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const clearFilters = () => {
        setFilters(defaultFilters);
    };

    return (
        <main className="px-4 pb-12 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1500px]">
                <SearchHero
                    searchValue={
                        filters.search
                    }
                    onSearchChange={
                        handleFilterChange
                    }
                />

                <section className="mt-5 grid gap-4 sm:grid-cols-3">
                    <StatCard
                        label="Available mentors"
                        value={mentors.length}
                        icon={
                            HiOutlineUserGroup
                        }
                    />

                    <StatCard
                        label="Verified mentors"
                        value={
                            mentors.filter(
                                (mentor) =>
                                    mentor.verified
                            ).length
                        }
                        icon={
                            HiOutlineCheckBadge
                        }
                    />

                    <StatCard
                        label="Best match"
                        value={`${Math.max(
                            ...mentors.map(
                                (mentor) =>
                                    mentor.matchPercentage
                            )
                        )}%`}
                        icon={
                            HiOutlineSparkles
                        }
                    />
                </section>

                <section className="mt-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">
                                Discover people
                            </p>

                            <h2 className="mt-2 text-2xl font-semibold">
                                Find your next skill partner
                            </h2>

                            <p className="mt-2 text-sm text-white/40">
                                Search mentors and learners by skill, category, level and teaching mode.
                            </p>
                        </div>
                        {/* Search Bar Input */}
                        <div className="relative mt-2 w-full max-w-md lg:mt-0">
                            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-white/35" />
                            <input
                                type="search"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                placeholder="Search by name, skill, location..."
                                className="w-full rounded-2xl border border-white/10 bg-[#101117] py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-orange-500/60"
                            />
                        </div>
                    </div>

                    {/* Horizontal Filters Bar */}
                    <div className="mt-6 rounded-[24px] border border-white/10 bg-[#101117] p-5">

                        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                            <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl">
                                <SelectFilter
                                    label="Category"
                                    name="category"
                                    value={filters.category}
                                    options={categoryOptions}
                                    onChange={handleFilterChange}
                                />

                                <SelectFilter
                                    label="Teaching mode"
                                    name="mode"
                                    value={filters.mode}
                                    options={modeOptions}
                                    onChange={handleFilterChange}
                                />

                                <SelectFilter
                                    label="Skill level"
                                    name="level"
                                    value={filters.level}
                                    options={levelOptions}
                                    onChange={handleFilterChange}
                                />

                                <SelectFilter
                                    label="Sort by"
                                    name="sortBy"
                                    value={filters.sortBy}
                                    options={sortOptions}
                                    onChange={handleFilterChange}
                                />
                            </div>

                            {activeFilterCount > 0 && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-xs  text-orange-400 transition hover:text-orange-300 sm:mb-3 font-bold"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        {/* AI Matching Later Notice
                        <div className="mt-5 rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
                            <div className="flex items-start gap-3">
                                <HiOutlineSparkles className="mt-0.5 shrink-0 text-xl text-orange-400" />
                                <div>
                                    <p className="text-sm font-semibold">AI matching later</p>
                                    <p className="mt-1 text-xs leading-6 text-white/35">
                                        Backend phase me match percentage actual user skills ke basis par calculate hoga.
                                    </p>
                                </div>
                            </div>
                        </div> */}
                    </div>

                    {/* Results Section */}
                    <div className="mt-6">


                        {loading ? (
                            <div className="mt-10 flex flex-col items-center justify-center text-orange-500">
                                <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-orange-500 border-t-transparent" />
                                <p className="mt-4 text-sm font-medium">Discovering profiles...</p>
                            </div>
                        ) : error ? (
                            <div className="mt-10 flex flex-col items-center justify-center text-red-500">
                                <p className="mt-4 text-sm font-medium">{error}</p>
                            </div>
                        ) : filteredMentors.length === 0 ? (
                            <EmptyResults onClear={clearFilters} />
                        ) : (
                            <div className="mt-5 grid gap-5 xl:grid-cols-2">
                                {filteredMentors.map((mentor) => (
                                    <MentorCard
                                        key={mentor.id}
                                        mentor={mentor}
                                        onView={() => setSelectedMentor(mentor)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {selectedMentor && (
                <UserProfileModal
                    userId={selectedMentor.id}
                    matchScore={selectedMentor.matchPercentage}
                    onClose={() => setSelectedMentor(null)}
                />
            )}
        </main>
    );
}

function SearchHero({
    searchValue,
    onSearchChange,
}) {
    return (
        <section className="relative overflow-hidden rounded-[28px] border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-[#111218] to-[#0d0e13] p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />

            <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
                    <HiOutlineMagnifyingGlass className="text-lg" />
                    Explore Skills
                </div>

                <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">
                    Find the right person to
                    learn from.
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">
                    Discover mentors, learners
                    and skill-exchange partners
                    based on your interests and
                    goals.
                </p>
            </div>
        </section>
    );
}

function MentorCard({
    mentor,
    onView,
}) {
    return (
        <article className="group flex flex-col rounded-[24px] border border-white/10 bg-[#101117] p-5 transition hover:-translate-y-1 hover:border-orange-500/35 sm:p-6">
            <div className="flex items-start gap-4">
                <Avatar mentor={mentor} />

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-lg font-semibold">
                            {mentor.name}
                        </h3>

                        {mentor.verified && (
                            <HiOutlineCheckBadge
                                className="text-xl text-orange-400"
                                title="Verified profile"
                            />
                        )}
                    </div>

                    {mentor.role && mentor.role !== "SkillSwap member" && (
                        <p className="mt-1 text-sm text-white/45">
                            {mentor.role}
                        </p>
                    )}

                    <div className="mt-2 flex items-center gap-1.5 text-xs text-white/30">
                        <HiOutlineMapPin />

                        <span>
                            {
                                mentor.location
                            }
                        </span>
                    </div>
                </div>

                <MatchBadge
                    value={
                        mentor.matchPercentage
                    }
                />
            </div>

            <p className="mt-5 line-clamp-3 text-sm leading-7 text-white/40">
                {mentor.bio}
            </p>

            <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/30">
                    Teaches
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                    {mentor.teaches.map(
                        (skill) => (
                            <span
                                key={skill}
                                className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-2.5 py-1.5 text-xs text-orange-300"
                            >
                                {skill}
                            </span>
                        )
                    )}
                </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
                <InfoBox
                    icon={HiOutlineStar}
                    label="Rating"
                    value={`${mentor.rating} (${mentor.reviews})`}
                />

                <InfoBox
                    icon={
                        HiOutlineAcademicCap
                    }
                    label="Sessions"
                    value={
                        mentor.completedSessions
                    }
                />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                <div className="flex items-center gap-2 text-xs text-white/35">
                    <HiOutlineClock className="text-base text-orange-400" />

                    <span>
                        {
                            mentor.availability
                        }
                    </span>
                </div>

                <button
                    type="button"
                    onClick={onView}
                    className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm  text-black transition hover:bg-orange-400 font-bold"
                >
                    View profile

                    <HiOutlineArrowRight className="animate-arrow-move" />
                </button>
            </div>
        </article>
    );
}

function Avatar({ mentor }) {
    return (
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-base font-bold text-black">
            {mentor.initials}

            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#101117] bg-green-500" />
        </div>
    );
}


function InfoBox({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-[#090a0f] p-3">
            <div className="flex items-center gap-2 text-xs text-white/30">
                <Icon className="text-orange-400" />
                {label}
            </div>

            <p className="mt-2 text-sm font-semibold">
                {value}
            </p>
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

function SelectFilter({
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
        <div className="relative block" ref={dropdownRef}>
            <span className="mb-2 block text-sm font-medium text-white/55">
                {label}
            </span>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="font-bold flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#090a0f] px-4 py-3 text-sm text-white outline-none transition duration-200 hover:border-orange-500/50 focus:border-orange-500/60"
            >
                <span className="truncate">{selectedOption?.label || ""}</span>
                <svg
                    className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-200 ${isOpen ? "rotate-180 text-orange-500" : ""
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
                                    className={`font-bold flex w-full items-center px-4 py-3 text-left text-sm transition duration-150 hover:bg-orange-500/10 hover:text-orange-400 ${isSelected
                                            ? "bg-orange-500/5 text-orange-400"
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

function EmptyResults({
    onClear,
}) {
    return (
        <div className="mt-5 flex min-h-96 flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-[#101117] px-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                <HiOutlineMagnifyingGlass className="text-3xl" />
            </span>

            <h3 className="mt-5 text-xl font-semibold">
                No matching mentors found
            </h3>

            <p className="mt-2 max-w-md text-sm leading-7 text-white/40">
                Try another skill name or
                remove some filters to see more
                results.
            </p>

            <button
                type="button"
                onClick={onClear}
                className="mt-6 rounded-xl bg-orange-500 px-5 py-3 text-sm  text-black transition hover:bg-orange-400 font-bold"
            >
                Clear filters
            </button>
        </div>
    );
}



function ModalStat({
    label,
    value,
    icon: Icon,
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-[#090a0f] p-4">
            <Icon className="text-xl text-orange-400" />

            <p className="mt-3 text-xl font-semibold">
                {value}
            </p>

            <p className="mt-1 text-xs text-white/35">
                {label}
            </p>
        </div>
    );
}

function SkillList({
    title,
    skills,
    accent = false,
}) {
    return (
        <div>
            <p className="text-sm font-semibold">
                {title}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((skill) => (
                    <span
                        key={skill}
                        className={`rounded-lg border px-3 py-2 text-xs ${accent
                            ? "border-orange-500/20 bg-orange-500/10 text-orange-300"
                            : "border-white/10 bg-white/[0.03] text-white/40"
                            }`}
                    >
                        {skill}
                    </span>
                ))}
            </div>
        </div>
    );
}

