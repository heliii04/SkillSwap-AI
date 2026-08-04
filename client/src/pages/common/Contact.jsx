import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
    FiArrowRight,
    FiCheckCircle,
    FiClock,
    FiMail,
    FiMapPin,
    FiMessageCircle,
    FiPhone,
    FiSend,
    FiUser,
} from "react-icons/fi";
import axiosClient from "../../api/axiosClient";

const contactMethods = [
    {
        icon: FiMail,
        title: "Email Us",
        value: "support@skillswap.ai",
        description: "Send us an email anytime.",
    },
    {
        icon: FiPhone,
        title: "Call Us",
        value: "+91 98765 43210",
        description: "Monday to Saturday, 10 AM to 6 PM.",
    },
    {
        icon: FiMapPin,
        title: "Location",
        value: "Ahmedabad, Gujarat",
        description: "Building SkillSwap AI from India.",
    },
    {
        icon: FiClock,
        title: "Support Hours",
        value: "10:00 AM – 6:00 PM",
        description: "Monday to Saturday.",
    },
];

const faqItems = [
    {
        question: "How can I report a problem?",
        answer:
            "Select the Technical Support option in the contact form and describe the issue clearly. Include the page name and any error message you received.",
    },
    {
        question: "How long does support take to respond?",
        answer:
            "Support requests are generally reviewed within one to two business days. Urgent account or security issues should be mentioned clearly in the message.",
    },
    {
        question: "Can I suggest a new feature?",
        answer:
            "Yes. Select Feature Suggestion in the form and explain what you would like to see added to SkillSwap AI.",
    },
    {
        question: "Can I contact a skill partner through this page?",
        answer:
            "No. This page is for platform support. Use the messaging feature to communicate directly with a skill partner.",
    },
];

const initialForm = {
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
};

export default function Contact() {
    const [formData, setFormData] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((currentErrors) => ({
                ...currentErrors,
                [name]: "",
            }));
        }

        if (submitted) {
            setSubmitted(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required.";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
        ) {
            newErrors.email = "Enter a valid email address.";
        }

        if (!formData.subject.trim()) {
            newErrors.subject = "Subject is required.";
        }

        if (!formData.category) {
            newErrors.category = "Please select a category.";
        }

        if (!formData.message.trim()) {
            newErrors.message = "Message is required.";
        } else if (formData.message.trim().length < 20) {
            newErrors.message =
                "Message should contain at least 20 characters.";
        }

        return newErrors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setSubmitError("");
        setSubmitted(false);

        try {
            await axiosClient.post("/contact", formData);
            setSubmitted(true);
            setErrors({});
            setFormData(initialForm);
        } catch (error) {
            console.error("Contact form submit error:", error);
            setSubmitError(
                error.response?.data?.message ||
                "Failed to send message. Please try again later."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen overflow-hidden bg-[#07080d] text-white">
            {/* Hero Section */}
            <section className="relative border-b border-white/10">


                <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 30,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            duration: 0.7,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="mx-auto max-w-4xl text-center"
                    >
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-200">
                            <FiMessageCircle />
                            We are here to help
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
                            Get in
                            <span className="ml-3 text-orange-500">
                                touch
                            </span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-gray-400 sm:text-lg">
                            Have a question, suggestion or technical issue?
                            Send us a message and the SkillSwap AI team will
                            help you.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Methods */}
            <section className="border-b border-white/10 bg-white/[0.015]">
                <div className="mx-auto grid max-w-7xl gap-5 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
                    {contactMethods.map((method) => {
                        const Icon = method.icon;

                        return (
                            <article
                                key={method.title}
                                className="group rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:bg-orange-500/[0.04]"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-xl text-orange-400">
                                    <Icon />
                                </div>

                                <h2 className="mt-5 font-semibold">
                                    {method.title}
                                </h2>

                                <p className="mt-2 text-sm font-medium text-orange-300">
                                    {method.value}
                                </p>

                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    {method.description}
                                </p>
                            </article>
                        );
                    })}
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="relative py-20 lg:py-28">


                <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
                    {/* Left Content */}
                    <div>
                        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
                            Contact Support
                        </span>

                        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                            Tell us how we
                            <span className="block text-orange-500">
                                can help you
                            </span>
                        </h2>

                        <p className="mt-6 max-w-xl leading-8 text-gray-400">
                            Provide complete information about your question or
                            issue. This helps us understand the situation and
                            respond more effectively.
                        </p>

                        <div className="mt-9 space-y-5">
                            <SupportPoint
                                title="Account Support"
                                description="Help with login, verification, profile and account-related issues."
                            />

                            <SupportPoint
                                title="Technical Support"
                                description="Report application errors, broken pages or unexpected behaviour."
                            />

                            <SupportPoint
                                title="Feature Suggestions"
                                description="Share ideas that can improve the SkillSwap AI experience."
                            />

                            <SupportPoint
                                title="Safety and Reporting"
                                description="Report inappropriate profiles, messages or suspicious activity."
                            />
                        </div>

                        <div className="mt-10 rounded-3xl border border-orange-400/15 bg-orange-500/[0.06] p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-xl text-orange-400">
                                    <FiClock />
                                </div>

                                <div>
                                    <h3 className="font-semibold">
                                        Expected response time
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-gray-400">
                                        We generally respond within one to two
                                        business days. Account security reports
                                        receive higher priority.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="rounded-[32px] border border-white/10 bg-[#0d0e15] p-5 shadow-2xl shadow-orange-950/10 sm:p-8">
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold">
                                Send us a message
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Fill out the form and provide complete details
                                about your request.
                            </p>
                        </div>

                        {submitted && (
                            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                                <FiCheckCircle className="mt-0.5 shrink-0 text-xl text-emerald-400" />

                                <div>
                                    <p className="text-sm font-semibold text-emerald-300">
                                        Message submitted successfully
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-gray-400">
                                        Your support ticket has been recorded. Our team will review it and reply soon.
                                    </p>
                                </div>
                            </div>
                        )}

                        {submitError && (
                            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                                <div className="text-xl text-red-400 shrink-0">⚠️</div>

                                <div>
                                    <p className="text-sm font-semibold text-red-300">
                                        Failed to send message
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-gray-400">
                                        {submitError}
                                    </p>
                                </div>
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            noValidate
                            className="space-y-5"
                        >
                            <div className="grid gap-5 sm:grid-cols-2">
                                <FormField
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                    error={errors.name}
                                    icon={FiUser}
                                />

                                <FormField
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    error={errors.email}
                                    icon={FiMail}
                                />
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <FormField
                                    label="Subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="Enter message subject"
                                    error={errors.subject}
                                    icon={FiMessageCircle}
                                />

                                <ContactSelect
                                    label="Support Category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    error={errors.category}
                                    options={[
                                        { value: "", label: "Select a category" },
                                        { value: "account", label: "Account Support" },
                                        { value: "technical", label: "Technical Support" },
                                        { value: "feature", label: "Feature Suggestion" },
                                        { value: "safety", label: "Safety and Reporting" },
                                        { value: "other", label: "Other" }
                                    ]}
                                />
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between gap-4">
                                    <label
                                        htmlFor="message"
                                        className="block text-sm font-medium text-gray-300"
                                    >
                                        Message
                                    </label>

                                    <span className="text-xs text-gray-600">
                                        {formData.message.length}/1000
                                    </span>
                                </div>

                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    maxLength={1000}
                                    rows={7}
                                    placeholder="Describe your question or issue in detail..."
                                    className={`w-full resize-none rounded-2xl border bg-white/[0.035] px-4 py-4 text-sm leading-6 text-white outline-none transition placeholder:text-gray-600 ${errors.message
                                            ? "border-red-500/60"
                                            : "border-white/10 focus:border-orange-500"
                                        }`}
                                />

                                {errors.message && (
                                    <p className="mt-2 text-xs text-red-400">
                                        {errors.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 text-sm  text-black shadow-lg shadow-orange-500/15 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                            >
                                {loading ? "Sending..." : "Send Message"}
                                <FiSend />
                            </button>

                            <p className="text-center text-xs leading-5 text-gray-600">
                                Do not include your password, OTP or other
                                sensitive account information.
                            </p>
                        </form>
                    </div>
                </div>
            </section>

        </main>
    );
}

function FormField({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
    error,
    icon: Icon,
}) {
    return (
        <div>
            <label
                htmlFor={name}
                className="mb-2 block text-sm font-medium text-gray-300"
            >
                {label}
            </label>

            <div className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />

                <input
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full rounded-xl border bg-white/[0.035] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 ${error
                            ? "border-red-500/60"
                            : "border-white/10 focus:border-orange-500"
                        }`}
                />
            </div>

            {error && (
                <p className="mt-2 text-xs text-red-400">{error}</p>
            )}
        </div>
    );
}

function SupportPoint({ title, description }) {
    return (
        <div className="flex items-start gap-4">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
                <FiCheckCircle />
            </div>

            <div>
                <h3 className="font-medium text-gray-200">{title}</h3>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                    {description}
                </p>
            </div>
        </div>
    );
}

function ContactSelect({
    label,
    name,
    value,
    onChange,
    error,
    options,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find((opt) => opt.value === value) || options[0];

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
        onChange({
            target: {
                name,
                value: val,
            },
        });
        setIsOpen(false);
    };

    return (
        <div className="relative block" ref={dropdownRef}>
            <span className="mb-2 block text-sm font-medium text-gray-300">
                {label}
            </span>

            <button className="font-bold"
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex w-full items-center justify-between rounded-xl border bg-white/[0.035] px-4 py-3.5 text-sm text-white outline-none transition duration-200 ${
                    error
                        ? "border-red-500/60"
                        : "border-white/10 hover:border-orange-500/50 focus:border-orange-500/60"
                }`}
            >
                <span className={value ? "text-white" : "text-gray-400"}>
                    {selectedOption?.label || ""}
                </span>
                <svg
                    className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-orange-500" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {isOpen && (
                <ul className="absolute left-0 z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-white/10 bg-[#111218] py-1.5 shadow-2xl shadow-black/80 backdrop-blur-xl">
                    {options.map((option) => {
                        const isSelected = option.value === value;
                        return (
                            <li key={option.value}>
                                <button className="font-bold"
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={`flex w-full items-center px-4 py-3 text-left text-sm transition duration-150 hover:bg-orange-500/10 hover:text-orange-400 ${
                                        isSelected
                                            ? "bg-orange-500/5 text-orange-400 font-semibold"
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

            {error && (
                <p className="mt-2 text-xs text-red-400">{error}</p>
            )}
        </div>
    );
}