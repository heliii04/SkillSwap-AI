export default function StatsSection() {
    const stats = [
        {
            value: "5K+",
            label: "Active Learners",
        },
        {
            value: "700+",
            label: "Verified Mentors",
        },
        {
            value: "12K+",
            label: "Skill Exchanges",
        },
    ];

    return (
        <section className="bg-[#07080D] px-5 py-10 sm:px-8 lg:px-12">
            <div className="w-full">
                <div
                    className="
            grid
            overflow-hidden
            rounded-[28px]
            border border-white/10
            bg-[#0E0F15]
            sm:grid-cols-3
          "
                >
                    {stats.map((stat, index) => (
                        <div
                            key={stat.label}
                            className={`
                relative
                flex min-h-[145px]
                flex-col
                items-center
                justify-center
                px-6 py-8
                text-center
                ${index !== stats.length - 1
                                    ? "border-b border-white/10 sm:border-b-0 sm:border-r"
                                    : ""
                                }
              `}
                        >
                            <h3 className="text-3xl font-bold tracking-tight text-orange-500 sm:text-4xl">
                                {stat.value}
                            </h3>

                            <p className="mt-3 text-sm font-medium tracking-wide text-white/45 sm:text-base">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}