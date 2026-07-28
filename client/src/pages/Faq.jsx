import { useState } from "react";
import { Link } from "react-router-dom";
import { FiHelpCircle, FiChevronDown, FiChevronUp, FiArrowLeft } from "react-icons/fi";

const faqData = [
    {
        category: "General",
        items: [
            {
                question: "What is SkillSwap AI?",
                answer: "SkillSwap AI is a peer-to-peer collaborative learning platform where you can swap skills with others. For example, if you know web development and want to learn guitar, you can find someone who knows guitar and wants to learn web development. Our AI helps recommend compatible partners.",
            },
            {
                question: "Is it free to use?",
                answer: "Yes! SkillSwap AI is a community-driven exchange platform. There is no money involved; the currency is knowledge and collaborative teaching.",
            },
            {
                question: "Who can join SkillSwap AI?",
                answer: "Anyone who has a skill to teach and a desire to learn can join! Whether you are a professional coder, a hobbyist photographer, a linguist, or a fitness coach, there is a place for you.",
            },
        ],
    },
    {
        category: "Skill Swapping",
        items: [
            {
                question: "How do I find a learning partner?",
                answer: "You can use the 'Browse Skills' page to filter by skills or search directly using the Search bar. The AI dashboard will also automatically recommend matching profiles based on the skills you want to learn and teach.",
            },
            {
                question: "What is a Swap Request?",
                answer: "A Swap Request is a formal request sent to another member proposing a skill swap. You specify the skill you want to teach them, the skill you want to learn from them, and an optional message. They can choose to Accept or Decline the request.",
            },
            {
                question: "What happens after a request is accepted?",
                answer: "Once a swap request is accepted, a secure direct chat box is created under the 'Messages' tab. You and your learning partner can message each other to coordinate swap details, schedules, and learning platforms (like Zoom or Google Meet).",
            },
        ],
    },
    {
        category: "Account & Safety",
        items: [
            {
                question: "Is my personal contact information shared?",
                answer: "No. Your email address and personal credentials are never shared. Other members can only see your public profile (name, headline, bio, location, and skills) and message you through the secure in-app chat.",
            },
            {
                question: "How does AI matching work?",
                answer: "Our AI matching engine scans user wishlist profiles (skills you teach and want to learn) to find reciprocal matches. If user A teaches Python and wants guitar, and user B teaches guitar and wants Python, the system marks this as a high-compatibility match and prompts you.",
            },
            {
                question: "How do I report spam or abusive behavior?",
                answer: "We support a safe learning community. You can go to our Support/Contact page and report safety violations. We review and terminate violating profiles within 24 hours.",
            },
        ],
    },
];

export default function Faq() {
    const [openIndex, setOpenIndex] = useState({});

    const toggleFaq = (categoryName, index) => {
        const key = `${categoryName}-${index}`;
        setOpenIndex(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <main className="min-h-screen bg-[#07080d] text-white">
            {/* Hero Header */}
            <section className="relative border-b border-white/10">
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-300" style={{ marginTop: '40px' }}>
                        <FiHelpCircle />
                        Common questions answered
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                        Frequently Asked Questions
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-gray-400">
                        Everything you need to know about SkillSwap AI. Can't find the answer you're looking for? Reach out to support.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 mb-8"
                >
                    <FiArrowLeft />
                    Back to Home
                </Link>

                <div className="space-y-16">
                    {faqData.map((category) => (
                        <div key={category.category}>
                            <h2 className="text-xl font-bold text-orange-400 border-b border-white/10 pb-3 mb-6 uppercase tracking-wider">
                                {category.category}
                            </h2>

                            <div className="space-y-4">
                                {category.items.map((item, index) => {
                                    const key = `${category.category}-${index}`;
                                    const isOpen = openIndex[key];

                                    return (
                                        <article
                                            key={index}
                                            className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden transition-all duration-300 hover:border-white/15"
                                        >
                                            <button
                                                onClick={() => toggleFaq(category.category, index)}
                                                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left font-medium text-white hover:text-orange-300 focus:outline-none"
                                            >
                                                <span>{item.question}</span>
                                                {isOpen ? <FiChevronUp className="text-orange-400 text-lg shrink-0" /> : <FiChevronDown className="text-gray-500 text-lg shrink-0" />}
                                            </button>

                                            {isOpen && (
                                                <div className="px-6 pb-6 text-sm leading-7 text-gray-400 border-t border-white/5 pt-4 bg-white/[0.005]">
                                                    {item.answer}
                                                </div>
                                            )}
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Section */}
                <div className="mt-16 text-center rounded-3xl border border-orange-500/10 bg-orange-500/[0.02] p-8">
                    <h3 className="text-lg font-semibold text-white">Still have questions?</h3>
                    <p className="mt-2 text-sm text-gray-400 max-w-md mx-auto">
                        If you cannot find the answer in our FAQs, send us a query directly and our support team will help.
                    </p>
                    <div className="mt-6">
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black hover:bg-orange-400 transition"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
