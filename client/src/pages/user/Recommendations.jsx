import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import UserProfileModal from "../../components/profile/UserProfileModal";

import {
    HiOutlineArrowPath,
    HiOutlineArrowRight,
    HiOutlineBolt,
    HiOutlineChatBubbleLeftRight,
    HiOutlineSparkles,
} from "react-icons/hi2";

import MatchBadge from "../../components/ui/MatchBadge";
import { getIcebreaker, getMyMatches } from "../../api/matchApi";
import { useRecommendationsQuery } from "../../hooks/useQueries";

const scoreTone = (score) => {
    if (score >= 80) {
        return "text-emerald-400";
    }

    if (score >= 60) {
        return "text-orange-400";
    }

    return "text-white/60";
};

export default function Recommendations() {
    const navigate = useNavigate();

    const [drafting, setDrafting] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUserScore, setSelectedUserScore] = useState(null);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [autoOpenSwap, setAutoOpenSwap] = useState(false);

    const { data = {}, isLoading: loading, refetch } = useRecommendationsQuery(20);

    const rawMatches = Array.isArray(data) ? data : (data.matches || []);
    const matches = rawMatches.filter(m => m.user?.role !== "admin" && m.user?.name !== "System Admin");
    const hasTeachSkills = Boolean(data.hasTeachSkills);
    const hasLearnSkills = Boolean(data.hasLearnSkills);
    const hasAddedSkills = hasTeachSkills && hasLearnSkills;

    const refresh = () => {
        refetch();
    };

    useEffect(() => {
        const handleRatingUpdate = (e) => {
            const { userId: updatedId } = e.detail || {};
            if (updatedId) {
                refetch();
            }
        };

        window.addEventListener("user_rating_updated", handleRatingUpdate);
        return () => {
            window.removeEventListener("user_rating_updated", handleRatingUpdate);
        };
    }, [refetch]);

    const draftMessage = async (match) => {
        setDrafting(match.user.id);

        try {
            const { message } = await getIcebreaker({
                receiverName: match.user.name,
                youTeach: match.youTeach?.title || match.theyWant?.title,
                youWant: match.theyTeach?.title || match.youWant?.title,
            });

            await navigator.clipboard?.writeText(message);

            toast.success("Message copied — paste it in chat!");
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Message suggestion could not be generated."
            );
        } finally {
            setDrafting(null);
        }
    };

    return (
        <main className="px-4 pb-12 pt-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1500px]">
                <section className="relative overflow-hidden rounded-[28px] border border-orange-500/20 bg-gradient-to-br from-[#151109] via-[#101116] to-[#0e0f15] p-6 sm:p-8">
                    <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />

                    <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
                                <HiOutlineSparkles className="text-base" />
                                AI matches
                            </div>

                            <h1 className="text-2xl font-bold text-white sm:text-3xl">
                                People you should swap skills with
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm text-white/45">
                                Ranked on skill fit, level, availability, session
                                mode and location — and every match explains
                                itself.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={refresh}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm  text-white transition hover:border-white/25 font-bold"
                        >
                            <HiOutlineArrowPath />
                            Refresh
                        </button>
                    </div>
                </section>

                {loading && (
                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                        {[0, 1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="h-56 animate-pulse rounded-[24px] border border-white/5 bg-white/5"
                            />
                        ))}
                    </div>
                )}

                {!loading && matches.length === 0 && (
                    <div className="mt-6 rounded-[24px] border border-white/10 bg-[#12131A] p-10 text-center">
                        <HiOutlineSparkles className="mx-auto text-3xl text-orange-400" />

                        <h2 className="mt-4 text-lg font-semibold text-white">
                            {hasAddedSkills ? "No direct matches found right now" : "Not enough signal yet"}
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm text-white/45">
                            {hasAddedSkills
                                ? "We searched for mentors offering your learning goals, but no new matches are available yet. We'll automatically update your list when new mentors register!"
                                : "Add at least one skill you can teach and one you want to learn. Matching uses both sides to find a fair swap."}
                        </p>

                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            {hasAddedSkills ? (
                                <button
                                    type="button"
                                    onClick={() => navigate("/browse")}
                                    className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-400 flex items-center gap-2"
                                >
                                    Discover All Skills <HiOutlineArrowRight />
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => navigate("/skills/teach")}
                                        className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-400"
                                    >
                                        Add a skill I teach
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => navigate("/skills/learn")}
                                        className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold text-white transition hover:border-white/35"
                                    >
                                        Add a skill I want
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {!loading && matches.length > 0 && (
                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                        {matches.map((match) => (
                            <article
                                key={match.user.id}
                                className="rounded-[24px] border border-white/10 bg-[#12131A] p-6 transition hover:border-white/25"
                            >
                                <header className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        {match.user.avatar ? (
                                            <img
                                                src={match.user.avatar}
                                                alt={match.user.name}
                                                loading="lazy"
                                                decoding="async"
                                                className="h-12 w-12 rounded-2xl object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-lg font-semibold text-white">
                                                {match.user.name
                                                    ?.charAt(0)
                                                    ?.toUpperCase()}
                                            </div>
                                        )}

                                        <div>
                                            <h2 className="font-semibold text-white">
                                                {match.user.name}
                                            </h2>

                                            {(match.user.headline || match.user.location) && (
                                                <p className="text-xs text-white/40">
                                                    {match.user.headline || match.user.location}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right flex items-center justify-end"><MatchBadge value={match.score} /></div>
                                </header>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {match.mutual && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
                                            <HiOutlineBolt />
                                            Two-way swap
                                        </span>
                                    )}
                                    {match.isRelatedMatch && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-purple-300">
                                            <HiOutlineSparkles />
                                            AI Suggested Skill
                                        </span>
                                    )}
                                </div>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-white/5 bg-[#0F1016] p-4">
                                        <p className="text-[10px] uppercase tracking-[0.14em] text-white/30">
                                            They teach you
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-white">
                                            {match.theyTeach?.title || "—"}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-white/5 bg-[#0F1016] p-4">
                                        <p className="text-[10px] uppercase tracking-[0.14em] text-white/30">
                                            You teach them
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-white">
                                            {match.youTeach?.title || "—"}
                                        </p>
                                    </div>
                                </div>

                                <ul className="mt-4 space-y-2">
                                    {match.reasons.map((reason) => (
                                        <li
                                            key={reason}
                                            className="flex gap-2 text-sm text-white/50"
                                        >
                                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                                            {reason}
                                        </li>
                                    ))}
                                </ul>

                                <footer className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-4">
                                    {match.isConnected ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => navigate("/messages")}
                                                className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-400"
                                            >
                                                Open Chat
                                                <HiOutlineChatBubbleLeftRight />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedUserId(match.user.id);
                                                    setSelectedUserScore(match.score);
                                                    setSelectedMatch(match);
                                                }}
                                                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/35"
                                            >
                                                View details
                                                <HiOutlineArrowRight className="animate-arrow-move" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedUserId(match.user.id);
                                                    setSelectedUserScore(match.score);
                                                    setSelectedMatch(match);
                                                    setAutoOpenSwap(true);
                                                }}
                                                className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-400 font-bold"
                                            >
                                                Send swap request
                                                <HiOutlineArrowRight className="animate-arrow-move" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedUserId(match.user.id);
                                                    setSelectedUserScore(match.score);
                                                    setSelectedMatch(match);
                                                    setAutoOpenSwap(false);
                                                }}
                                                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/35 font-bold"
                                            >
                                                View details
                                                <HiOutlineArrowRight className="animate-arrow-move" />
                                            </button>
                                        </>
                                    )}
                                </footer>
                            </article>
                        ))}
                    </div>
                )}

                {selectedUserId && (
                    <UserProfileModal
                        userId={selectedUserId}
                        matchScore={selectedUserScore}
                        autoOpenSwap={autoOpenSwap}
                        initialUser={selectedMatch ? { ...selectedMatch.user, isConnected: selectedMatch.isConnected } : null}
                        initialMatch={selectedMatch}
                        onClose={() => {
                            setSelectedUserId(null);
                            setSelectedUserScore(null);
                            setSelectedMatch(null);
                            setAutoOpenSwap(false);
                        }}
                    />
                )}
            </div>
        </main>
    );
}

