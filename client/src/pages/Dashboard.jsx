import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../api/tokenStore";

import {
    HiOutlineAcademicCap,
    HiOutlineArrowRight,
    HiOutlineBookOpen,
    HiOutlineCalendarDays,
    HiOutlineChatBubbleLeftRight,
    HiOutlineClock,
    HiOutlineLightBulb,
    HiOutlinePaperAirplane,
    HiOutlineSparkles,
    HiOutlineUser,
    HiOutlineUserGroup,
} from "react-icons/hi2";

import { useAuth } from "../context/AuthContext";



export default function Dashboard() {
    const navigate = useNavigate();

    const {
        user,
    } = useAuth();

    const [stats, setStats] = useState({
        teachCount: 0,
        learnCount: 0,
        activeRequestsCount: 0,
        connectionsCount: 0,
        incomingPendingCount: 0,
        recentActivities: [],
        loading: true,
    });

    useEffect(() => {
        let isMounted = true;

        const API_URL =
            import.meta.env.VITE_API_URL ||
            "http://localhost:5000/api";

        const fetchStats = async () => {
            try {
                const token = getAccessToken();
                const headers = {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                };

                const [teachRes, learnRes, receivedRes, sentRes] = await Promise.all([
                    fetch(`${API_URL}/skills/teach`, { credentials: "include", headers }),
                    fetch(`${API_URL}/skills/learn`, { credentials: "include", headers }),
                    fetch(`${API_URL}/swap-requests/received`, { credentials: "include", headers }),
                    fetch(`${API_URL}/swap-requests/sent`, { credentials: "include", headers })
                ]);

                if (teachRes.ok && learnRes.ok && receivedRes.ok && sentRes.ok) {
                    const teachData = await teachRes.json();
                    const learnData = await learnRes.json();
                    const receivedData = await receivedRes.json();
                    const sentData = await sentRes.json();

                    const receivedReqs = receivedData?.data?.requests || [];
                    const sentReqs = sentData?.data?.requests || [];

                    const incomingPending = receivedReqs.filter(r => r.status === "pending").length;
                    const sentPending = sentReqs.filter(r => r.status === "pending").length;
                    const acceptedConnections = receivedReqs.filter(r => r.status === "accepted").length +
                                                sentReqs.filter(r => r.status === "accepted").length;

                    const allReqs = [
                        ...receivedReqs.map(r => ({ ...r, direction: "incoming" })),
                        ...sentReqs.map(r => ({ ...r, direction: "sent" }))
                    ];
                    allReqs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                    if (isMounted) {
                        setStats({
                            teachCount: teachData?.data?.count ?? (teachData?.data?.skills?.length || 0),
                            learnCount: learnData?.data?.count ?? (learnData?.data?.skills?.length || 0),
                            activeRequestsCount: incomingPending + sentPending,
                            connectionsCount: acceptedConnections,
                            incomingPendingCount: incomingPending,
                            recentActivities: allReqs.slice(0, 5),
                            loading: false,
                        });
                    }
                }
            } catch (err) {
                console.error("Error fetching dashboard stats:", err);
                if (isMounted) {
                    setStats((prev) => ({ ...prev, loading: false }));
                }
            }
        };

        fetchStats();
        return () => {
            isMounted = false;
        };
    }, []);

    const dynamicFeatures = useMemo(() => {
        return [
            {
                title: "Skills I Teach",
                description:
                    "Add and manage skills that you can teach to other learners.",
                icon: HiOutlineAcademicCap,
                path: "/skills/teach",
                badge: stats.loading ? "Loading..." : `${stats.teachCount} ${stats.teachCount === 1 ? 'skill' : 'skills'}`,
            },
            {
                title: "Skills I Want",
                description:
                    "Create your learning list and find people who can guide you.",
                icon: HiOutlineBookOpen,
                path: "/skills/learn",
                badge: stats.loading ? "Loading..." : `${stats.learnCount} ${stats.learnCount === 1 ? 'goal' : 'goals'}`,
            },
            {
                title: "AI Recommendations",
                description:
                    "Discover personalised skills, mentors and learning opportunities.",
                icon: HiOutlineSparkles,
                path: "/recommendations",
                badge: "AI powered",
            },
            {
                title: "Find Mentors",
                description:
                    "Connect with people based on your skills and learning goals.",
                icon: HiOutlineUserGroup,
                path: "/search",
                badge: "Explore",
            },
            {
                title: "Skill Requests",
                description:
                    "Review incoming requests and track the requests you have sent.",
                icon: HiOutlinePaperAirplane,
                path: "/requests",
                badge: stats.loading ? "Loading..." : `${stats.incomingPendingCount} pending`,
            },
            {
                title: "Messages",
                description:
                    "Continue conversations with mentors and skill partners.",
                icon: HiOutlineChatBubbleLeftRight,
                path: "/messages",
                badge: "0 unread",
            },
        ];
    }, [stats]);

    const firstName = useMemo(() => {
        const fullName =
            user?.name?.trim() || "User";

        return fullName.split(" ")[0];
    }, [user?.name]);

    return (
        <main className="px-4 pb-12 pt-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1500px]">
                <WelcomeSection
                    firstName={firstName}
                    onExplore={() =>
                        navigate("/search")
                    }
                    onAddSkill={() =>
                        navigate("/skills/learn")
                    }
                />

                <StatsGrid stats={stats} />

                <section className="mt-8">
                    <SectionHeading
                        eyebrow="Your workspace"
                        title="Continue your SkillSwap journey"
                        description="Manage your skills, connect with mentors and explore AI-powered opportunities."
                    />

                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {dynamicFeatures.map(
                            (feature) => (
                                <FeatureCard
                                    key={
                                        feature.title
                                    }
                                    {...feature}
                                    onClick={() =>
                                        navigate(
                                            feature.path
                                        )
                                    }
                                />
                            )
                        )}
                    </div>
                </section>

                <section className="mt-8 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
                    <RecentActivity
                        activities={stats.recentActivities}
                        loading={stats.loading}
                    />

                    <ProfileProgress
                        user={user}
                        onComplete={() =>
                            navigate("/profile")
                        }
                    />
                </section>

                <section className="mt-8 grid gap-5 lg:grid-cols-2">
                    <UpcomingSessions />

                    <AiInsight
                        onExplore={() =>
                            navigate(
                                "/recommendations"
                            )
                        }
                    />
                </section>
            </div>
        </main>
    );
}

function WelcomeSection({
    firstName,
    onExplore,
    onAddSkill,
}) {
    return (
        <section className="relative overflow-hidden rounded-[28px] border border-orange-500/20 bg-gradient-to-br from-[#151109] via-[#101116] to-[#0e0f15] p-6 sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />

            <div className="pointer-events-none absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-orange-500/5 blur-3xl" />

            <div className="relative z-10 max-w-3xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
                    <HiOutlineSparkles className="text-base" />
                    SkillSwap workspace
                </div>

                <h1 className="max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                    Welcome back,{" "}
                    <span className="text-orange-500">
                        {firstName}
                    </span>
                    .
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-7 text-white/55 sm:text-base">
                    Build your skills, share your
                    knowledge and connect with people
                    who can help you grow.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={onExplore}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-orange-400"
                    >
                        Explore people
                        <HiOutlineArrowRight className="text-lg" />
                    </button>

                    <button
                        type="button"
                        onClick={onAddSkill}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                    >
                        <HiOutlineLightBulb className="text-lg text-orange-400" />
                        Add a skill
                    </button>
                </div>
            </div>
        </section>
    );
}

function StatsGrid({ stats }) {
    const dynamicStats = useMemo(() => {
        return [
            {
                label: "Skills offered",
                value: stats.loading ? "..." : String(stats.teachCount),
                icon: HiOutlineAcademicCap,
            },
            {
                label: "Learning goals",
                value: stats.loading ? "..." : String(stats.learnCount),
                icon: HiOutlineBookOpen,
            },
            {
                label: "Active requests",
                value: stats.loading ? "..." : String(stats.activeRequestsCount),
                icon: HiOutlinePaperAirplane,
            },
            {
                label: "Connections",
                value: stats.loading ? "..." : String(stats.connectionsCount),
                icon: HiOutlineUserGroup,
            },
        ];
    }, [stats]);

    return (
        <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {dynamicStats.map(
                ({
                    label,
                    value,
                    icon: Icon,
                }) => (
                    <article
                        key={label}
                        className="rounded-2xl border border-white/10 bg-[#101117] p-4 sm:p-5"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-2xl font-semibold sm:text-3xl">
                                    {value}
                                </p>

                                <p className="mt-1 text-xs text-white/45 sm:text-sm">
                                    {label}
                                </p>
                            </div>

                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                                <Icon className="text-xl" />
                            </span>
                        </div>
                    </article>
                )
            )}
        </section>
    );
}

function SectionHeading({
    eyebrow,
    title,
    description,
}) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">
                {eyebrow}
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
                {title}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
                {description}
            </p>
        </div>
    );
}

function FeatureCard({
    title,
    description,
    icon: Icon,
    badge,
    onClick,
}) {
    return (
        <article
            onClick={onClick}
            className="group cursor-pointer flex min-h-64 flex-col rounded-2xl border border-white/10 bg-[#101117] p-5 transition duration-300 hover:-translate-y-1 hover:border-orange-500/40 hover:bg-[#13141b] sm:p-6"
        >
            <div className="flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-black shadow-lg shadow-orange-500/10">
                    <Icon className="text-2xl" />
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/40">
                    {badge}
                </span>
            </div>

            <h3 className="mt-6 text-xl font-semibold">
                {title}
            </h3>

            <p className="mt-3 flex-1 text-sm leading-7 text-white/45">
                {description}
            </p>

            <div
                className="mt-6 inline-flex items-center gap-2 self-start text-sm font-semibold text-orange-500 transition hover:text-orange-400"
            >
                Open workspace

                <HiOutlineArrowRight className="transition-transform group-hover:translate-x-1" />
            </div>
        </article>
    );
}

function RecentActivity({ activities = [], loading = false }) {
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
        });
    };

    return (
        <article className="rounded-2xl border border-white/10 bg-[#101117] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                        Activity
                    </p>

                    <h2 className="mt-2 text-xl font-semibold">
                        Recent activity
                    </h2>
                </div>

                <HiOutlineClock className="text-2xl text-white/30" />
            </div>

            {loading ? (
                <div className="mt-8 flex min-h-52 items-center justify-center">
                    <p className="text-sm text-white/45">Loading activity...</p>
                </div>
            ) : activities.length === 0 ? (
                <div className="mt-8 flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                        <HiOutlineSparkles className="text-2xl" />
                    </span>

                    <h3 className="mt-4 font-semibold">
                        No activity yet
                    </h3>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-white/40">
                        Add your first skill or send a
                        connection request. Your recent
                        activity will appear here.
                    </p>
                </div>
            ) : (
                <div className="mt-6 space-y-4">
                    {activities.map((activity) => {
                        const isIncoming = activity.direction === "incoming";
                        const otherUser = isIncoming ? activity.sender : activity.receiver;
                        const otherName = otherUser?.name || "User";
                        
                        let title = "";
                        let description = "";
                        let statusColor = "text-orange-400 bg-orange-500/10";
                        let Icon = HiOutlinePaperAirplane;

                        if (activity.status === "pending") {
                            if (isIncoming) {
                                title = `Request from ${otherName}`;
                                description = `Wants to swap for your ${activity.receiverSkill?.title || "skill"}`;
                                statusColor = "text-blue-400 bg-blue-500/10";
                                Icon = HiOutlineSparkles;
                            } else {
                                title = `Request sent to ${otherName}`;
                                description = `Offered ${activity.senderSkill?.title || "skill"} for their ${activity.receiverSkill?.title || "skill"}`;
                                statusColor = "text-purple-400 bg-purple-500/10";
                                Icon = HiOutlinePaperAirplane;
                            }
                        } else if (activity.status === "accepted") {
                            title = `Connected with ${otherName}`;
                            description = `Exchanging ${activity.senderSkill?.title || "skill"} for ${activity.receiverSkill?.title || "skill"}`;
                            statusColor = "text-green-400 bg-green-500/10";
                            Icon = HiOutlineUserGroup;
                        } else if (activity.status === "rejected") {
                            title = `Request declined`;
                            description = isIncoming 
                                ? `You declined ${otherName}'s request`
                                : `${otherName} declined your request`;
                            statusColor = "text-red-400 bg-red-500/10";
                            Icon = HiOutlineClock;
                        } else if (activity.status === "cancelled") {
                            title = `Request cancelled`;
                            description = isIncoming 
                                ? `${otherName} cancelled their request`
                                : `You cancelled request to ${otherName}`;
                            statusColor = "text-gray-400 bg-white/10";
                            Icon = HiOutlineClock;
                        } else {
                            title = `Request expired`;
                            description = `Request with ${otherName} expired`;
                            statusColor = "text-gray-400 bg-white/10";
                            Icon = HiOutlineClock;
                        }

                        return (
                            <div key={activity.id} className="flex items-start justify-between gap-4 rounded-xl border border-white/5 bg-[#12131a] p-3.5 transition hover:border-orange-500/20">
                                <div className="flex items-center gap-3">
                                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${statusColor}`}>
                                        <Icon className="text-lg" />
                                    </span>
                                    <div>
                                        <h4 className="text-sm font-medium text-white">{title}</h4>
                                        <p className="mt-0.5 text-xs text-white/45">{description}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-white/30 shrink-0">
                                    {formatDate(activity.createdAt)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </article>
    );
}

function ProfileProgress({
    user,
    onComplete,
}) {
    const completion = user?.profileCompletion ?? 0;

    return (
        <article className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-[#101117] p-5 sm:p-6">
            <div className="flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-black">
                    <HiOutlineUser className="text-2xl" />
                </span>

                <span className="text-2xl font-semibold text-orange-400">
                    {completion}%
                </span>
            </div>

            <h2 className="mt-6 text-xl font-semibold">
                Complete your profile
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/45">
                Add a bio, profile picture, location
                and skills to improve your matches.
            </p>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                    className="h-full rounded-full bg-orange-500"
                    style={{
                        width: `${completion}%`,
                    }}
                />
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-white/40">
                <span>
                    Basic account created
                </span>

                <span>
                    {user?.isEmailVerified
                        ? "Email verified"
                        : "Verification pending"}
                </span>
            </div>

            <button
                type="button"
                onClick={onComplete}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
                Complete profile
                <HiOutlineArrowRight />
            </button>
        </article>
    );
}

function UpcomingSessions() {
    return (
        <article className="rounded-2xl border border-white/10 bg-[#101117] p-5 sm:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                        Schedule
                    </p>

                    <h2 className="mt-2 text-xl font-semibold">
                        Upcoming sessions
                    </h2>
                </div>

                <HiOutlineCalendarDays className="text-2xl text-white/30" />
            </div>

            <div className="mt-7 rounded-2xl border border-dashed border-white/10 p-6 text-center">
                <p className="text-sm font-medium">
                    No sessions scheduled
                </p>

                <p className="mt-2 text-sm leading-6 text-white/40">
                    Confirmed learning sessions will
                    appear here.
                </p>
            </div>
        </article>
    );
}

function AiInsight({
    onExplore,
}) {
    return (
        <article className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-[#101117] p-5 sm:p-6">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-orange-500/15 blur-3xl" />

            <div className="relative">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-black">
                    <HiOutlineSparkles className="text-2xl" />
                </span>

                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                    AI insight
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                    Better matches begin with your
                    skills
                </h2>

                <p className="mt-3 text-sm leading-7 text-white/45">
                    Add skills you can teach and skills
                    you want to learn. SkillSwap AI
                    will use them to generate relevant
                    recommendations.
                </p>

                <button
                    type="button"
                    onClick={onExplore}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange-500 transition hover:text-orange-400"
                >
                    View recommendations
                    <HiOutlineArrowRight />
                </button>
            </div>
        </article>
    );
}