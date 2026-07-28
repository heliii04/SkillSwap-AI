import { useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    motion,
    useScroll,
    useSpring,
    useTransform,
} from "framer-motion";

import {
    FiArrowRight,
    FiBookOpen,
    FiCheckCircle,
    FiMessageCircle,
    FiRepeat,
    FiSearch,
    FiShield,
    FiStar,
    FiUserPlus,
    FiUsers,
    FiZap,
} from "react-icons/fi";

const steps = [
    {
        id: 1,
        icon: FiUserPlus,
        title: "Create Your Account",
        description:
            "Sign up using your name, email and password. Verify your email to activate your SkillSwap AI account securely.",
        points: [
            "Quick registration",
            "Email verification",
            "Secure authentication",
        ],
    },
    {
        id: 2,
        icon: FiBookOpen,
        title: "Add Your Skills",
        description:
            "Tell the community which skills you can teach and which skills you want to learn.",
        points: [
            "Add offered skills",
            "Select learning goals",
            "Choose your skill level",
        ],
    },
    {
        id: 3,
        icon: FiSearch,
        title: "Discover Skill Partners",
        description:
            "Browse available skills and find users whose learning goals match the skills you can offer.",
        points: [
            "Search skills",
            "Apply smart filters",
            "Explore user profiles",
        ],
    },
    {
        id: 4,
        icon: FiZap,
        title: "Get Smart Recommendations",
        description:
            "SkillSwap AI analyzes your skills, interests and preferences to recommend suitable learning partners.",
        points: [
            "Personalized matches",
            "Relevant recommendations",
            "Better learning opportunities",
        ],
    },
    {
        id: 5,
        icon: FiRepeat,
        title: "Send a Swap Request",
        description:
            "Choose a suitable partner and send a skill exchange request with your preferred learning plan.",
        points: [
            "Select offered skill",
            "Choose wanted skill",
            "Add a personal message",
        ],
    },
    {
        id: 6,
        icon: FiMessageCircle,
        title: "Connect and Learn",
        description:
            "Once your request is accepted, communicate with your partner and start exchanging knowledge.",
        points: [
            "Discuss learning goals",
            "Plan sessions",
            "Learn together",
        ],
    },
    {
        id: 7,
        icon: FiStar,
        title: "Complete and Review",
        description:
            "After completing your skill exchange, leave an honest rating and review for your learning partner.",
        points: [
            "Complete the exchange",
            "Give feedback",
            "Build community trust",
        ],
    },
];

const benefits = [
    {
        icon: FiUsers,
        title: "Community Learning",
        description:
            "Learn directly from real people who have practical experience.",
    },
    {
        icon: FiRepeat,
        title: "Skill Exchange",
        description:
            "Teach what you know and receive knowledge in return.",
    },
    {
        icon: FiZap,
        title: "AI Recommendations",
        description:
            "Discover better matches through personalized suggestions.",
    },
    {
        icon: FiShield,
        title: "Safe and Secure",
        description:
            "Protected accounts, verified emails and secure authentication.",
    },
];

const faqs = [
    {
        question: "Do I need to pay to exchange skills?",
        answer:
            "SkillSwap AI is designed around skill exchange. Instead of paying for every course, users can exchange their knowledge with each other.",
    },
    {
        question: "How does SkillSwap AI find suitable partners?",
        answer:
            "The platform uses your offered skills, wanted skills, experience level, availability and preferences to recommend suitable users.",
    },
    {
        question: "Can I browse skills before creating an account?",
        answer:
            "Yes, users can explore available skills. However, login may be required when sending a swap request or accessing protected features.",
    },
    {
        question: "What happens after a request is accepted?",
        answer:
            "Both users can communicate, discuss their learning goals and plan how they want to exchange their skills.",
    },
];

export default function HowItWorks() {
    const { user } = useAuth();

    return (
        <main className="min-h-screen overflow-x-hidden bg-[#07080d] text-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden border-b border-white/10">


                <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 30,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            duration: 0.7,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="mx-auto max-w-4xl text-center"
                    >
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-300">
                            <FiZap />
                            Simple, smart and collaborative learning
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
                            How does
                            <span className="mx-3 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                                SkillSwap AI
                            </span>
                            work?
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-gray-400 sm:text-lg">
                            Share the skills you already know, discover people
                            who can teach what you want to learn and grow
                            together through meaningful skill exchanges.
                        </p>

                        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
                            <Link
                                to={user ? "/dashboard" : "/register"}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-semibold text-black shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-400"
                            >
                                Start Skill Swapping
                                <FiArrowRight />
                            </Link>

                            <Link
                                to="/browse-skills"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-gray-200 transition hover:-translate-y-0.5 hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400"
                            >
                                Browse Skills
                                <FiSearch />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Small Overview */}
            <section className="border-b border-white/10 bg-white/[0.015]">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
                    <OverviewItem
                        number="01"
                        title="Share"
                        text="Add the skills you can teach."
                    />

                    <OverviewItem
                        number="02"
                        title="Match"
                        text="Find the right learning partner."
                    />

                    <OverviewItem
                        number="03"
                        title="Learn"
                        text="Exchange knowledge and grow."
                    />
                </div>
            </section>

            {/* Animated SkillSwap Journey */}
            <AnimatedJourneySection steps={steps} />

            {/* AI Section */}
            <section className="border-y border-white/10 bg-white/[0.02] py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        <motion.div
                            initial={{
                                opacity: 0,
                                x: -50,
                            }}
                            whileInView={{
                                opacity: 1,
                                x: 0,
                            }}
                            viewport={{
                                once: true,
                                amount: 0.3,
                            }}
                            transition={{
                                duration: 0.7,
                            }}
                        >
                            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-300">
                                <FiZap />
                                Powered by intelligent recommendations
                            </div>

                            <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                                AI helps you discover
                                <span className="block bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                                    better skill matches
                                </span>
                            </h2>

                            <p className="mt-5 max-w-xl leading-7 text-gray-400">
                                Instead of showing random profiles, SkillSwap AI
                                considers your skills, learning goals, level,
                                interaction preference and availability to
                                provide more relevant recommendations.
                            </p>

                            <div className="mt-8 space-y-4">
                                <FeaturePoint text="Analyzes offered and wanted skills" />
                                <FeaturePoint text="Considers experience and skill level" />
                                <FeaturePoint text="Suggests compatible learning partners" />
                                <FeaturePoint text="Provides personalized learning guidance" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{
                                opacity: 0,
                                x: 50,
                                scale: 0.95,
                            }}
                            whileInView={{
                                opacity: 1,
                                x: 0,
                                scale: 1,
                            }}
                            viewport={{
                                once: true,
                                amount: 0.3,
                            }}
                            transition={{
                                duration: 0.7,
                            }}
                            className="relative"
                        >

                            <div className="relative rounded-[32px] border border-white/10 bg-[#0d0e15] p-5 shadow-2xl shadow-orange-950/20 sm:p-7">
                                <div className="mb-6 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold">
                                            Smart Match Preview
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Based on your learning profile
                                        </p>
                                    </div>

                                    <span className="shrink-0 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                                        94% Match
                                    </span>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 font-bold text-black">
                                            AP
                                        </div>

                                        <div>
                                            <h3 className="font-semibold">
                                                Aarya Patel
                                            </h3>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Ahmedabad, India
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                        <MatchDetail
                                            label="Can teach"
                                            value="React Development"
                                        />

                                        <MatchDetail
                                            label="Wants to learn"
                                            value="UI/UX Design"
                                        />

                                        <MatchDetail
                                            label="Level"
                                            value="Advanced"
                                        />

                                        <MatchDetail
                                            label="Mode"
                                            value="Online"
                                        />
                                    </div>

                                    <div className="mt-5 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4">
                                        <div className="flex items-start gap-3">
                                            <FiZap className="mt-0.5 shrink-0 text-orange-400" />

                                            <div>
                                                <p className="text-sm font-medium text-orange-300">
                                                    Why this match?
                                                </p>

                                                <p className="mt-1 text-sm leading-6 text-gray-400">
                                                    Aarya teaches React, which
                                                    you want to learn, and she
                                                    is interested in UI/UX
                                                    Design, which you can
                                                    offer.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="mt-5 w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
                                >
                                    Send Swap Request
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-20 lg:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        badge="Why it works"
                        title="Built for meaningful learning"
                        description="SkillSwap AI makes peer-to-peer learning easier, more personalized and more trustworthy."
                    />

                    <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {benefits.map((benefit, index) => {
                            const Icon = benefit.icon;

                            return (
                                <motion.article
                                    key={benefit.title}
                                    initial={{
                                        opacity: 0,
                                        y: 40,
                                    }}
                                    whileInView={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    viewport={{
                                        once: true,
                                        amount: 0.3,
                                    }}
                                    transition={{
                                        duration: 0.55,
                                        delay: index * 0.1,
                                    }}
                                    whileHover={{
                                        y: -8,
                                    }}
                                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-orange-500/30 hover:bg-orange-500/[0.04]"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-xl text-orange-400">
                                        <Icon />
                                    </div>

                                    <h3 className="mt-5 text-lg font-semibold">
                                        {benefit.title}
                                    </h3>

                                    <p className="mt-3 text-sm leading-6 text-gray-500">
                                        {benefit.description}
                                    </p>
                                </motion.article>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="border-t border-white/10 bg-white/[0.018] py-20">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        badge="Frequently asked questions"
                        title="Everything you need to know"
                        description="Quick answers about using SkillSwap AI."
                    />

                    <div className="mt-12 space-y-4">
                        {faqs.map((faq, index) => (
                            <motion.details
                                key={faq.question}
                                initial={{
                                    opacity: 0,
                                    y: 25,
                                }}
                                whileInView={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                viewport={{
                                    once: true,
                                    amount: 0.4,
                                }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.08,
                                }}
                                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 open:border-orange-500/30 open:bg-orange-500/[0.05]"
                            >
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                                    {faq.question}

                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-lg text-gray-400 transition group-open:rotate-45 group-open:bg-orange-500/10 group-open:text-orange-400">
                                        +
                                    </span>
                                </summary>

                                <p className="mt-4 max-w-3xl border-t border-white/10 pt-4 text-sm leading-7 text-gray-400">
                                    {faq.answer}
                                </p>
                            </motion.details>
                        ))}
                    </div>
                </div>
            </section>

        </main>
    );
}

function AnimatedJourneySection({ steps }) {
    const sectionRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start 75%", "end 35%"],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 90,
        damping: 25,
        restDelta: 0.001,
    });

    const lineScale = useTransform(
        smoothProgress,
        [0, 1],
        [0, 1]
    );

    return (
        <section
            ref={sectionRef}
            className="relative overflow-hidden py-20 lg:py-28"
        >
            <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-orange-500/[0.05] blur-[160px]" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    badge="Step-by-step process"
                    title="Your SkillSwap journey"
                    description="From creating your account to completing your first skill exchange, every step is simple and user-friendly."
                />

                <div className="relative mt-16 lg:mt-24">
                    {/* Desktop background line */}
                    <div className="absolute bottom-0 left-1/2 top-0 hidden w-[3px] -translate-x-1/2 overflow-hidden rounded-full bg-white/[0.07] lg:block">
                        <motion.div
                            style={{
                                scaleY: lineScale,
                                transformOrigin: "top",
                            }}
                            className="h-full w-full rounded-full bg-gradient-to-b from-orange-300 via-orange-500 to-amber-500 shadow-[0_0_24px_rgba(249,115,22,0.65)]"
                        />
                    </div>

                    {/* Mobile background line */}
                    <div className="absolute bottom-0 left-[21px] top-0 w-[2px] overflow-hidden rounded-full bg-white/[0.07] lg:hidden">
                        <motion.div
                            style={{
                                scaleY: lineScale,
                                transformOrigin: "top",
                            }}
                            className="h-full w-full rounded-full bg-gradient-to-b from-orange-300 via-orange-500 to-amber-500 shadow-[0_0_16px_rgba(249,115,22,0.55)]"
                        />
                    </div>

                    <div className="space-y-10 lg:space-y-4">
                        {steps.map((step, index) => (
                            <AnimatedProcessStep
                                key={step.id}
                                step={step}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function AnimatedProcessStep({ step, index }) {
    const Icon = step.icon;
    const isLeft = index % 2 === 0;

    const cardVariants = {
        hidden: {
            opacity: 0,
            x: isLeft ? -90 : 90,
            y: 35,
            scale: 0.94,
            filter: "blur(8px)",
        },
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            transition: {
                duration: 0.75,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    };

    const dotVariants = {
        hidden: {
            scale: 0.4,
            opacity: 0,
        },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                delay: 0.15,
                type: "spring",
                stiffness: 260,
                damping: 18,
            },
        },
    };

    return (
        <motion.article
            initial="hidden"
            whileInView="visible"
            viewport={{
                once: false,
                amount: 0.35,
                margin: "-80px 0px -80px 0px",
            }}
            className="relative grid min-h-[320px] items-center lg:grid-cols-2 lg:gap-28"
        >
            {/* Desktop center dot */}
            <motion.div
                variants={dotVariants}
                className="absolute left-1/2 top-1/2 z-20 hidden h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-orange-300/70 bg-[#07080d] lg:flex"
            >
                <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
            </motion.div>

            {/* Desktop step label */}
            <motion.div
                variants={dotVariants}
                className={`absolute top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-orange-500/30 bg-orange-500 px-3 py-1 text-xs font-bold text-black shadow-lg shadow-orange-500/20 lg:block ${isLeft
                        ? "left-[calc(50%+28px)]"
                        : "right-[calc(50%+28px)]"
                    }`}
            >
                STEP {String(step.id).padStart(2, "0")}
            </motion.div>

            {/* Mobile timeline dot */}
            <motion.div
                variants={dotVariants}
                className="absolute left-[10px] top-8 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-orange-300/60 bg-[#07080d] lg:hidden"
            >
                <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
            </motion.div>

            {/* Journey card */}
            <motion.div
                variants={cardVariants}
                className={`pl-14 lg:pl-0 ${isLeft
                        ? "lg:col-start-1 lg:pr-3"
                        : "lg:col-start-2 lg:pl-3"
                    }`}
            >
                <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0d0e14]/95 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:border-orange-500/40 hover:shadow-[0_24px_70px_rgba(249,115,22,0.12)] sm:p-8">
                    {/* Animated top border */}
                    <motion.div
                        initial={{
                            scaleX: 0,
                        }}
                        whileInView={{
                            scaleX: 1,
                        }}
                        viewport={{
                            once: false,
                            amount: 0.5,
                        }}
                        transition={{
                            duration: 0.8,
                            delay: 0.15,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        style={{
                            transformOrigin: isLeft
                                ? "right"
                                : "left",
                        }}
                        className="absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-orange-500 to-transparent"
                    />

                    {/* Card glow */}
                    <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-orange-500/[0.07] blur-[70px] transition duration-500 group-hover:bg-orange-500/[0.14]" />

                    <div className="relative">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                            <motion.div
                                whileHover={{
                                    rotate: [0, -8, 8, 0],
                                    scale: 1.08,
                                }}
                                transition={{
                                    duration: 0.5,
                                }}
                                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/20 to-amber-500/[0.06] text-2xl text-orange-400 shadow-inner shadow-orange-500/10"
                            >
                                <Icon />
                            </motion.div>

                            <div className="min-w-0 flex-1">
                                <div className="mb-3 flex flex-wrap items-center gap-3">
                                    <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-400 lg:hidden">
                                        Step{" "}
                                        {String(step.id).padStart(
                                            2,
                                            "0"
                                        )}
                                    </span>

                                    <span className="h-px w-10 bg-gradient-to-r from-orange-500 to-transparent" />
                                </div>

                                <h3 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                                    {step.title}
                                </h3>

                                <p className="mt-4 text-sm leading-7 text-gray-400">
                                    {step.description}
                                </p>

                                <div className="mt-6 grid gap-3">
                                    {step.points.map(
                                        (point, pointIndex) => (
                                            <motion.div
                                                key={point}
                                                initial={{
                                                    opacity: 0,
                                                    x: -12,
                                                }}
                                                whileInView={{
                                                    opacity: 1,
                                                    x: 0,
                                                }}
                                                viewport={{
                                                    once: false,
                                                    amount: 0.8,
                                                }}
                                                transition={{
                                                    delay:
                                                        0.25 +
                                                        pointIndex *
                                                        0.1,
                                                    duration: 0.4,
                                                }}
                                                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5 text-sm text-gray-300"
                                            >
                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
                                                    <FiCheckCircle />
                                                </div>

                                                {point}
                                            </motion.div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.article>
    );
}

function OverviewItem({ number, title, text }) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 20,
            }}
            whileInView={{
                opacity: 1,
                y: 0,
            }}
            viewport={{
                once: true,
                amount: 0.5,
            }}
            transition={{
                duration: 0.5,
            }}
            className="flex items-center justify-center gap-4 border-white/10 sm:border-r sm:last:border-r-0"
        >
            <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-3xl font-bold text-transparent">
                {number}
            </span>

            <div>
                <h3 className="font-semibold">{title}</h3>

                <p className="mt-1 text-sm text-gray-500">
                    {text}
                </p>
            </div>
        </motion.div>
    );
}

function SectionHeading({ badge, title, description }) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 30,
            }}
            whileInView={{
                opacity: 1,
                y: 0,
            }}
            viewport={{
                once: true,
                amount: 0.4,
            }}
            transition={{
                duration: 0.65,
            }}
            className="mx-auto max-w-3xl text-center"
        >
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
                {badge}
            </span>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {title}
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-7 text-gray-400">
                {description}
            </p>
        </motion.div>
    );
}

function FeaturePoint({ text }) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                x: -15,
            }}
            whileInView={{
                opacity: 1,
                x: 0,
            }}
            viewport={{
                once: true,
                amount: 0.7,
            }}
            transition={{
                duration: 0.4,
            }}
            className="flex items-center gap-3"
        >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
                <FiCheckCircle />
            </div>

            <span className="text-sm text-gray-300 sm:text-base">
                {text}
            </span>
        </motion.div>
    );
}

function MatchDetail({ label, value }) {
    return (
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.035] p-3">
            <p className="text-xs text-gray-500">{label}</p>

            <p className="mt-1 truncate text-sm font-medium text-gray-200">
                {value}
            </p>
        </div>
    );
}