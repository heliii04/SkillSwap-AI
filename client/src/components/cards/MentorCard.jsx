import {
    FaArrowRight,
    FaComments,
    FaStar,
    FaUserGraduate,
} from "react-icons/fa";

export default function MentorCard({
    image,
    name,
    role,
    rating,
    students,
    sessions,
    skills,
}) {
    return (
        <article
            className="
        group
        overflow-hidden
        rounded-[30px]
        border border-white/10
        bg-[#12131A]
        transition-all duration-500
        hover:-translate-y-2
        hover:border-orange-500/50
        hover:bg-[#171820]
      "
        >
            {/* Image */}
            <div className="relative h-64 overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    className="
            h-full w-full
            object-cover
            grayscale
            transition-all duration-700
            group-hover:scale-105
            group-hover:grayscale-0
          "
                />

                <div className="absolute inset-0 bg-black/20" />

                {/* Rating */}
                <div
                    className="
            absolute right-4 top-4
            flex items-center gap-2
            rounded-full
            border border-white/10
            bg-[#0C0D13]/90
            px-4 py-2
            text-sm font-semibold
            text-white
            backdrop-blur-md
          "
                >
                    <FaStar className="text-orange-400" />
                    {rating}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <h3
                    className="
            text-2xl font-semibold
            text-white
            transition-colors duration-300
            group-hover:text-orange-400
          "
                >
                    {name}
                </h3>

                <p className="mt-2 font-medium text-orange-400">
                    {role}
                </p>

                {/* Skills */}
                <div className="mt-5 flex flex-wrap gap-2">
                    {skills.map((skill) => (
                        <span
                            key={skill}
                            className="
                rounded-full
                border border-white/10
                bg-[#0F1016]
                px-3 py-1.5
                text-xs text-white/50
                transition-all duration-300
                group-hover:border-white/20
                group-hover:text-white/70
              "
                        >
                            {skill}
                        </span>
                    ))}
                </div>

                {/* Stats */}
                <div
                    className="
            mt-6 flex items-center justify-between
            border-t border-white/10
            pt-5
            text-sm text-white/40
          "
                >
                    <div className="flex items-center gap-2">
                        <FaUserGraduate className="text-orange-400" />
                        {students}
                    </div>

                    <div className="flex items-center gap-2">
                        <FaComments className="text-orange-400" />
                        {sessions}
                    </div>
                </div>

                {/* Button */}
                <button
                    type="button"
                    className="
            group/button
            mt-6 flex w-full
            items-center justify-center gap-3
            rounded-full
            border border-white/10
            bg-[#0F1016]
            py-3.5
            font-semibold text-white
            transition-all duration-300
            hover:border-orange-500
            hover:bg-orange-500
          "
                >
                    View Profile

                    <FaArrowRight
                        className="
              transition-transform duration-300
              group-hover/button:translate-x-1
            "
                    />
                </button>
            </div>
        </article>
    );
}