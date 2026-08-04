import { useEffect, useRef, useState } from "react";
import {
    FaRobot,
    FaUserFriends,
    FaComments,
    FaShieldAlt,
} from "react-icons/fa";

const features = [
    {
        id: "01",
        icon: <FaRobot />,
        title: "AI Smart Matching",
        description:
            "Our AI studies your interests and recommends suitable mentors and learning partners.",
    },
    {
        id: "02",
        icon: <FaUserFriends />,
        title: "Skill Exchange",
        description:
            "Teach what you know and learn valuable skills through meaningful community exchanges.",
    },
    {
        id: "03",
        icon: <FaComments />,
        title: "Real-Time Chat",
        description:
            "Connect instantly, plan sessions and collaborate smoothly with your learning partner.",
    },
    {
        id: "04",
        icon: <FaShieldAlt />,
        title: "Verified Profiles",
        description:
            "Build trust through verified profiles, ratings, reviews and completed skill exchanges.",
    },
];

const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
};

const easeOutCubic = (value) => {
    return 1 - Math.pow(1 - value, 3);
};

function MobileFeatureCard({ feature, index }) {
    const cardRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            {
                threshold: 0.35,
            }
        );

        const currentCard = cardRef.current;

        if (currentCard) {
            observer.observe(currentCard);
        }

        return () => {
            if (currentCard) {
                observer.unobserve(currentCard);
            }
        };
    }, []);

    return (
        <article
            ref={cardRef}
            className={`
        relative min-h-[320px] w-full
        overflow-hidden rounded-[28px]
        border border-white/10
        bg-[#14151B]
        p-6 text-white
        shadow-[0_18px_50px_rgba(0,0,0,0.35)]
        transition-all duration-700 ease-out

        ${isVisible
                    ? "translate-y-0 scale-100 opacity-100"
                    : "translate-y-16 scale-95 opacity-0"
                }
      `}
            style={{
                transitionDelay: `${index * 90}ms`,
            }}
        >
            <div className="relative z-10 flex min-h-[272px] flex-col">
                <div className="flex items-start justify-between">
                    <div
                        className="
              flex h-14 w-14 items-center justify-center
              rounded-2xl
              bg-orange-500
              text-2xl text-white
            "
                    >
                        {feature.icon}
                    </div>

                    <span className="text-xs font-semibold tracking-[0.25em] text-white/30">
                        {feature.id}
                    </span>
                </div>

                <div className="mt-auto">
                    <h3 className="text-2xl font-semibold text-white">
                        {feature.title}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-white/50">
                        {feature.description}
                    </p>

                    <div className="mt-6 h-px bg-white/10" />

                    <button
                        type="button"
                        className="
              mt-5 flex items-center gap-2
              text-sm  text-orange-400
              transition-all duration-300
              hover:gap-4
             font-bold"
                    >
                        Explore feature
                        <span aria-hidden="true">→</span>
                    </button>
                </div>
            </div>
        </article>
    );
}

export default function WhyChooseUs() {
    const sectionRef = useRef(null);
    const animationFrameRef = useRef(null);

    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            if (!sectionRef.current) return;

            const rect = sectionRef.current.getBoundingClientRect();

            const animationStart = window.innerHeight * 0.18;
            const animationDistance = window.innerHeight * 0.20;

            const rawProgress =
                (animationStart - rect.top) / animationDistance;

            const normalizedProgress = clamp(rawProgress, 0, 1);
            const smoothProgress = easeOutCubic(normalizedProgress);

            setProgress(smoothProgress);
        };

        const handleScroll = () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            animationFrameRef.current =
                requestAnimationFrame(updateProgress);
        };

        updateProgress();

        window.addEventListener("scroll", handleScroll, {
            passive: true,
        });

        window.addEventListener("resize", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    const cardPositions = [
        {
            x: -465,
            y: 55,
            rotation: -9,
        },
        {
            x: -155,
            y: -10,
            rotation: -3,
        },
        {
            x: 155,
            y: -10,
            rotation: 3,
        },
        {
            x: 465,
            y: 55,
            rotation: 9,
        },
    ];

    return (
        <section
            ref={sectionRef}
            className="relative bg-[#0B0B0F] lg:h-[138vh]"
        >
            {/* Desktop */}
            <div className="sticky top-0 hidden min-h-screen items-center overflow-hidden py-16 lg:flex">
                <div className="relative mx-auto w-full max-w-[1500px] px-10">
                    {/* Heading */}
                    <div className="relative z-30 mx-auto max-w-5xl text-center">
                        <span
                            className="
                inline-flex rounded-full
                border border-white/10
                bg-white/[0.03]
                px-4 py-2
                text-xs font-semibold uppercase
                tracking-[0.25em] text-orange-400
              "
                        >
                            Why SkillSwap AI
                        </span>

                        <h2 className="mt-6 text-7xl font-light leading-[1.08] text-white">
                            Learn smarter with
                            <span className="font-serif italic text-orange-400">
                                {" "}
                                intelligent connections
                            </span>
                        </h2>

                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/45">
                            Discover how AI-powered matching, verified profiles and
                            real-time collaboration make skill exchange easier.
                        </p>
                    </div>

                    {/* Spread Cards */}
                    <div className="relative mt-6 flex h-[430px] items-center justify-center">
                        {features.map((feature, index) => {
                            const position = cardPositions[index];

                            const translateX = position.x * progress;
                            const translateY = position.y * progress;
                            const rotation = position.rotation * progress;
                            const scale = 0.88 + progress * 0.12;

                            return (
                                <article
                                    key={feature.id}
                                    className="
                                    group absolute
                                    h-[345px] w-[285px]
                        overflow-hidden
                        rounded-[30px]
                        border border-white/10
                        bg-[#14151B]
                        shadow-[0_20px_60px_rgba(0,0,0,.45)]
                        transition-all
                        duration-500
                        will-change-transform

                        hover:border-orange-500/60
                        hover:-translate-y-3
                        hover:shadow-[0_30px_80px_rgba(0,0,0,.65)]
                        "
                                    style={{
                                        transform: `
                      translate3d(
                        ${translateX}px,
                        ${translateY}px,
                        0
                      )
                      rotate(${rotation}deg)
                      scale(${scale})
                    `,
                                        zIndex: features.length - index,
                                        opacity: 0.82 + progress * 0.18,
                                    }}
                                >
                                    <div className="relative z-10 flex h-full flex-col p-7 text-white">
                                        <div className="flex items-start justify-between">
                                            <div
                                                className="
                          flex h-14 w-14 items-center justify-center
                          rounded-2xl
                          bg-orange-500
                          text-2xl text-white
                        "
                                            >
                                                {feature.icon}
                                            </div>

                                            <span className="text-xs font-semibold tracking-[0.25em] text-white/30">
                                                {feature.id}
                                            </span>
                                        </div>

                                        <div className="mt-auto">
                                            <h3 className="text-2xl font-semibold text-white">
                                                {feature.title}
                                            </h3>

                                            <p className="mt-4 text-sm leading-7 text-white/50">
                                                {feature.description}
                                            </p>

                                            <div className="mt-6 h-px bg-white/10" />

                                            <button
                                                type="button"
                                                className="
                          mt-5 flex items-center gap-2
                          text-sm  text-orange-400
                          transition-all duration-300
                          group-hover:gap-4
                         font-bold"
                                            >
                                                Explore feature
                                                <span aria-hidden="true">→</span>
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {/* Progress */}
                    <div className="mx-auto max-w-sm">
                        <div className="h-[3px] overflow-hidden rounded-full bg-white/10">
                            <div
                                className="h-full rounded-full bg-orange-500"
                                style={{
                                    width: `${progress * 100}%`,
                                }}
                            />
                        </div>

                        <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-white/25">
                            <span>Discover</span>
                            <span>{Math.round(progress * 100)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile and Tablet */}
            <div className="px-4 py-20 sm:px-6 lg:hidden">
                <div className="mx-auto max-w-xl text-center">
                    <span
                        className="
              inline-flex rounded-full
              border border-white/10
              bg-white/[0.03]
              px-4 py-2
              text-[10px] font-semibold uppercase
              tracking-[0.28em] text-orange-400
            "
                    >
                        Why SkillSwap AI
                    </span>

                    <h2 className="mt-5 text-4xl font-light leading-tight text-white sm:text-5xl">
                        Learn smarter with
                        <span className="font-serif italic text-orange-400">
                            {" "}
                            intelligent connections
                        </span>
                    </h2>

                    <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-white/45">
                        Discover how AI-powered matching, verified profiles and
                        real-time collaboration make skill exchange easier.
                    </p>
                </div>

                <div className="mx-auto mt-14 flex max-w-md flex-col gap-8">
                    {features.map((feature, index) => (
                        <MobileFeatureCard
                            key={feature.id}
                            feature={feature}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </section >
    );
}