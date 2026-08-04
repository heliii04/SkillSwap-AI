import { FaArrowRight } from "react-icons/fa";

export default function CategoryCard({
    icon,
    title,
    skills,
}) {
    return (
        <article
            className="
        group
        min-w-[270px]
        flex-shrink-0
        rounded-[28px]
        border border-white/10
        bg-[#12131A]
        p-6
        shadow-[0_20px_60px_rgba(0,0,0,0.28)]
        transition-all
        duration-300
        hover:-translate-y-2
        hover:border-orange-400/30
        hover:shadow-[0_24px_70px_rgba(0,0,0,0.35)]
      "
        >
            {/* Icon */}
            <div
                className="
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-orange-500
          text-2xl
          text-white
        "
            >
                {icon}
            </div>

            {/* Title */}
            <h3 className="mt-6 text-xl font-semibold text-white">
                {title}
            </h3>

            {/* Skills Count */}
            <p className="mt-2 text-sm text-white/40">
                {skills}+ available skills
            </p>

            {/* Explore Button */}
            <button
                type="button"
                className="
          mt-6
          flex
          items-center
          gap-2
          text-sm
          
          text-orange-400
          transition-all
          duration-300
          group-hover:gap-4
         font-bold"
            >
                Explore
                <FaArrowRight className="animate-arrow-move"  />
            </button>
        </article>
    );
}