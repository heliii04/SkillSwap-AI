import { useEffect, useRef, useState } from "react";
import CategoryCard from "../cards/CategoryCard";
import {
    FaLaptopCode,
    FaPaintBrush,
    FaRobot,
    FaBullhorn,
    FaCamera,
    FaLanguage,
    FaChartLine,
    FaMusic,
} from "react-icons/fa";

export default function Categories() {
    const sectionRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            {
                threshold: 0.3,
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const categories = [
        {
            icon: <FaLaptopCode />,
            title: "Web Development",
            skills: 120,
            color: "bg-indigo-600",
        },
        {
            icon: <FaPaintBrush />,
            title: "UI / UX Design",
            skills: 85,
            color: "bg-pink-500",
        },
        {
            icon: <FaRobot />,
            title: "AI & ML",
            skills: 64,
            color: "bg-purple-600",
        },
        {
            icon: <FaBullhorn />,
            title: "Marketing",
            skills: 52,
            color: "bg-orange-500",
        },
        {
            icon: <FaCamera />,
            title: "Photography",
            skills: 38,
            color: "bg-green-600",
        },
        {
            icon: <FaLanguage />,
            title: "Languages",
            skills: 45,
            color: "bg-blue-600",
        },
        {
            icon: <FaChartLine />,
            title: "Business",
            skills: 56,
            color: "bg-red-500",
        },
        {
            icon: <FaMusic />,
            title: "Music",
            skills: 27,
            color: "bg-teal-500",
        },
    ];

    return (


        <section ref={sectionRef} className="py-24 bg-[#07080d] overflow-hidden">
            <div className="w-full">

                <div className="max-w-7xl mx-auto px-6">

                    <div className="text-center" style={{ "margin-top": "-50px" }}>

                        <span
                            className="
              inline-flex rounded-full
              border border-orange-400/20
              bg-orange-400/10
              px-4 py-2
              text-xs font-semibold uppercase
              tracking-[0.22em] text-orange-300
            "
                        >
                            Explore Skills
                        </span>

                        <h2 className="mt-6 text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
                            Popular skill categories
                        </h2>

                        <p className="mx-auto mt-5 max-w-2xl leading-7 text-white/50">
                            Discover high-demand skills and connect with mentors who can
                            help you grow faster.
                        </p>

                    </div>

                </div>

                {/* Moving Cards */}

                <div className="overflow-hidden w-full">

                    <div
                        key={isVisible ? "start" : "stop"}
                        style={{ "margin-top": "50px" }}
                        className={`flex gap-6 w-max ${isVisible ? "animate-marquee" : ""
                            }`}
                    >

                        {[...categories, ...categories].map((item, index) => (

                            <CategoryCard
                                key={index}
                                {...item}
                            />

                        ))}

                    </div>

                </div>

            </div>

        </section>
    );
}