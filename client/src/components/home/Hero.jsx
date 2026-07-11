import { FaArrowRight } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

export default function Hero() {
    return (
        <section className="bg-gradient-to-r from-indigo-50 via-white to-purple-60">
            <div className="max-w-7xl mx-auto px-6 py-24">
                <div className="grid lg:grid-cols-2 gap-10 items-center">
                    {/* Left */}
                    <div>
                        <span className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full text-sm font-semibold">
                            🚀 AI Powered Skill Exchange Platform
                        </span>

                        <h1 className="text-6xl font-extrabold text-gray-900 leading-tight mt-6">
                            Learn.
                            <br />
                            Teach.
                            <br />

                            <span className="text-indigo-600">
                                Grow Together.
                            </span>
                        </h1>

                        <p className="text-gray-500 text-lg mt-6 leading-8">
                            Discover amazing people, exchange skills,
                            build your portfolio and grow your career
                            through collaborative learning.
                        </p>

                        {/* Search */}
                        <div className="mt-8 flex">
                            <div className="flex items-center bg-white rounded-xl shadow-lg px-5 w-full max-w-lg">
                                <FiSearch className="text-gray-400 text-xl" />
                                <input
                                    type="text"
                                    placeholder="Search Skills..."
                                    className="w-full p-4 outline-none"
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="mt-8 flex gap-5">
                            <button className="bg-indigo-600 text-white px-7 py-3 rounded-xl hover:bg-indigo-700 duration-300">
                                Get Started
                            </button>

                            <button className="border border-indigo-600 text-indigo-600 px-7 py-3 rounded-xl hover:bg-indigo-50 duration-300 flex items-center gap-2">
                                Browse Skills
                                <FaArrowRight />
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-10 mt-12">
                            <div>
                                <h2 className="text-3xl font-bold text-indigo-600">
                                    1500+
                                </h2>
                                <p className="text-gray-500">
                                    Skills
                                </p>
                            </div>

                            <div>
                                <h2 className="text-3xl font-bold text-indigo-600">
                                    5000+
                                </h2>
                                <p className="text-gray-500">
                                    Learners
                                </p>
                            </div>

                            <div>
                                <h2 className="text-3xl font-bold text-indigo-600">
                                    1200+
                                </h2>
                                <p className="text-gray-500">
                                    Skill Swaps
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right */}
                    <div className="flex justify-center">
                        <img
                            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=700"
                            alt="Hero"
                            className="rounded-3xl shadow-2xl"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}