import MentorCard from "../cards/MentorCard";

const mentors = [
    {
        name: "Sarah Wilson",
        role: "UI / UX Designer",
        rating: "4.9",
        students: "1.2k Students",
        sessions: "320 Sessions",
        skills: ["Figma", "Adobe XD", "UX Research"],
        image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
        name: "Alex Johnson",
        role: "Full Stack Developer",
        rating: "4.8",
        students: "980 Students",
        sessions: "280 Sessions",
        skills: ["React", "Node.js", "MongoDB"],
        image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
        name: "Emma Davis",
        role: "AI Engineer",
        rating: "5.0",
        students: "870 Students",
        sessions: "240 Sessions",
        skills: ["Python", "TensorFlow", "Machine Learning"],
        image: "https://randomuser.me/api/portraits/women/68.jpg",
    },
];

export default function FeaturedMentors() {
    return (
        <section className="bg-[#0C0D13] py-24">
            <div
                className="
          mx-auto w-full max-w-[1500px]
          px-5
          sm:px-8
          lg:px-12
          xl:px-16
        "
            >
                {/* Heading */}
                <div className="mx-auto max-w-4xl text-center">
                    <span
                        className="
              inline-flex
              rounded-full
              border border-white/10
              bg-[#111218]
              px-4 py-2
              text-xs font-semibold
              uppercase tracking-[0.22em]
              text-orange-400
            "
                    >
                        Featured Mentors
                    </span>

                    <h2
                        className="
              mt-6
              text-4xl font-semibold
              tracking-tight text-white
              sm:text-5xl
              lg:text-6xl
            "
                    >
                        Learn from industry experts
                    </h2>

                    <p
                        className="
              mx-auto mt-6
              max-w-2xl
              text-base leading-8
              text-white/45
              sm:text-lg
            "
                    >
                        Connect with experienced mentors who can guide you with
                        practical knowledge, real projects and personalized support.
                    </p>
                </div>

                {/* Mentor Cards */}
                <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {mentors.map((mentor) => (
                        <MentorCard
                            key={mentor.name}
                            {...mentor}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}