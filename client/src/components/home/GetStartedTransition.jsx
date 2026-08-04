import { useEffect, useRef, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";

const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
};

export default function FloatingGetStarted() {
    const triggerRef = useRef(null);

    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let animationFrame;

        const updateCTA = () => {
            if (!triggerRef.current) return;

            const rect = triggerRef.current.getBoundingClientRect();

            /*
             * CTA tab show hogi jab Hero ke baad wala trigger
             * viewport ke bottom ke paas aa jayega.
             */
            const showPoint = window.innerHeight * 0.95;

            setIsVisible(rect.top < showPoint);

            /*
             * Expansion:
             * Pehle sirf Get Started button.
             * Scroll karte hue left side open hogi.
             */
            const animationStart = window.innerHeight * 0.85;
            const animationEnd = window.innerHeight * 0.45;

            const rawProgress =
                (animationStart - rect.top) /
                (animationStart - animationEnd);

            setProgress(clamp(rawProgress, 0, 1));
        };

        const handleScroll = () => {
            cancelAnimationFrame(animationFrame);
            animationFrame = requestAnimationFrame(updateCTA);
        };

        updateCTA();

        window.addEventListener("scroll", handleScroll, {
            passive: true,
        });

        window.addEventListener("resize", handleScroll);

        return () => {
            cancelAnimationFrame(animationFrame);
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, []);

    return (
        <>
            {/* Ye invisible trigger Hero ke immediately baad rahega */}
            <div
                ref={triggerRef}
                aria-hidden="true"
                className="h-px w-full"
            />

            {/* Floating CTA */}
            <div
                className={`
          pointer-events-none
          fixed bottom-5 left-1/2 z-[100]
          -translate-x-1/2
          transition-all duration-500 ease-out

          ${isVisible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-20 opacity-0"
                    }
        `}
            >
                <div
                    className="
            pointer-events-auto
            flex h-[68px] items-center justify-end
            overflow-hidden rounded-full
            border border-slate-200
            bg-[#ececec]
            p-[6px]
            shadow-[0_18px_50px_rgba(15,23,42,0.22)]
          "
                    style={{
                        /*
                         * Desktop width:
                         * 182px → 450px
                         *
                         * Mobile par max viewport ke andar rahegi.
                         */
                        width: `min(
              calc(182px + ${progress} * 268px),
              calc(100vw - 24px)
            )`,
                    }}
                >
                    {/* Left text — scroll ke saath reveal */}
                    <div
                        className="
              flex min-w-0 flex-1 items-center
              overflow-hidden whitespace-nowrap
              pl-6 text-slate-900
            "
                        style={{
                            opacity: progress,
                            transform: `translateX(${(1 - progress) * 24}px)`,
                        }}
                    >
                        <span className="text-sm font-medium sm:text-base">
                            Ready when you are
                        </span>
                    </div>

                    {/* Button pehle se visible rahega */}
                    <Link
                        to="/register"
                        className="
              group flex h-full shrink-0
              items-center justify-center gap-4
              rounded-full bg-blue-600
              px-7  text-white
              transition-colors duration-300
              hover:bg-blue-700
              sm:px-9
             font-bold"
                    >
                        Get Started

                        <FaArrowRight
                            className="animate-arrow-move text-sm"
                        />
                    </Link>
                </div>
            </div>
        </>
    );
}