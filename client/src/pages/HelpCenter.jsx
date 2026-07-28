import { useState } from "react";
import { Link } from "react-router-dom";
import {
    FiHelpCircle,
    FiUser,
    FiRepeat,
    FiShield,
    FiMail,
    FiSearch,
    FiArrowLeft,
    FiChevronRight
} from "react-icons/fi";

const helpTopics = [
    {
        category: "Getting Started",
        icon: FiUser,
        color: "text-blue-400 bg-blue-500/10 border-blue-500/25",
        articles: [
            { title: "How to create an account", link: "/how-it-works" },
            { title: "Verifying your email and OTP", link: "/how-it-works" },
            { title: "Setting up your profile skills", link: "/profile" },
            { title: "Uploading your profile photo", link: "/profile" }
        ]
    },
    {
        category: "Skill Swapping",
        icon: FiRepeat,
        color: "text-orange-400 bg-orange-500/10 border-orange-500/25",
        articles: [
            { title: "Finding the right skill match", link: "/browse-skills" },
            { title: "Sending your first swap request", link: "/how-it-works" },
            { title: "Responding to received swap requests", link: "/requests" },
            { title: "How does the matching score work?", link: "/faq" }
        ]
    },
    {
        category: "Safety & Messaging",
        icon: FiShield,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
        articles: [
            { title: "Direct chat guidelines", link: "/faq" },
            { title: "Reviewing and rating partners", link: "/faq" },
            { title: "Reporting abusive or spam profiles", link: "/contact" },
            { title: "Keeping your account secure", link: "/privacy" }
        ]
    },
    {
        category: "Help & Feedback",
        icon: FiMail,
        color: "text-purple-400 bg-purple-500/10 border-purple-500/25",
        articles: [
            { title: "How to request support", link: "/contact" },
            { title: "Suggesting new features", link: "/contact" },
            { title: "Reporting website bugs", link: "/contact" },
            { title: "Frequently Asked Questions", link: "/faq" }
        ]
    }
];

export default function HelpCenter() {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredTopics = helpTopics.map(topic => {
        const filteredArticles = topic.articles.filter(article =>
            article.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return { ...topic, articles: filteredArticles };
    }).filter(topic => topic.articles.length > 0);

    return (
        <main className="min-h-screen bg-[#07080d] text-white">
            {/* Hero Header */}
            <section className="relative border-b border-white/10">
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-300" style={{ marginTop: '40px' }}>
                        <FiHelpCircle />
                        Support Portal
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                        Help Center
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-gray-400">
                        Find guides, troubleshooting steps, and answers to assist you on your collaborative learning journey.
                    </p>

                    {/* Search Bar */}
                    <div className="mt-8 max-w-lg mx-auto relative">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search help articles (e.g., account, swap)..."
                            className="w-full bg-[#111218] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-orange-500 transition shadow-inner"
                        />
                    </div>
                </div>
            </section>

            {/* Topics Section */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 mb-8"
                >
                    <FiArrowLeft />
                    Back to Home
                </Link>

                <div className="grid gap-8 md:grid-cols-2">
                    {filteredTopics.map((topic) => {
                        const Icon = topic.icon;

                        return (
                            <article
                                key={topic.category}
                                className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 transition duration-300 hover:border-white/15"
                            >
                                <div className="flex items-center gap-4 border-b border-white/5 pb-4 mb-5">
                                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xl ${topic.color}`}>
                                        <Icon />
                                    </div>
                                    <h2 className="text-lg font-semibold text-white">
                                        {topic.category}
                                    </h2>
                                </div>

                                <ul className="space-y-3">
                                    {topic.articles.map((article, index) => (
                                        <li key={index}>
                                            <Link
                                                to={article.link}
                                                className="flex items-center justify-between text-sm text-gray-400 hover:text-orange-400 transition py-1 group"
                                            >
                                                <span>{article.title}</span>
                                                <FiChevronRight className="text-gray-600 transition-transform duration-300 group-hover:translate-x-1" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </article>
                        );
                    })}
                </div>

                {filteredTopics.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No articles found matching "{searchQuery}"
                    </div>
                )}

                {/* Contact Box */}
                <div className="mt-16 text-center rounded-[32px] border border-orange-500/10 bg-orange-500/[0.015] p-8">
                    <h3 className="text-lg font-semibold text-white">Need personal assistance?</h3>
                    <p className="mt-2 text-sm text-gray-400 max-w-md mx-auto">
                        Our support team is available to help resolve your account problems, platform bugs, or safety questions.
                    </p>
                    <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black hover:bg-orange-400 transition"
                        >
                            Open Support Ticket
                        </Link>
                        <Link
                            to="/faq"
                            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-gray-200 hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400 transition"
                        >
                            Browse FAQ
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
