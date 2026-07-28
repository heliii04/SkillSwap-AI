import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

export default function Hero() {
    return (
        <section
            className="
        relative flex min-h-[80vh] w-full
        items-center overflow-hidden
        bg-[#07080D]
        pt-32 pb-20
      "
        >
            {/* Subtle background grid */}
            <div
                className="
          pointer-events-none absolute inset-0
          opacity-[0.08]
          [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)]
          [background-size:60px_60px]
        "
            />

            <div
                className="
          relative z-10 mx-auto
          w-full max-w-[1500px]
          px-5 pb-10 pt-10
          text-center
          sm:px-8
          lg:px-12
          xl:px-16
        "
            >
                {/* Badge */}
                <div
                    className="
            mx-auto inline-flex items-center gap-2
            rounded-full
            border border-white/10
            bg-[#111218]
            px-4 py-2
            text-xs font-semibold
            uppercase tracking-[0.2em]
            text-orange-400
            sm:text-sm
          "
                >
                    <HiSparkles className="text-orange-400" />

                    AI-powered skill exchange
                </div>

                {/* Heading */}
                <h1
                    className="
            mx-auto mt-7 max-w-5xl
            text-5xl font-semibold
            leading-[0.98] tracking-[-0.04em]
            text-white
            sm:text-6xl
            lg:text-7xl
            xl:text-[88px]
          "
                >
                    Exchange skills.
                    <br />

                    <span className="text-orange-500">
                        Powered by AI.
                    </span>
                </h1>

                {/* Description */}
                <p
                    className="
            mx-auto mt-6 max-w-2xl
            text-base leading-7
            text-white/55
            sm:text-lg
          "
                >
                    Connect with the right mentors, exchange knowledge and receive
                    intelligent skill recommendations designed around your goals.
                </p>

                {/* Buttons */}
                <div
                    className="
            mt-8 flex flex-col
            items-center justify-center gap-4
            sm:flex-row
          "
                >
                    <Link
                        to="/browse-skills"
                        className="
              group flex min-w-[180px]
              items-center justify-center gap-3
              rounded-full
              border border-white/15
              bg-[#111218]
              px-7 py-4
              font-semibold text-white
              transition-all duration-300
              hover:border-orange-400/50
              hover:bg-[#171820]
            "
                    >
                        Explore Skills

                        <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>

                    <Link
                        to="/register"
                        className="
              group flex min-w-[180px]
              items-center justify-center gap-3
              rounded-full
              bg-orange-500
              px-7 py-4
              font-semibold text-white
              transition-all duration-300
              hover:-translate-y-1
              hover:bg-orange-400
            "
                    >
                        Get Started

                        <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
}