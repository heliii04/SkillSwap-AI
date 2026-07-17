export default function Button({
    children,
    variant = "primary",
    type = "button",
    onClick,
    className = "",
}) {
    const base =
        "px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center";

    const styles = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700",
        secondary:
            "bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white",
        danger: "bg-red-500 text-white hover:bg-red-600",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            className={`${base} ${styles[variant]} ${className}`}
        >
            {children}
        </button>
    );
}