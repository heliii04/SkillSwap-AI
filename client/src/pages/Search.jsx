import {
    useMemo,
    useState,
} from "react";

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

const mentors = [
    {
        id: "mentor-1",
        name: "Aarav Sharma",
        initials: "AS",
        role: "Full Stack Developer",
        location: "Ahmedabad, Gujarat",
        rating: 4.9,
        reviews: 128,
        completedSessions: 94,
        matchPercentage: 96,
        verified: true,
        availability: "Available this week",
        mode: "online",
        level: "expert",
        category: "technology",
        teaches: [
            "React",
            "Node.js",
            "MongoDB",
        ],
        wants: [
            "UI/UX Design",
            "Figma",
        ],
        bio:
            "Full-stack developer with practical experience in building scalable MERN applications. I focus on project-based learning and clean production architecture.",
    },
    {
        id: "mentor-2",
        name: "Meera Patel",
        initials: "MP",
        role: "UI/UX Designer",
        location: "Surat, Gujarat",
        rating: 4.8,
        reviews: 86,
        completedSessions: 71,
        matchPercentage: 92,
        verified: true,
        availability: "Available evenings",
        mode: "both",
        level: "advanced",
        category: "design",
        teaches: [
            "Figma",
            "UI Design",
            "Prototyping",
        ],
        wants: [
            "React",
            "Frontend Development",
        ],
        bio:
            "Product designer helping beginners understand user research, wireframing, modern interfaces and interactive prototypes.",
    },
    {
        id: "mentor-3",
        name: "Rohan Verma",
        initials: "RV",
        role: "Digital Marketing Specialist",
        location: "Delhi, India",
        rating: 4.7,
        reviews: 64,
        completedSessions: 52,
        matchPercentage: 88,
        verified: false,
        availability: "Available weekends",
        mode: "online",
        level: "advanced",
        category: "marketing",
        teaches: [
            "SEO",
            "Content Marketing",
            "Google Ads",
        ],
        wants: [
            "Data Analytics",
            "Excel",
        ],
        bio:
            "Digital marketing professional focused on SEO strategy, paid advertising and practical content growth systems.",
    },
    {
        id: "mentor-4",
        name: "Ananya Joshi",
        initials: "AJ",
        role: "English Communication Coach",
        location: "Pune, Maharashtra",
        rating: 4.9,
        reviews: 147,
        completedSessions: 118,
        matchPercentage: 85,
        verified: true,
        availability: "Available mornings",
        mode: "both",
        level: "expert",
        category: "languages",
        teaches: [
            "English Speaking",
            "Interview Skills",
            "Communication",
        ],
        wants: [
            "Photography",
            "Photo Editing",
        ],
        bio:
            "Communication coach helping students improve spoken English, confidence, interview skills and professional presentation.",
    },
    {
        id: "mentor-5",
        name: "Kabir Mehta",
        initials: "KM",
        role: "Data Science Mentor",
        location: "Bengaluru, Karnataka",
        rating: 4.8,
        reviews: 102,
        completedSessions: 83,
        matchPercentage: 82,
        verified: true,
        availability: "Available on weekends",
        mode: "online",
        level: "expert",
        category: "technology",
        teaches: [
            "Python",
            "Machine Learning",
            "Data Analysis",
        ],
        wants: [
            "Public Speaking",
            "Leadership",
        ],
        bio:
            "Data science mentor teaching Python, data analysis and beginner-friendly machine learning through real-world examples.",
    },
    {
        id: "mentor-6",
        name: "Isha Kapoor",
        initials: "IK",
        role: "Fitness & Wellness Coach",
        location: "Mumbai, Maharashtra",
        rating: 4.6,
        reviews: 59,
        completedSessions: 46,
        matchPercentage: 78,
        verified: false,
        availability: "Available early mornings",
        mode: "offline",
        level: "advanced",
        category: "fitness",
        teaches: [
            "Yoga",
            "Home Workouts",
            "Wellness",
        ],
        wants: [
            "Social Media Marketing",
            "Content Creation",
        ],
        bio:
            "Fitness coach helping learners build sustainable workout routines, improve mobility and maintain healthy daily habits.",
    },
];

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
    const [filters, setFilters] =
        useState(defaultFilters);

    const [
        selectedMentor,
        setSelectedMentor,
    ] = useState(null);

    const filteredMentors = useMemo(() => {
        const searchValue =
            filters.search
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

                    case "match":
                    default:
                        return (
                            second.matchPercentage -
                            first.matchPercentage
                        );
                }
            }
        );
    }, [filters]);

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
                                    className="text-xs font-semibold text-orange-400 transition hover:text-orange-300 sm:mb-3"
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


                        {filteredMentors.length === 0 ? (
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
                <MentorModal
                    mentor={
                        selectedMentor
                    }
                    onClose={() =>
                        setSelectedMentor(
                            null
                        )
                    }
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

                <div className="relative mt-7 max-w-3xl">
                    <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-xl text-white/30" />

                    <input
                        type="search"
                        name="search"
                        value={searchValue}
                        onChange={
                            onSearchChange
                        }
                        placeholder="Search React, UI Design, English, Python..."
                        className="w-full rounded-2xl border border-white/10 bg-[#090a0f]/90 py-4 pl-14 pr-5 text-sm text-white outline-none placeholder:text-white/20 focus:border-orange-500/60 sm:text-base"
                    />
                </div>
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

                    <p className="mt-1 text-sm text-white/45">
                        {mentor.role}
                    </p>

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
                    className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-orange-400"
                >
                    View profile

                    <HiOutlineArrowRight />
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

function MatchBadge({ value }) {
    const style =
        value >= 90
            ? "border-green-500/25 bg-green-500/10 text-green-300"
            : value >= 80
                ? "border-orange-500/25 bg-orange-500/10 text-orange-300"
                : "border-white/10 bg-white/[0.03] text-white/45";

    return (
        <span
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${style}`}
        >
            {value}% match
        </span>
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
    options,
    ...props
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium text-white/55">
                {label}
            </span>

            <select
                {...props}
                className="w-full rounded-xl border border-white/10 bg-[#090a0f] px-4 py-3 text-sm text-white outline-none focus:border-orange-500/60"
            >
                {options.map(
                    (option) => (
                        <option
                            key={
                                option.value
                            }
                            value={
                                option.value
                            }
                        >
                            {option.label}
                        </option>
                    )
                )}
            </select>
        </label>
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
                className="mt-6 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
            >
                Clear filters
            </button>
        </div>
    );
}

function MentorModal({
    mentor,
    onClose,
}) {
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <button
                type="button"
                aria-label="Close mentor profile"
                onClick={onClose}
                className="absolute inset-0 h-full w-full"
            />

            <div className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-white/10 bg-[#101117]">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#101117]/95 px-5 py-5 backdrop-blur-xl sm:px-7">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                            Mentor profile
                        </p>

                        <h2 className="mt-2 text-xl font-semibold">
                            Skill partner details
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-white/10 p-2.5 text-white/50 transition hover:bg-white/5 hover:text-white"
                    >
                        <HiOutlineXMark className="text-xl" />
                    </button>
                </div>

                <div className="p-5 sm:p-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] bg-orange-500 text-xl font-bold text-black">
                            {mentor.initials}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-2xl font-semibold">
                                    {
                                        mentor.name
                                    }
                                </h3>

                                {mentor.verified && (
                                    <HiOutlineCheckBadge className="text-2xl text-orange-400" />
                                )}
                            </div>

                            <p className="mt-1 text-white/45">
                                {
                                    mentor.role
                                }
                            </p>

                            <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/35">
                                <span className="inline-flex items-center gap-2">
                                    <HiOutlineMapPin className="text-orange-400" />

                                    {
                                        mentor.location
                                    }
                                </span>

                                <span className="inline-flex items-center gap-2 capitalize">
                                    <HiOutlineUserGroup className="text-orange-400" />

                                    {
                                        mentor.mode
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

                    <div className="mt-6 rounded-2xl border border-white/10 bg-[#090a0f] p-5">
                        <p className="text-sm leading-7 text-white/45">
                            {mentor.bio}
                        </p>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <ModalStat
                            label="Rating"
                            value={
                                mentor.rating
                            }
                            icon={
                                HiOutlineStar
                            }
                        />

                        <ModalStat
                            label="Reviews"
                            value={
                                mentor.reviews
                            }
                            icon={
                                HiOutlineBookOpen
                            }
                        />

                        <ModalStat
                            label="Sessions"
                            value={
                                mentor.completedSessions
                            }
                            icon={
                                HiOutlineAcademicCap
                            }
                        />
                    </div>

                    <div className="mt-7 grid gap-6 sm:grid-cols-2">
                        <SkillList
                            title="Skills they teach"
                            skills={
                                mentor.teaches
                            }
                            accent
                        />

                        <SkillList
                            title="Skills they want"
                            skills={
                                mentor.wants
                            }
                        />
                    </div>

                    <div className="mt-7 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
                        <div className="flex items-start gap-3">
                            <HiOutlineSparkles className="mt-0.5 shrink-0 text-2xl text-orange-400" />

                            <div>
                                <p className="font-semibold">
                                    Strong skill
                                    match
                                </p>

                                <p className="mt-2 text-sm leading-7 text-white/40">
                                    This user has
                                    relevant teaching
                                    skills and may be
                                    suitable for a
                                    mutual skill
                                    exchange.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-7 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/55 transition hover:bg-white/5 hover:text-white"
                        >
                            Close
                        </button>

                        <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
                        >
                            Send match request

                            <HiOutlineArrowRight />
                        </button>
                    </div>
                </div>
            </div>
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