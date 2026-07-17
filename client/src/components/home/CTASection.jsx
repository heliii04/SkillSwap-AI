import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

export default function CTASection() {
    return (
        <section>

            <div className="w-full px-6 lg:px-8">

                <div
                    className="
    w-full
    px-8
    py-16
    text-center
    lg:px-20
  "
                >

                    {/* Small Badge */}

                    <span
                        className="
              inline-flex
              rounded-full
              border border-white/10
              bg-[#18191F]
              px-4 py-2
              text-xs
              font-semibold
              uppercase
              tracking-[0.22em]
              text-orange-400
            "
                    >
                        Ready to Learn?
                    </span>

                    {/* Heading */}

                    <h2
                        className="
              mx-auto mt-7
              max-w-4xl
              text-4xl
              font-semibold
              leading-tight
              text-white
              sm:text-5xl
              lg:text-6xl
            "
                    >
                        Start your learning journey
                        <br />

                        with
                        <span className="text-orange-500">
                            {" "}
                            SkillSwap AI
                        </span>
                    </h2>

                    {/* Description */}

                    <p
                        className="
              mx-auto mt-6
              max-w-2xl
              text-lg
              leading-8
              text-white/45
            "
                    >
                        Discover mentors, exchange knowledge and build real-world
                        skills through our AI-powered learning platform.
                    </p>

                    {/* Buttons */}

                    <div
                        className="
              mt-10
              flex
              flex-col
              items-center
              justify-center
              gap-5
              sm:flex-row
            "
                    >
                        <Link
                            to="/contact"
                            className="
                group
                inline-flex
                items-center
                gap-3
                rounded-full
                border
                border-white/10
                bg-[#18191F]
                px-8 py-4
                font-semibold
                text-white
                transition-all
                duration-300
                hover:border-orange-500
                hover:text-orange-400
              "
                        >
                            Contact Us

                            <FaArrowRight
                                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
                            />
                        </Link>

                    </div>



                </div>

            </div>

        </section>
    );
}