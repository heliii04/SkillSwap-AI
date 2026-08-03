export default function MatchBadge({ value }) {
    if (value == null) return null;

    const style =
        value >= 90
            ? "border-green-500/25 bg-green-500/10 text-green-300"
            : value >= 80
                ? "border-orange-500/25 bg-orange-500/10 text-orange-300"
                : "border-white/10 bg-white/[0.03] text-white/45";

    return (
        <span
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${style}`}
        >
            {value}% match
        </span>
    );
}

