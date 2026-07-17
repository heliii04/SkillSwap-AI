import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <main className="min-h-screen bg-[#07080D] px-6 py-10 text-white">
            <div className="mx-auto max-w-6xl">
                <header className="flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
                            Dashboard
                        </p>

                        <h1 className="mt-2 text-3xl font-semibold">
                            Welcome, {user?.name || "User"}
                        </h1>

                        <p className="mt-2 text-white/50">
                            {user?.email || "No email available"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-xl border border-white/10 px-5 py-3 font-medium transition hover:border-orange-500 hover:text-orange-400"
                    >
                        Logout
                    </button>
                </header>

                <section className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <DashboardCard
                        title="Skills I Teach"
                        description="Add and manage the skills you can teach."
                    />

                    <DashboardCard
                        title="Skills I Want"
                        description="Manage the skills you want to learn."
                    />

                    <DashboardCard
                        title="AI Recommendations"
                        description="Discover personalised skill recommendations."
                    />

                    <DashboardCard
                        title="Mentors"
                        description="Find mentors based on your learning goals."
                    />

                    <DashboardCard
                        title="Requests"
                        description="View incoming and outgoing skill requests."
                    />

                    <DashboardCard
                        title="Messages"
                        description="Continue conversations with learners and mentors."
                    />
                </section>
            </div>
        </main>
    );
}

function DashboardCard({ title, description }) {
    return (
        <article className="rounded-2xl border border-white/10 bg-[#111218] p-6 transition hover:-translate-y-1 hover:border-orange-500/50">
            <div className="mb-5 h-11 w-11 rounded-xl bg-orange-500" />

            <h2 className="text-xl font-semibold">{title}</h2>

            <p className="mt-3 leading-7 text-white/50">
                {description}
            </p>

            <button
                type="button"
                className="mt-6 text-sm font-semibold text-orange-500 hover:text-orange-400"
            >
                Explore →
            </button>
        </article>
    );
}