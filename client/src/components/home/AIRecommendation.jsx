import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaArrowRight,
    FaCheck,
    FaRobot,
} from "react-icons/fa6";
import { HiSparkles } from "react-icons/hi2";

import { useAuth } from "../../context/AuthContext";
import { getMyMatches } from "../../api/matchApi";

const sampleSkills = [
    {
        id: 1,
        name: "React.js",
        category: "Frontend Development",
        match: 95,
        description:
            "Build modern and interactive user interfaces with reusable components.",
    },
    {
        id: 2,
        name: "Node.js",
        category: "Backend Development",
        match: 90,
        description:
            "Create fast and scalable server-side applications using JavaScript.",
    },
    {
        id: 3,
        name: "UI / UX Design",
        category: "Product Design",
        match: 87,
        description:
            "Design user-friendly digital experiences and improve product usability.",
    },
];

const toCard = (match) => ({
    id: match.user.id,

    name:
        match.theyTeach?.title ||
        match.youTeach?.title ||
        match.user.name,

    category: match.mutual
        ? `Two-way swap with ${match.user.name}`
        : `Taught by ${match.user.name}`,

    match: match.score,

    description:
        match.reasons?.join(" · ") ||
        "Matched on your skills, level and availability.",
});

export default function AIRecommendation() {
    const navigate = useNavigate();

    const {
        user,
    } = useAuth();

    const [personalizedSkills, setPersonalizedSkills] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState(null);

    const isPersonalized = Boolean(user && personalizedSkills.length);

    const recommendedSkills = isPersonalized
        ? personalizedSkills
        : sampleSkills;

    const activeSkillId = recommendedSkills.some(
        (skill) => skill.id === selectedSkill
    )
        ? selectedSkill
        : recommendedSkills[0].id;

    useEffect(() => {
        if (!user) {
            return undefined;
        }

        let isMounted = true;

        getMyMatches(3)
            .then((matches) => {
                if (isMounted) {
                    setPersonalizedSkills(matches.map(toCard));
                }
            })
            .catch(() => {
                // Keep the sample preview when matching is unavailable.
            });

        return () => {
            isMounted = false;
        };
    }, [user]);

    return (
        <section className="w-full bg-[#0C0D13] pb-10 pt-20 lg:pb-12 lg:pt-24">
            <div
                className="
          mx-auto grid w-full max-w-[1500px]
          items-start gap-12
          px-5
          sm:px-8
          lg:grid-cols-[0.9fr_1.1fr]
          lg:gap-14
          lg:px-12
          xl:px-16
        "
            >
                {/* Left Content */}
                <div className="lg:pt-6">
                    <span
                        className="
              inline-flex items-center gap-2
              rounded-full
              border border-white/10
              bg-[#111218]
              px-4 py-2
              text-xs font-semibold
              uppercase tracking-[0.22em]
              text-orange-400
            "
                    >
                        <FaRobot />
                        AI Recommendation
                    </span>

                    <h2
                        className="
              mt-6 max-w-2xl
              text-4xl font-semibold
              leading-tight tracking-tight
              text-white
              sm:text-5xl
              lg:text-6xl
            "
                    >
                        Personalized skill suggestions
                        <span className="text-orange-500">
                            {" "}
                            designed for you.
                        </span>
                    </h2>

                    <p
                        className="
              mt-6 max-w-xl
              text-base leading-8
              text-white/45
              sm:text-lg
            "
                    >
                        SkillSwap AI studies your profile, interests and learning
                        goals to recommend the most relevant skills, mentors and
                        learning paths.
                    </p>

                    {/* Feature List */}
                    <div className="mt-8 space-y-4">
                        {[
                            "Recommendations based on your interests",
                            "Personalized skill-match percentage",
                            "Suitable mentor and learning-path suggestions",
                        ].map((item) => (
                            <div
                                key={item}
                                className="flex items-center gap-3"
                            >
                                <div
                                    className="
                    flex h-7 w-7 shrink-0
                    items-center justify-center
                    rounded-full
                    bg-orange-500
                    text-xs text-white
                  "
                                >
                                    <FaCheck />
                                </div>

                                <p className="text-sm text-white/55 sm:text-base">
                                    {item}
                                </p>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                user ? "/recommendations" : "/register"
                            )
                        }
                        className="
              group mt-10
              inline-flex items-center gap-3
              rounded-full
              bg-orange-500
              px-8 py-4
              font-semibold text-white
              transition-all duration-300
              hover:-translate-y-1
              hover:bg-orange-400
            "
                    >
                        Try AI Matching

                        <FaArrowRight
                            className="
                transition-transform duration-300
                group-hover:translate-x-1
              "
                        />
                    </button>
                </div>

                {/* Recommendation Panel */}
                <div
                    className="
            self-start
            rounded-[32px]
            border border-white/10
            bg-[#12131A]
            p-5
            sm:p-7
            lg:p-8
          "
                >
                    {/* Panel Header */}
                    <div
                        className="
              flex flex-col gap-5
              border-b border-white/10
              pb-6
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="
                  flex h-12 w-12
                  items-center justify-center
                  rounded-2xl
                  bg-orange-500
                  text-xl text-white
                "
                            >
                                <HiSparkles />
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-white sm:text-2xl">
                                    AI Suggested Skills
                                </h3>

                                <p className="mt-1 text-sm text-white/35">
                                    {isPersonalized
                                        ? "Based on your current profile"
                                        : "Sample preview — sign in for your own matches"}
                                </p>
                            </div>
                        </div>

                        <span
                            className="
                w-fit rounded-full
                border border-white/10
                bg-[#0C0D13]
                px-4 py-2
                text-xs font-medium
                uppercase tracking-[0.16em]
                text-white/40
              "
                        >
                            {isPersonalized ? "Updated now" : "Demo"}
                        </span>
                    </div>

                    {/* Recommendation Cards */}
                    <div className="mt-6 space-y-4">
                        {recommendedSkills.map((skill) => {
                            const isSelected = activeSkillId === skill.id;

                            return (
                                <button
                                    key={skill.id}
                                    type="button"
                                    onClick={() => setSelectedSkill(skill.id)}
                                    className={`
                    group relative w-full overflow-hidden
                    rounded-[24px]
                    border p-5
                    text-left
                    transition-all duration-300

                    ${isSelected
                                            ? "border-white/60 bg-[#171820]"
                                            : "border-white/10 bg-[#0F1016] hover:border-white/35 hover:bg-[#15161D]"
                                        }
                  `}
                                >
                                    {/* Animated White Line */}
                                    <span
                                        className={`
                      absolute left-0 top-0
                      h-[2px]
                      bg-white
                      transition-all duration-500
                      ease-out

                      ${isSelected
                                                ? "w-full"
                                                : "w-0 group-hover:w-full"
                                            }
                    `}
                                    />

                                    <div
                                        className="
                      flex flex-col gap-5
                      sm:flex-row
                      sm:items-start
                      sm:justify-between
                    "
                                    >
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h4
                                                    className={`
                            text-lg font-semibold
                            transition-colors duration-300

                            ${isSelected
                                                            ? "text-white"
                                                            : "text-white group-hover:text-white"
                                                        }
                          `}
                                                >
                                                    {skill.name}
                                                </h4>

                                                {isSelected && (
                                                    <span
                                                        className="
                              rounded-full
                              bg-orange-500
                              px-3 py-1
                              text-[10px] font-semibold
                              uppercase tracking-[0.14em]
                              text-white
                            "
                                                    >
                                                        Best Match
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-1 text-sm text-white/35">
                                                {skill.category}
                                            </p>

                                            <p className="mt-4 max-w-xl text-sm leading-6 text-white/45">
                                                {skill.description}
                                            </p>
                                        </div>

                                        <div className="shrink-0 sm:text-right">
                                            <p
                                                className={`
                          text-2xl font-bold
                          transition-colors duration-300

                          ${isSelected
                                                        ? "text-white" : "text-orange-400 group-hover:text-white"} `}>
                                                {skill.match}%
                                            </p>

                                            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/25">
                                                Match score
                                            </p>
                                        </div>
                                    </div>

                                    {/* Match Progress */}
                                    <div className="mt-5">
                                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                            <div className=" h-full rounded-full bg-white transition-all duration-700" style={{ width: `${skill.match}%`, }} />
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className=" mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                                        <span className="text-xs font-medium text-white/35">
                                            Recommended learning path
                                        </span>
                                        <FaArrowRight
                                            className={`text-sm transition-all duration-300${isSelected ? "translate-x-1 text-white" : "text-white/30 group-hover:translate-x-1 group-hover:text-white"} `} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}