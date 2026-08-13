import { useState, useRef, useEffect } from "react";

export default function CustomSelect({
    value,
    onChange,
    options = [],
    placeholder = "Select...",
    className = "",
    buttonClassName = "",
    label = "",
    align = "right"
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Normalize options array to objects with value and label
    const normalizedOptions = options.map((opt) => {
        if (typeof opt === "string" || typeof opt === "number") {
            return { value: opt, label: String(opt) };
        }
        return {
            value: opt.value !== undefined ? opt.value : opt.id || opt.key || opt.label,
            label: opt.label || opt.name || opt.title || String(opt.value)
        };
    });

    const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value)) || normalizedOptions[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (val) => {
        if (typeof onChange === "function") {
            // Pass synthetic event format for drop-in select replacement if expected
            onChange({
                target: { value: val }
            });
        }
        setIsOpen(false);
    };

    return (
        <div className={`relative inline-block ${className}`} ref={dropdownRef}>
            {label && (
                <span className="mb-1.5 block text-xs font-medium text-white/60">
                    {label}
                </span>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between gap-3 min-w-[140px] sm:min-w-[160px] rounded-xl border border-orange-500/80 bg-[#0d0e15] px-3.5 py-2 text-xs sm:text-sm font-semibold text-white outline-none transition-all duration-200 hover:border-orange-500 hover:bg-white/[0.02] focus:border-orange-500 shadow-sm ${buttonClassName}`}
            >
                <span className="truncate">{selectedOption?.label || placeholder}</span>
                <svg
                    className={`h-4 w-4 shrink-0 text-white/60 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-orange-500" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <ul className={`absolute z-50 mt-2 max-h-60 min-w-[220px] sm:min-w-[250px] w-max max-w-[340px] overflow-y-auto rounded-xl border border-white/10 bg-[#111218] p-1.5 shadow-2xl shadow-black/90 backdrop-blur-xl custom-scrollbar animate-in fade-in zoom-in-95 duration-100 ${
                    align === "left" ? "left-0" : "right-0"
                }`}>
                    {normalizedOptions.map((option) => {
                        const isSelected = String(option.value) === String(value);
                        return (
                            <li key={String(option.value)}>
                                <button
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={`flex w-full items-center rounded-lg px-3.5 py-2.5 text-left text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 hover:bg-orange-500/10 hover:text-orange-400 ${
                                        isSelected
                                            ? "bg-orange-500/10 text-orange-400 font-bold"
                                            : "text-white/80"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
