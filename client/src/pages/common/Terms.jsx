import { Link } from "react-router-dom";
import { FiBookOpen, FiArrowLeft } from "react-icons/fi";

export default function Terms() {
    return (
        <main className="min-h-screen bg-[#07080d] text-white">
            {/* Hero Header */}
            <section className="relative border-b border-white/10">
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-300" style={{ marginTop: '40px' }}  >
                        <FiBookOpen />
                        Please read carefully
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                        Terms & Conditions
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-gray-400">
                        Last modified: July 28, 2026. Understand your rights and rules of conduct on the SkillSwap AI platform.
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

                <div className="space-y-12 text-gray-300 leading-8">
                    <div>
                        <h2 className="text-2xl font-semibold text-white mb-4">1. Agreement to Terms</h2>
                        <p>
                            By accessing or using SkillSwap AI, you agree to comply with and be bound by these Terms & Conditions. If you do not agree to these terms, please do not use the platform.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold text-white mb-4">2. Eligibility & Account Creation</h2>
                        <p className="mb-4">
                            To use certain features of the platform, you must create a verified account. By registering, you agree to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide accurate and complete information.</li>
                            <li>Maintain the security of your password and credentials.</li>
                            <li>Promptly update your email or profile information if it changes.</li>
                            <li>Be solely responsible for all activities that occur under your account.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold text-white mb-4">3. Platform Rules of Conduct</h2>
                        <p className="mb-4">
                            SkillSwap AI is built for collaborative, community-driven learning. You agree NOT to use the platform to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Harass, abuse, or harm other platform members.</li>
                            <li>Offer illegal services, spam, commercial advertisements, or unauthorized links.</li>
                            <li>Send inappropriate or offensive content in chat messages.</li>
                            <li>Impersonate any person or entity, or falsely state your skills and background.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Skill Swap Agreements</h2>
                        <p>
                            SkillSwap AI provides matching tools and direct messaging, but any actual skill-sharing sessions (time, location, teaching methods) are agreed upon directly between the users. SkillSwap AI is not responsible for the quality, safety, or legality of any skill swaps organized through the platform.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold text-white mb-4">5. Intellectual Property</h2>
                        <p>
                            The platform structure, design, text, logos, algorithms, and code are owned by SkillSwap AI. You are granted a limited, non-exclusive license to use the service for personal, collaborative learning.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold text-white mb-4">6. Limitation of Liability</h2>
                        <p>
                            SkillSwap AI is provided "as is" and "as available". We do not guarantee uninterrupted access or error-free functionality. To the maximum extent permitted by law, we shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use of the service or interaction with other users.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold text-white mb-4">7. Termination</h2>
                        <p>
                            We reserve the right to suspend or terminate your account and block your access to the service immediately, without prior notice, if you violate these Terms & Conditions or engage in activity that harms the community.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold text-white mb-4">8. Governing Law</h2>
                        <p>
                            These terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold text-white mb-4">9. Contact Information</h2>
                        <p>
                            If you have questions about these Terms & Conditions, please contact us at{" "}
                            <span className="text-orange-400 font-semibold">support@skillswap.ai</span> or fill out the form on our{" "}
                            <Link to="/contact" className="text-orange-400 hover:underline">
                                Contact page
                            </Link>.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
