import { useEffect, useMemo, useState } from "react";
import {
    FaArrowLeft,
    FaArrowRight,
    FaQuoteLeft,
    FaStar,
} from "react-icons/fa";

const testimonials = [
    {
        id: 1,
        name: "Aarav Sharma",
        role: "Frontend Developer",
        image: "https://i.pravatar.cc/150?img=11",
        rating: 5,
        review:
            "SkillSwap AI helped me find the right React mentor. The platform feels simple, professional and genuinely useful for learning faster.",
    },
    {
        id: 2,
        name: "Priya Patel",
        role: "UI / UX Designer",
        image: "https://i.pravatar.cc/150?img=32",
        rating: 5,
        review:
            "The mentor recommendations were surprisingly accurate. I connected with a designer who helped me improve my portfolio and design process.",
    },
    {
        id: 3,
        name: "Rahul Verma",
        role: "Data Science Student",
        image: "https://i.pravatar.cc/150?img=15",
        rating: 5,
        review:
            "I exchanged my Python knowledge for machine learning guidance. The idea of learning through skill exchange makes this platform different.",
    },
    {
        id: 4,
        name: "Neha Kapoor",
        role: "Backend Developer",
        image: "https://i.pravatar.cc/150?img=47",
        rating: 5,
        review:
            "I found a Node.js mentor who explained backend concepts through real projects. The learning experience felt practical and personalized.",
    },
];

export default function Testimonials() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visibleCards, setVisibleCards] = useState(3);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const updateVisibleCards = () => {
            if (window.innerWidth < 768) {
                setVisibleCards(1);
            } else if (window.innerWidth < 1024) {
                setVisibleCards(2);
            } else {
                setVisibleCards(3);
            }
        };

        updateVisibleCards();

        window.addEventListener("resize", updateVisibleCards);

        return () => {
            window.removeEventListener("resize", updateVisibleCards);
        };
    }, []);

    const maximumIndex = useMemo(() => {
        return Math.max(testimonials.length - visibleCards, 0);
    }, [visibleCards]);

    useEffect(() => {
        setCurrentIndex((previousIndex) =>
            Math.min(previousIndex, maximumIndex)
        );
    }, [maximumIndex]);

    useEffect(() => {
        if (isPaused || maximumIndex === 0) {
            return undefined;
        }

        const interval = window.setInterval(() => {
            setCurrentIndex((previousIndex) =>
                previousIndex >= maximumIndex
                    ? 0
                    : previousIndex + 1
            );
        }, 4000);

        return () => {
            window.clearInterval(interval);
        };
    }, [isPaused, maximumIndex]);

    const goToPrevious = () => {
        setCurrentIndex((previousIndex) =>
            previousIndex <= 0
                ? maximumIndex
                : previousIndex - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((previousIndex) =>
            previousIndex >= maximumIndex
                ? 0
                : previousIndex + 1
        );
    };

    const cardWidth = 100 / visibleCards;

    return (
        <section className="overflow-hidden bg-[#07080D] py-24">
            <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8 lg:px-12 xl:px-16">

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
                        Success Stories
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
                        What our learners say
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
                        Real experiences from learners and mentors who are growing
                        through meaningful skill exchanges.
                    </p>
                </div>

                {/* Slider */}
                <div
                    className="
            mt-14
            overflow-hidden
            px-0
            py-4
          "
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div
                        className="
              flex
              transition-transform
              duration-700
              ease-[cubic-bezier(0.22,1,0.36,1)]
            "
                        style={{
                            transform: `translateX(-${currentIndex * cardWidth
                                }%)`,
                        }}
                    >
                        {testimonials.map((testimonial) => (
                            <div
                                key={testimonial.id}
                                className="shrink-0 px-2 sm:px-3"
                                style={{
                                    width: `${cardWidth}%`,
                                }}
                            >
                                <article
                                    className="
                    group
                    flex h-full min-h-[410px]
                    flex-col
                    rounded-[28px]
                    border border-white/10
                    bg-[#12131A]
                    p-7
                    transition-all duration-500
                    hover:-translate-y-2
                    hover:border-orange-500/50
                    hover:bg-[#171820]
                  "
                                >
                                    {/* Top */}
                                    <div className="flex items-start justify-between">
                                        <div
                                            className="
                        flex h-12 w-12
                        items-center justify-center
                        rounded-2xl
                        bg-orange-500
                        text-lg text-white
                        transition-transform duration-500
                        group-hover:rotate-6
                        group-hover:scale-105
                      "
                                        >
                                            <FaQuoteLeft />
                                        </div>

                                        <span
                                            className="
                        text-xs font-medium
                        uppercase tracking-[0.18em]
                        text-white/25
                      "
                                        >
                                            Review{" "}
                                            {String(testimonial.id).padStart(2, "0")}
                                        </span>
                                    </div>

                                    {/* Stars */}
                                    <div className="mt-6 flex gap-1 text-orange-400">
                                        {Array.from(
                                            { length: testimonial.rating },
                                            (_, index) => (
                                                <FaStar key={index} />
                                            )
                                        )}
                                    </div>

                                    {/* Review */}
                                    <p className="mt-6 flex-1 text-base leading-8 text-white/55">
                                        “{testimonial.review}”
                                    </p>

                                    {/* User */}
                                    <div
                                        className="
                      mt-8 flex items-center gap-4
                      border-t border-white/10
                      pt-6
                    "
                                    >
                                        <img
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            className="
                        h-14 w-14
                        rounded-full
                        border border-white/10
                        object-cover grayscale
                        transition duration-500
                        group-hover:grayscale-0
                      "
                                        />

                                        <div className="min-w-0">
                                            <h3
                                                className="
                          font-semibold text-white
                          transition-colors duration-300
                          group-hover:text-orange-400
                        "
                                            >
                                                {testimonial.name}
                                            </h3>

                                            <p className="mt-1 text-sm text-white/35">
                                                {testimonial.role}
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Controls */}
                <div className="mt-6 flex items-center justify-between">

                    {/* Progress Dots */}
                    <div className="flex items-center gap-2">
                        {Array.from(
                            { length: maximumIndex + 1 },
                            (_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setCurrentIndex(index)}
                                    aria-label={`Go to testimonial group ${index + 1
                                        }`}
                                    className={`
                    h-2 rounded-full
                    transition-all duration-300

                    ${currentIndex === index
                                            ? "w-8 bg-orange-500"
                                            : "w-2 bg-white/20 hover:bg-white/40"
                                        }
                  `}
                                />
                            )
                        )}
                    </div>

                    {/* Mobile Controls */}
                    <div className="flex items-center gap-3 md:hidden">
                        <button
                            type="button"
                            onClick={goToPrevious}
                            aria-label="Show previous testimonial"
                            className="
                flex h-11 w-11
                items-center justify-center
                rounded-full
                border border-white/15
                bg-[#111218]
                text-white
                transition
                hover:border-orange-500
                hover:bg-orange-500
              "
                        >
                            <FaArrowLeft />
                        </button>

                        <button
                            type="button"
                            onClick={goToNext}
                            aria-label="Show next testimonial"
                            className="
                flex h-11 w-11
                items-center justify-center
                rounded-full
                border border-white/15
                bg-[#111218]
                text-white
                transition
                hover:border-orange-500
                hover:bg-orange-500
              "
                        >
                            <FaArrowRight />
                        </button>
                    </div>

                    {/* Desktop Counter */}
                    <p
                        className="
              hidden
              text-xs uppercase
              tracking-[0.2em]
              text-white/25
              md:block
            "
                    >
                        {String(currentIndex + 1).padStart(2, "0")}
                        {" / "}
                        {String(maximumIndex + 1).padStart(2, "0")}
                    </p>
                </div>

            </div>
        </section>
    );
}