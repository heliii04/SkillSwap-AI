import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FiArrowRight,
    FiBookOpen,
    FiCheckCircle,
    FiGlobe,
    FiHeart,
    FiRepeat,
    FiShield,
    FiTarget,
    FiUsers,
    FiZap,
} from "react-icons/fi";

const values = [
    {
        icon: FiUsers,
        title: "Community First",
        description:
            "We believe meaningful learning happens when people share knowledge and grow together.",
    },
    {
        icon: FiRepeat,
        title: "Mutual Growth",
        description:
            "Every user can be both a learner and a mentor, creating a balanced exchange of value.",
    },
    {
        icon: FiShield,
        title: "Trust and Safety",
        description:
            "Secure authentication, verified accounts and transparent reviews help create a trusted platform.",
    },
    {
        icon: FiZap,
        title: "Smart Personalization",
        description:
            "AI-powered recommendations help users discover more relevant skills and learning partners.",
    },
];

const highlights = [
    {
        number: "01",
        title: "Learn",
        text: "Discover skills you want to master.",
    },
    {
        number: "02",
        title: "Teach",
        text: "Share knowledge you already have.",
    },
    {
        number: "03",
        title: "Connect",
        text: "Meet people with compatible learning goals.",
    },
    {
        number: "04",
        title: "Grow",
        text: "Build confidence, experience and community trust.",
    },
];

const features = [
    "Peer-to-peer skill exchange",
    "AI-powered partner recommendations",
    "Personalized learning opportunities",
    "Secure user authentication",
    "Verified email accounts",
    "Skill-based discovery and filters",
    "Swap requests and messaging",
    "Ratings and community reviews",
];

export default function About() {
    return (
        <main className="min-h-screen overflow-hidden bg-[#07080d] text-white">
            {/* Hero Section */}
            <section className="relative">
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
                            <FiHeart />
                            Built for collaborative learning
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl pb-2 leading-[1.2]">
                            About
                            <span className="mx-3 text-orange-500 py-1">
                                SkillSwap AI
                            </span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-gray-400 sm:text-lg">
                            SkillSwap AI is a peer-to-peer learning platform
                            where people exchange skills, connect with suitable
                            learning partners and grow through personalized,
                            community-driven learning.
                        </p>

                        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
                            <Link
                                to="/browse-skills"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-semibold text-black hover:bg-orange-400"
                            >
                                Explore Skills
                                <FiArrowRight />
                            </Link>

                            <Link
                                to="/how-it-works"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-gray-200 hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400"
                            >
                                How It Works
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Highlights */}
            <section className="px-5 py-10 sm:px-8 lg:px-12">
                <div className="mx-auto max-w-7xl">
                    <div className="grid overflow-hidden rounded-[28px] border border-white/10 sm:grid-cols-2 lg:grid-cols-4">
                        {highlights.map((item, index) => (
                            <div
                                key={item.number}
                                className={`relative flex min-h-[145px] items-center justify-center gap-5 px-6 py-8 border-white/10 ${
                                    index !== highlights.length - 1 ? "border-b lg:border-b-0 lg:border-r" : ""
                                } ${index === 2 ? "sm:border-b-0" : ""} ${
                                    index === 0 || index === 2 ? "sm:border-r" : ""
                                } ${index === 1 ? "sm:border-r-0 lg:border-r" : ""}`}
                            >
                                <span className="shrink-0 text-3xl font-bold tracking-tight text-orange-500 sm:text-4xl">
                                    {item.number}
                                </span>

                                <div className="text-left">
                                    <h3 className="text-base font-semibold text-white sm:text-lg">
                                        {item.title}
                                    </h3>
                                    <p className="mt-1 text-sm leading-relaxed text-white/45">
                                        {item.text}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="relative py-20 lg:py-28">


                <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
                    <div>
                        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
                            Our Story
                        </span>

                        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl pb-1 leading-[1.25]">
                            Learning should be
                            <span className="block text-orange-500 py-1">
                                accessible to everyone
                            </span>
                        </h2>

                        <div className="mt-6 space-y-5 leading-8 text-gray-400">
                            <p>
                                Many people want to learn new skills but cannot
                                always afford expensive courses or find the
                                right mentor.
                            </p>

                            <p>
                                At the same time, those people may already have
                                valuable knowledge that someone else wants to
                                learn. SkillSwap AI connects both sides and
                                creates a direct exchange of knowledge.
                            </p>

                            <p>
                                Instead of treating users only as learners, the
                                platform allows every person to become both a
                                learner and a teacher.
                            </p>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="relative rounded-[32px] border border-white/10 bg-[#0d0e15] p-6 shadow-2xl shadow-orange-950/20 sm:p-8">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-2xl text-black">
                                    <FiRepeat />
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        The SkillSwap Model
                                    </p>
                                    <h3 className="mt-1 text-xl font-semibold">
                                        Knowledge for Knowledge
                                    </h3>
                                </div>
                            </div>

                            <div className="mt-7 space-y-4">
                                <ExchangeRow
                                    label="You can teach"
                                    value="UI/UX Design"
                                />

                                <div className="flex justify-center text-xl text-orange-400">
                                    <FiRepeat />
                                </div>

                                <ExchangeRow
                                    label="You want to learn"
                                    value="React Development"
                                />
                            </div>

                            <div className="mt-7 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
                                <p className="text-sm font-medium text-orange-300">
                                    The result
                                </p>

                                <p className="mt-2 text-sm leading-6 text-gray-400">
                                    Two people exchange knowledge, save learning
                                    costs and build a meaningful professional
                                    connection.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission and Vision */}
            <section className="border-y border-white/10 bg-white/[0.02] py-20">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
                    <article className="hover-card rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-9">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-2xl text-orange-400">
                            <FiTarget />
                        </div>

                        <h2 className="mt-6 text-2xl font-bold">
                            Our Mission
                        </h2>

                        <p className="mt-4 leading-8 text-gray-400">
                            To make skill development more affordable,
                            personalized and collaborative by connecting people
                            who can teach and learn from each other.
                        </p>
                    </article>

                    <article className="hover-card rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-9">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-2xl text-orange-400">
                            <FiGlobe />
                        </div>

                        <h2 className="mt-6 text-2xl font-bold">
                            Our Vision
                        </h2>

                        <p className="mt-4 leading-8 text-gray-400">
                            To create a global learning community where every
                            person can access knowledge, share expertise and
                            grow without traditional learning barriers.
                        </p>
                    </article>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-20 lg:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        badge="Our Core Values"
                        title="What guides SkillSwap AI"
                        description="The platform is designed around collaboration, trust, accessibility and smart technology."
                    />

                    <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {values.map((value) => {
                            const Icon = value.icon;

                            return (
                                <article
                                    key={value.title}
                                    className="hover-card rounded-3xl border border-white/10 bg-white/[0.03] p-6"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-xl text-orange-400">
                                        <Icon />
                                    </div>

                                    <h3 className="mt-5 text-lg font-semibold">
                                        {value.title}
                                    </h3>

                                    <p className="mt-3 text-sm leading-6 text-gray-500">
                                        {value.description}
                                    </p>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* AI Role */}
            <section className="border-y border-white/10 bg-white/[0.018] py-20 lg:py-24">
                <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
                    <div className="order-2 lg:order-1">
                        <div className="rounded-[32px] border border-white/10 bg-[#0d0e15] p-6 sm:p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold">
                                        AI Recommendation
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Personalized to your profile
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-xl text-orange-400">
                                    <FiZap />
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <RecommendationItem
                                    number="94%"
                                    title="Skill compatibility"
                                    description="Both users have matching offered and wanted skills."
                                />

                                <RecommendationItem
                                    number="88%"
                                    title="Schedule compatibility"
                                    description="Both users prefer evening online sessions."
                                />

                                <RecommendationItem
                                    number="91%"
                                    title="Learning level match"
                                    description="Experience levels are suitable for the exchange."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2">
                        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
                            The Role of AI
                        </span>

                        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl pb-1 leading-[1.25]">
                            Smarter connections,
                            <span className="block text-orange-500 py-1">
                                better learning
                            </span>
                        </h2>

                        <p className="mt-6 leading-8 text-gray-400">
                            AI is used to improve the user experience, not to
                            replace real human learning. It analyzes profile
                            information and helps users find more relevant
                            learning opportunities.
                        </p>

                        <div className="mt-8 space-y-4">
                            <FeaturePoint text="Smart skill-partner recommendations" />
                            <FeaturePoint text="Personalized learning roadmaps" />
                            <FeaturePoint text="Better skill descriptions" />
                            <FeaturePoint text="Intelligent skill discovery" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 lg:py-28">
                <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
                    <div>
                        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
                            Platform Features
                        </span>

                        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                            Everything needed for a meaningful skill exchange
                        </h2>

                        <p className="mt-5 leading-7 text-gray-400">
                            SkillSwap AI combines community features, secure
                            authentication and intelligent recommendations in
                            one platform.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {features.map((feature) => (
                            <div
                                key={feature}
                                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
                            >
                                <FiCheckCircle className="shrink-0 text-emerald-400" />
                                <span className="text-sm text-gray-300">
                                    {feature}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </main>
    );
}

function ExchangeRow({ label, value }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <p className="text-xs uppercase tracking-wider text-gray-500">
                {label}
            </p>

            <p className="mt-2 font-semibold text-gray-200">{value}</p>
        </div>
    );
}

function SectionHeading({ badge, title, description }) {
    return (
        <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
                {badge}
            </span>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {title}
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-7 text-gray-400">
                {description}
            </p>
        </div>
    );
}

function FeaturePoint({ text }) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <FiCheckCircle />
            </div>

            <span className="text-sm text-gray-300 sm:text-base">
                {text}
            </span>
        </div>
    );
}

function RecommendationItem({ number, title, description }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-sm font-bold text-orange-400">
                    {number}
                </div>

                <div>
                    <h3 className="text-sm font-semibold">{title}</h3>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}