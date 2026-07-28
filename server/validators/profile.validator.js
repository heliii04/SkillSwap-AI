import { z } from "zod";

const trimmedOptionalText = (
    maximumLength,
    maximumMessage
) =>
    z
        .string()
        .trim()
        .max(maximumLength, {
            error: maximumMessage,
        })
        .optional();

const optionalUrl = z
    .union([
        z
            .string()
            .trim()
            .url({
                error:
                    "Please provide a valid URL.",
            })
            .max(300, {
                error:
                    "URL cannot exceed 300 characters.",
            }),

        z.literal(""),
    ])
    .optional();

const passwordSchema = z
    .string({
        error: "Password is required.",
    })
    .min(8, {
        error:
            "Password must contain at least 8 characters.",
    })
    .max(72, {
        error:
            "Password cannot exceed 72 characters.",
    })
    .regex(/[a-z]/, {
        error:
            "Password must contain at least one lowercase letter.",
    })
    .regex(/[A-Z]/, {
        error:
            "Password must contain at least one uppercase letter.",
    })
    .regex(/[0-9]/, {
        error:
            "Password must contain at least one number.",
    })
    .regex(/[^a-zA-Z0-9]/, {
        error:
            "Password must contain at least one special character.",
    });

const locationSchema = z
    .object({
        city: trimmedOptionalText(
            80,
            "City cannot exceed 80 characters."
        ),

        state: trimmedOptionalText(
            80,
            "State cannot exceed 80 characters."
        ),

        country: trimmedOptionalText(
            80,
            "Country cannot exceed 80 characters."
        ),
    })
    .strict({
        error:
            "Location contains unsupported fields.",
    });

const socialLinksSchema = z
    .object({
        github: optionalUrl,

        linkedin: optionalUrl,

        portfolio: optionalUrl,
    })
    .strict({
        error:
            "Social links contain unsupported fields.",
    });

export const updateProfileSchema =
    z.object({
        body: z
            .object({
                name: z
                    .string({
                        error:
                            "Name must be a string.",
                    })
                    .trim()
                    .min(2, {
                        error:
                            "Name must contain at least 2 characters.",
                    })
                    .max(80, {
                        error:
                            "Name cannot exceed 80 characters.",
                    })
                    .regex(
                        /^[a-zA-Z\s'-]+$/,
                        {
                            error:
                                "Name contains unsupported characters.",
                        }
                    )
                    .optional(),

                headline:
                    trimmedOptionalText(
                        120,
                        "Headline cannot exceed 120 characters."
                    ),

                bio: trimmedOptionalText(
                    500,
                    "Bio cannot exceed 500 characters."
                ),

                location:
                    locationSchema.optional(),

                socialLinks:
                    socialLinksSchema.optional(),
            })
            .strict({
                error:
                    "Request contains unsupported fields.",
            })
            .refine(
                (body) =>
                    Object.keys(body).length >
                    0,
                {
                    message:
                        "At least one profile field is required.",
                }
            ),

        params: z.object({}).optional(),

        query: z.object({}).optional(),
    });

export const changePasswordSchema =
    z.object({
        body: z
            .object({
                currentPassword: z
                    .string({
                        error:
                            "Current password is required.",
                    })
                    .min(1, {
                        error:
                            "Current password is required.",
                    })
                    .max(72, {
                        error:
                            "Current password cannot exceed 72 characters.",
                    }),

                newPassword:
                    passwordSchema,

                confirmPassword: z
                    .string({
                        error:
                            "Password confirmation is required.",
                    })
                    .min(1, {
                        error:
                            "Password confirmation is required.",
                    }),
            })
            .strict({
                error:
                    "Request contains unsupported fields.",
            })
            .refine(
                (body) =>
                    body.newPassword ===
                    body.confirmPassword,
                {
                    path: [
                        "confirmPassword",
                    ],
                    message:
                        "Password confirmation does not match.",
                }
            )
            .refine(
                (body) =>
                    body.currentPassword !==
                    body.newPassword,
                {
                    path: ["newPassword"],
                    message:
                        "New password must be different from the current password.",
                }
            ),

        params: z.object({}).optional(),

        query: z.object({}).optional(),
    });