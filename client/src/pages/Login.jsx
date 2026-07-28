import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000/api/auth";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
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

    async function handleSubmit(event) {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            await login({
                email: formData.email
                    .trim()
                    .toLowerCase(),
                password: formData.password,
            });

            navigate("/dashboard", {
                replace: true,
            });
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#07080D] px-4 py-10 text-white">
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
                <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0E0F14] shadow-2xl lg:grid-cols-2">
                    <section className="hidden flex-col justify-between border-r border-white/10 bg-[#0A0B10] p-12 lg:flex">
                        <Link to="/" className="text-2xl font-bold">
                            SkillSwap
                            <span className="text-orange-500"> AI</span>
                        </Link>

                        <div>
                            <p className="mb-5 inline-flex rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-400">
                                Welcome back
                            </p>

                            <h1 className="max-w-md text-5xl font-semibold leading-tight">
                                Continue learning, teaching and growing.
                            </h1>

                            <p className="mt-6 max-w-md text-lg leading-8 text-white/60">
                                Sign in to access your dashboard, recommendations,
                                mentors and skill exchanges.
                            </p>
                        </div>

                        <p className="text-sm text-white/40">
                            © {new Date().getFullYear()} SkillSwap AI
                        </p>
                    </section>

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
                                Sign in
                            </p>

                            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                                Welcome back
                            </h2>

                            <p className="mt-3 text-white/55">
                                Enter your account details to continue.
                            </p>

                            {error && (
                                <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                    {error}
                                </div>
                            )}

                            <form
                                onSubmit={handleSubmit}
                                className="mt-8 space-y-5"
                            >
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
                                            autoComplete="current-password"
                                            placeholder="Enter your password"
                                            className="w-full rounded-xl border border-white/10 bg-[#15161C] px-4 py-3.5 pr-20 text-white outline-none transition placeholder:text-white/30 focus:border-orange-500"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((previous) => !previous)
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white/50 hover:text-orange-400"
                                        >
                                            {showPassword ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-xl bg-orange-500 px-5 py-3.5 font-semibold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? "Signing in..." : "Sign in"}
                                </button>
                            </form>

                            <p className="mt-7 text-center text-sm text-white/55">
                                Don&apos;t have an account?{" "}
                                <Link
                                    to="/register"
                                    className="font-semibold text-orange-500 hover:text-orange-400"
                                >
                                    Create account
                                </Link>
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}