import { Link } from "react-router-dom";
import { FiShield, FiArrowLeft } from "react-icons/fi";

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen bg-[#07080d] text-white">
            {/* Hero Header */}
            <section className="relative border-b border-white/10">
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-300" style={{ marginTop: '40px' }}>
                        <FiShield />
                        Your privacy is our priority
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                        Privacy Policy
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-gray-400">
                        Effective date: July 28, 2026. Learn how we collect, use, and safeguard your personal information when using SkillSwap AI.
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
                        <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
                        <p className="mb-4">
                            We collect information you provide directly to us when creating an account, setting up your profile, sending skill swap requests, or messaging other members.
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Account Data:</strong> Name, email address, password, and profile picture (avatar).</li>
                            <li><strong>Profile Data:</strong> Skills you teach, skills you want to learn, headline, location, and bio.</li>
                            <li><strong>Communication Data:</strong> Swap request messages, direct messages in chat, and support inquiries.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
                        <p className="mb-4">
                            We use the collected information for various purposes to provide and improve the SkillSwap AI service:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>To match you with compatible skill-sharing partners using AI recommendations.</li>
                            <li>To facilitate direct communications and chat messages between you and your swap partners.</li>
                            <li>To send you transactional updates, security alerts, and system-level notifications.</li>
                            <li>To maintain, analyze, and optimize the performance and safety of our platform.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold text-white mb-4">3. Data Sharing & Sharing Options</h2>
                        <p>
                            We do not sell, rent, or trade your personal data. Your profile information (name, headline, skills, location, avatar) is visible to other registered users to enable matching. Direct messages are private and visible only to the conversation participants.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Security of Your Data</h2>
                        <p>
                            We implement industry-standard administrative, technical, and physical security measures to protect your personal data from unauthorized access, loss, or alteration. However, please remember that no method of transmission over the internet is 100% secure.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold text-white mb-4">5. Cookies and Local Storage</h2>
                        <p>
                            We use cookies and browser local storage to authenticate your sessions, remember your preferences, and keep you logged in. You can configure your browser to reject cookies, but some parts of the service may not function properly.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights and Choices</h2>
                        <p className="mb-4">
                            Depending on your location, you may have rights to access, edit, or delete your personal data:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>You can update your profile details at any time from your Profile page.</li>
                            <li>You can request the deletion of your account by contacting support.</li>
                            <li>You can opt-out of browser push notifications in your browser settings.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold text-white mb-4">7. Contact Us</h2>
                        <p>
                            If you have any questions or feedback regarding this Privacy Policy, you can reach out to our team at{" "}
                            <span className="text-orange-400 font-semibold">support@skillswap.ai</span> or through our{" "}
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
