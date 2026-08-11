import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    HiOutlineBriefcase,
    HiOutlineCheckBadge,
    HiOutlineEnvelope,
    HiOutlineGlobeAlt,
    HiOutlineLink,
    HiOutlineMapPin,
    HiOutlinePencilSquare,
    HiOutlineUser,
    HiOutlineXMark,
} from "react-icons/hi2";

import {
    FaGithub,
    FaLinkedin,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { getAccessToken } from "../../api/tokenStore";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

const createEmptyProfile = () => ({
    name: "",
    headline: "",
    bio: "",

    location: {
        city: "",
        country: "",
    },

    socialLinks: {
        github: "",
        linkedin: "",
        portfolio: "",
    },
});

const normalizeProfile = (profile = {}) => ({
    name: profile.name || "",
    headline: profile.headline || "",
    bio: profile.bio || "",

    location: {
        city: profile.location?.city || "",
        country:
            profile.location?.country || "",
    },

    socialLinks: {
        github:
            profile.socialLinks?.github ||
            "",
        linkedin:
            profile.socialLinks?.linkedin ||
            "",
        portfolio:
            profile.socialLinks?.portfolio ||
            "",
    },
});

export default function MyProfile() {
    const {
        user,
        updateUser,
    } = useAuth();

    const [profile, setProfile] =
        useState(createEmptyProfile);

    const [
        originalProfile,
        setOriginalProfile,
    ] = useState(createEmptyProfile);

    const [profileData, setProfileData] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [editing, setEditing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const initials = useMemo(() => {
        const name =
            profile.name?.trim() ||
            user?.name?.trim() ||
            "User";

        return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) =>
                part.charAt(0).toUpperCase()
            )
            .join("");
    }, [profile.name, user?.name]);

    const loadProfile = useCallback(
        async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_URL}/profile/me`,
                    {
                        method: "GET",
                        credentials: "include",
                        headers: {
                            Accept: "application/json",
                            Authorization: `Bearer ${getAccessToken()}`,
                        },
                    }
                );

                const data =
                    await response
                        .json()
                        .catch(() => null);

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                        "Unable to load profile."
                    );
                }

                const receivedProfile =
                    data?.data?.user;

                if (!receivedProfile) {
                    throw new Error(
                        "Invalid profile response."
                    );
                }

                const normalized =
                    normalizeProfile(
                        receivedProfile
                    );

                setProfile(normalized);
                setOriginalProfile(
                    normalized
                );
                setProfileData(
                    receivedProfile
                );

                if (
                    typeof updateUser ===
                    "function"
                ) {
                    updateUser(
                        receivedProfile
                    );
                }
            } catch (requestError) {
                setError(
                    requestError.message ||
                    "Unable to load profile."
                );
            } finally {
                setLoading(false);
            }
        },
        [updateUser]
    );

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setError("");
        setSuccess("");

        if (
            name.startsWith(
                "location."
            )
        ) {
            const field =
                name.split(".")[1];

            setProfile((current) => ({
                ...current,
                location: {
                    ...current.location,
                    [field]: value,
                },
            }));

            return;
        }

        if (
            name.startsWith(
                "socialLinks."
            )
        ) {
            const field =
                name.split(".")[1];

            setProfile((current) => ({
                ...current,
                socialLinks: {
                    ...current.socialLinks,
                    [field]: value,
                },
            }));

            return;
        }

        setProfile((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleCancel = () => {
        setProfile(originalProfile);
        setEditing(false);
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        if (
            profile.name.trim().length < 2
        ) {
            setError(
                "Name must contain at least 2 characters."
            );

            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const requestBody = {
                name: profile.name.trim(),

                headline:
                    profile.headline.trim(),

                bio: profile.bio.trim(),

                location: {
                    city:
                        profile.location.city.trim(),

                    country:
                        profile.location.country.trim(),
                },

                socialLinks: {
                    github:
                        profile.socialLinks.github.trim(),

                    linkedin:
                        profile.socialLinks.linkedin.trim(),

                    portfolio:
                        profile.socialLinks.portfolio.trim(),
                },
            };

            const response = await fetch(
                `${API_URL}/profile/me`,
                {
                    method: "PATCH",
                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Accept: "application/json",
                        Authorization: `Bearer ${getAccessToken()}`,
                    },

                    body: JSON.stringify(
                        requestBody
                    ),
                }
            );

            const data =
                await response
                    .json()
                    .catch(() => null);

            if (!response.ok) {
                const validationMessage =
                    data?.errors
                        ?.map(
                            (item) =>
                                item.message
                        )
                        .filter(Boolean)
                        .join(", ");

                throw new Error(
                    validationMessage ||
                    data?.message ||
                    "Unable to update profile."
                );
            }

            const updatedProfile =
                data?.data?.user;

            if (!updatedProfile) {
                throw new Error(
                    "Invalid update response."
                );
            }

            const normalized =
                normalizeProfile(
                    updatedProfile
                );

            setProfile(normalized);

            setOriginalProfile(
                normalized
            );

            setProfileData(
                updatedProfile
            );

            if (
                typeof updateUser ===
                "function"
            ) {
                updateUser(
                    updatedProfile
                );
            }

            setEditing(false);

            setSuccess(
                "Profile updated successfully."
            );
        } catch (requestError) {
            setError(
                requestError.message ||
                "Unable to update profile."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4">
                <div className="flex flex-col items-center">
                    <div className="h-11 w-11 animate-spin rounded-full border-2 border-white/10 border-t-orange-500" />

                    <p className="mt-4 text-sm text-white/40">
                        Loading profile...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="px-4 pb-12 pt-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1500px]">
                <section className="relative overflow-hidden rounded-[28px] border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-[#111218] to-[#0d0e13] p-6 sm:p-8">
                    <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-orange-500/15 blur-3xl" />

                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">
                                Account profile
                            </p>

                            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
                                Build a profile that
                                attracts the right
                                people.
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/45">
                                Add your skills,
                                professional identity,
                                location and social
                                links to improve your
                                SkillSwap matches.
                            </p>
                        </div>

                        {!editing && (
                            <button 
                                type="button"
                                onClick={() => {
                                    setError("");
                                    setSuccess("");
                                    setEditing(
                                        true
                                    );
                                }}
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
                            >
                                <HiOutlinePencilSquare className="text-lg" />

                                Edit profile
                            </button>
                        )}
                    </div>
                </section>

                {error && (
                    <Alert
                        type="error"
                        message={error}
                        onClose={() =>
                            setError("")
                        }
                    />
                )}

                {success && (
                    <Alert
                        type="success"
                        message={success}
                        onClose={() =>
                            setSuccess("")
                        }
                    />
                )}

                <div className="mt-6 grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
                    <ProfileSummary
                        initials={initials}
                        profile={profile}
                        profileData={
                            profileData ||
                            user
                        }
                    />

                    <form
                        onSubmit={
                            handleSubmit
                        }
                        className="space-y-6"
                    >
                        <ProfileSection
                            title="Basic information"
                            description="Information visible across your SkillSwap account."
                            icon={
                                HiOutlineUser
                            }
                        >
                            <div className="grid gap-5 md:grid-cols-2">
                                <FormField
                                    label="Full name"
                                    name="name"
                                    value={
                                        profile.name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        !editing ||
                                        saving
                                    }
                                    placeholder="Enter your full name"
                                    maxLength={80}
                                />

                                <FormField
                                    label="Email address"
                                    value={
                                        profileData
                                            ?.email ||
                                        user?.email ||
                                        ""
                                    }
                                    disabled
                                    icon={
                                        HiOutlineEnvelope
                                    }
                                />
                            </div>

                            <FormField
                                label="Professional headline"
                                name="headline"
                                value={
                                    profile.headline
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    !editing ||
                                    saving
                                }
                                icon={
                                    HiOutlineBriefcase
                                }
                                placeholder="MERN Stack Developer and UI Designer"
                                maxLength={120}
                            />

                            <TextAreaField
                                label="Bio"
                                name="bio"
                                value={
                                    profile.bio
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    !editing ||
                                    saving
                                }
                                maxLength={500}
                                placeholder="Tell people about your experience, interests, teaching strengths and learning goals."
                            />
                        </ProfileSection>

                        <ProfileSection
                            title="Location"
                            description="Help SkillSwap AI show more relevant users and opportunities."
                            icon={
                                HiOutlineMapPin
                            }
                        >
                            <div className="grid gap-5 md:grid-cols-2">
                                <FormField
                                    label="City"
                                    name="location.city"
                                    value={
                                        profile
                                            .location
                                            .city
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        !editing ||
                                        saving
                                    }
                                    placeholder="Ahmedabad"
                                    maxLength={80}
                                />

                                <FormField
                                    label="Country"
                                    name="location.country"
                                    value={
                                        profile
                                            .location
                                            .country
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        !editing ||
                                        saving
                                    }
                                    placeholder="India"
                                    maxLength={80}
                                />
                            </div>
                        </ProfileSection>

                        <ProfileSection
                            title="Professional links"
                            description="Share links that support your experience and credibility."
                            icon={
                                HiOutlineLink
                            }
                        >
                            <FormField
                                label="GitHub profile"
                                name="socialLinks.github"
                                value={
                                    profile
                                        .socialLinks
                                        .github
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    !editing ||
                                    saving
                                }
                                icon={FaGithub}
                                placeholder="https://github.com/username"
                                maxLength={300}
                            />

                            <FormField
                                label="LinkedIn profile"
                                name="socialLinks.linkedin"
                                value={
                                    profile
                                        .socialLinks
                                        .linkedin
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    !editing ||
                                    saving
                                }
                                icon={
                                    FaLinkedin
                                }
                                placeholder="https://linkedin.com/in/username"
                                maxLength={300}
                            />

                            <FormField
                                label="Portfolio website"
                                name="socialLinks.portfolio"
                                value={
                                    profile
                                        .socialLinks
                                        .portfolio
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    !editing ||
                                    saving
                                }
                                icon={
                                    HiOutlineGlobeAlt
                                }
                                placeholder="https://yourportfolio.com"
                                maxLength={300}
                            />
                        </ProfileSection>

                        {editing && (
                            <div className="flex flex-col-reverse gap-3 rounded-2xl border border-white/10 bg-[#101117] p-4 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={
                                        handleCancel
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="rounded-xl border border-white/10 px-5 py-3 text-sm  text-white/60 transition hover:bg-white/5 hover:text-white disabled:opacity-50 font-bold"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        saving
                                    }
                                    className="rounded-xl bg-orange-500 px-6 py-3 text-sm  text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60 font-bold"
                                >
                                    {saving
                                        ? "Saving changes..."
                                        : "Save changes"}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </main>
    );
}

function ProfileSummary({
    initials,
    profile,
    profileData,
}) {
    const completion =
        Number(
            profileData?.profileCompletion
        ) || 20;

    const location = [
        profile.location.city,
        profile.location.country,
    ]
        .filter(Boolean)
        .join(", ");

    return (
        <aside className="h-fit rounded-[24px] border border-white/10 bg-[#101117] p-6 xl:sticky xl:top-24">
            <div className="flex flex-col items-center text-center">
                <div className="relative">
                    <div className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-orange-500 text-3xl font-bold text-black shadow-xl shadow-orange-500/10">
                        {initials || "U"}
                    </div>

                    <span className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border-4 border-[#101117] bg-green-500 text-black">
                        <HiOutlineCheckBadge className="text-lg" />
                    </span>
                </div>

                <h2 className="mt-6 text-2xl font-semibold">
                    {profile.name ||
                        "SkillSwap User"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/40">
                    {profile.headline ||
                        "Add a professional headline"}
                </p>

                {profileData?.isEmailVerified && (
                    <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-300">
                        <HiOutlineCheckBadge />

                        Verified account
                    </span>
                )}
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-white/45">
                        Profile completion
                    </span>

                    <span className="font-semibold text-orange-400">
                        {completion}%
                    </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                        className="h-full rounded-full bg-orange-500 transition-all duration-500"
                        style={{
                            width: `${Math.min(
                                completion,
                                100
                            )}%`,
                        }}
                    />
                </div>

                <p className="mt-3 text-xs leading-5 text-white/30">
                    Complete your details to improve
                    user matching and AI
                    recommendations.
                </p>
            </div>

            <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
                <SummaryItem
                    icon={HiOutlineEnvelope}
                    text={
                        profileData?.email ||
                        "Email unavailable"
                    }
                />

                <SummaryItem
                    icon={HiOutlineMapPin}
                    text={
                        location ||
                        "Location not added"
                    }
                />

                <SummaryItem
                    icon={HiOutlineBriefcase}
                    text={
                        profile.headline ||
                        "Headline not added"
                    }
                />
            </div>
        </aside>
    );
}

function SummaryItem({
    icon: Icon,
    text,
}) {
    return (
        <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                <Icon className="text-lg" />
            </span>

            <p className="min-w-0 break-words pt-2 text-sm text-white/45">
                {text}
            </p>
        </div>
    );
}

function ProfileSection({
    title,
    description,
    icon: Icon,
    children,
}) {
    return (
        <section className="rounded-[24px] border border-white/10 bg-[#101117] p-5 sm:p-6">
            <div className="flex items-start gap-4 border-b border-white/10 pb-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                    <Icon className="text-xl" />
                </span>

                <div>
                    <h2 className="text-lg font-semibold">
                        {title}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-white/35">
                        {description}
                    </p>
                </div>
            </div>

            <div className="mt-6 space-y-5">
                {children}
            </div>
        </section>
    );
}

function FormField({
    label,
    icon: Icon,
    disabled,
    ...inputProps
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium text-white/60">
                {label}
            </span>

            <div className="relative">
                {Icon && (
                    <Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-white/25" />
                )}

                <input
                    {...inputProps}
                    disabled={disabled}
                    className={`w-full rounded-xl border border-white/10 bg-[#090a0f] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:bg-white/[0.025] disabled:text-white/35 ${Icon ? "pl-11" : ""
                        }`}
                />
            </div>
        </label>
    );
}

function TextAreaField({
    label,
    value,
    maxLength,
    disabled,
    ...props
}) {
    return (
        <label className="block">
            <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-white/60">
                    {label}
                </span>

                <span className="text-xs text-white/20">
                    {value?.length || 0}/
                    {maxLength}
                </span>
            </div>

            <textarea
                {...props}
                value={value}
                maxLength={maxLength}
                disabled={disabled}
                rows={6}
                className="w-full resize-none rounded-xl border border-white/10 bg-[#090a0f] px-4 py-3.5 text-sm leading-7 text-white outline-none transition placeholder:text-white/20 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:bg-white/[0.025] disabled:text-white/35"
            />
        </label>
    );
}

function Alert({
    type,
    message,
    onClose,
}) {
    const success =
        type === "success";

    return (
        <div
            className={`mt-5 flex items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm ${success
                    ? "border-green-500/30 bg-green-500/10 text-green-300"
                    : "border-red-500/30 bg-red-500/10 text-red-300"
                }`}
        >
            <p>{message}</p>

            <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 transition hover:bg-white/10 font-bold"
                aria-label="Close message"
            >
                <HiOutlineXMark className="text-lg" />
            </button>
        </div>
    );
}