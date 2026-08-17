export function calculateProfileCompletion(user) {
    const profileFields = [
        Boolean(user.name?.trim()),

        Boolean(user.email?.trim()),

        Boolean(user.isEmailVerified),

        Boolean(user.headline?.trim()),

        Boolean(user.bio?.trim()),

        Boolean(user.location?.city?.trim()),

        Boolean(user.location?.country?.trim()),

        Boolean(user.avatar?.url?.trim()),

        Boolean(
            user.socialLinks?.github?.trim() ||
            user.socialLinks?.linkedin?.trim() ||
            user.socialLinks?.portfolio?.trim()
        ),
    ];

    const completedFields =
        profileFields.filter(Boolean).length;

    return Math.round(
        (completedFields /
            profileFields.length) *
            100
    );
}

export function sanitizeProfile(user) {
    return {
        id: user._id.toString(),

        name: user.name,

        email: user.email,

        headline: user.headline || "",

        bio: user.bio || "",

        location: {
            city:
                user.location?.city || "",

            state:
                user.location?.state || "",

            country:
                user.location?.country || "",
        },

        socialLinks: {
            github:
                user.socialLinks?.github || "",

            linkedin:
                user.socialLinks?.linkedin || "",

            portfolio:
                user.socialLinks?.portfolio || "",
        },

        avatar: {
            publicId:
                user.avatar?.publicId || null,

            url:
                user.avatar?.url || null,
        },

        profileCompletion:
            user.profileCompletion ?? 0,

        role: user.role,

        accountStatus:
            user.accountStatus,

        isEmailVerified:
            user.isEmailVerified,

        rating: user.rating || 0,
        reviews: user.reviews || 0,
        sessions: user.sessions || 0,

        createdAt: user.createdAt,

        updatedAt: user.updatedAt,
    };
}