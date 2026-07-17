import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000/api/auth";

export default function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));

        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const name = formData.name.trim();
        const email = formData.email.trim().toLowerCase();
        const password = formData.password;

        if (!name || !email || !password || !formData.confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (name.length < 2) {
            setError("Name must contain at least 2 characters.");
            return;
        }

        if (password.length < 6) {
            setError("Password must contain at least 6 characters.");
            return;
        }

        if (password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed.");
            }

            login(data.token, data.user);
            navigate("/dashboard", { replace: true });
        } catch (requestError) {
            setError(
                requestError.message ||
                "Unable to register. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#07080D] px-4 py-10 text-white">
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
                <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0E0F14] shadow-2xl lg:grid-cols-2">
                    {/* Left section */}
                    <section className="hidden flex-col justify-between border-r border-white/10 bg-[#0A0B10] p-12 lg:flex">
                        <Link
                            to="/"
                            className="text-2xl font-bold tracking-tight"
                        >
                            SkillSwap
                            <span className="text-orange-500"> AI</span>
                        </Link>

                        <div>
                            <p className="mb-5 inline-flex rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-400">
                                Learn. Teach. Grow.
                            </p>

                            <h1 className="max-w-md text-5xl font-semibold leading-tight">
                                Turn your skills into meaningful connections.
                            </h1>

                            <p className="mt-6 max-w-md text-lg leading-8 text-white/60">
                                Join learners and mentors, exchange knowledge and
                                discover opportunities powered by AI.
                            </p>
                        </div>

                        <p className="text-sm text-white/40">
                            © {new Date().getFullYear()} SkillSwap AI
                        </p>
                    </section>

                    {/* Register form */}
                    <section className="p-6 sm:p-10 lg:p-12">
                        <div className="mx-auto max-w-md">
                            <Link
                                to="/"
                                className="mb-10 inline-block text-xl font-bold lg:hidden"
                            >
                                SkillSwap
                                <span className="text-orange-500"> AI</span>
                            </Link>

                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
                                Create account
                            </p>

                            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                                Start your journey
                            </h2>

                            <p className="mt-3 text-white/55">
                                Enter your details to create your SkillSwap AI
                                account.
                            </p>

                            {error && (
                                <div
                                    role="alert"
                                    className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                                >
                                    {error}
                                </div>
                            )}

                            <form
                                onSubmit={handleSubmit}
                                className="mt-8 space-y-5"
                            >
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="mb-2 block text-sm font-medium text-white/80"
                                    >
                                        Full name
                                    </label>

                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        autoComplete="name"
                                        placeholder="Enter your full name"
                                        className="w-full rounded-xl border border-white/10 bg-[#15161C] px-4 py-3.5 text-white outline-none transition placeholder:text-white/30 focus:border-orange-500"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-sm font-medium text-white/80"
                                    >
                                        Email address
                                    </label>

                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        className="w-full rounded-xl border border-white/10 bg-[#15161C] px-4 py-3.5 text-white outline-none transition placeholder:text-white/30 focus:border-orange-500"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="password"
                                        className="mb-2 block text-sm font-medium text-white/80"
                                    >
                                        Password
                                    </label>

                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            autoComplete="new-password"
                                            placeholder="Minimum 6 characters"
                                            className="w-full rounded-xl border border-white/10 bg-[#15161C] px-4 py-3.5 pr-20 text-white outline-none transition placeholder:text-white/30 focus:border-orange-500"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((previousValue) => !previousValue)
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-white/50 transition hover:text-orange-400"
                                        >
                                            {showPassword ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="mb-2 block text-sm font-medium text-white/80"
                                    >
                                        Confirm password
                                    </label>

                                    <input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                        placeholder="Enter password again"
                                        className="w-full rounded-xl border border-white/10 bg-[#15161C] px-4 py-3.5 text-white outline-none transition placeholder:text-white/30 focus:border-orange-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-xl bg-orange-500 px-5 py-3.5 font-semibold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? "Creating account..." : "Create account"}
                                </button>
                            </form>

                            <p className="mt-7 text-center text-sm text-white/55">
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="font-semibold text-orange-500 transition hover:text-orange-400"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}