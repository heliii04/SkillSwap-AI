import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Allowed values
|--------------------------------------------------------------------------
*/

const categories = [
    "technology",
    "design",
    "business",
    "marketing",
    "languages",
    "music",
    "academics",
    "fitness",
    "photography",
    "lifestyle",
    "other",
];

const teachingLevels = [
    "beginner",
    "intermediate",
    "advanced",
    "expert",
];

const currentLearningLevels = [
    "complete-beginner",
    "beginner",
    "intermediate",
    "advanced",
];

const targetLearningLevels = [
    "beginner",
    "intermediate",
    "advanced",
    "expert",
];

const learningPriorities = [
    "low",
    "medium",
    "high",
];

const interactionModes = [
    "online",
    "offline",
    "both",
];

const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
];

const timeSlots = [
    "morning",
    "afternoon",
    "evening",
    "flexible",
];

/*
|--------------------------------------------------------------------------
| Shared schemas
|--------------------------------------------------------------------------
*/

const skillIdSchema = z
    .string({
        error: "Skill identifier is required",
    })
    .trim()
    .regex(/^[a-f\d]{24}$/i, {
        error: "Invalid skill identifier",
    });

const titleSchema = z
    .string({
        error: "Skill title is required",
    })
    .trim()
    .min(2, {
        error:
            "Skill title must contain at least 2 characters",
    })
    .max(80, {
        error:
            "Skill title cannot exceed 80 characters",
    });

const categorySchema = z.enum(
    categories,
    {
        error:
            "Please select a valid skill category",
    }
);

const tagsSchema = z
    .array(
        z
            .string({
                error:
                    "Each tag must be a string",
            })
            .trim()
            .min(1, {
                error:
                    "Tags cannot be empty",
            })
            .max(30, {
                error:
                    "Each tag cannot exceed 30 characters",
            })
            .regex(
                /^[a-zA-Z0-9+#.\-\s]+$/,
                {
                    error:
                        "Tags contain unsupported characters",
                }
            )
    )
    .max(10, {
        error:
            "A maximum of 10 tags is allowed",
    })
    .default([])
    .transform((tags) => {
        return [
            ...new Set(
                tags
                    .map((tag) =>
                        tag
                            .trim()
                            .toLowerCase()
                            .replace(/\s+/g, " ")
                    )
                    .filter(Boolean)
            ),
        ];
    });

const availabilitySchema = z
    .object({
        days: z
            .array(
                z.enum(days, {
                    error:
                        "Please select a valid availability day",
                })
            )
            .max(7, {
                error:
                    "A maximum of 7 availability days is allowed",
            })
            .default([])
            .transform(
                (selectedDays) =>
                    [
                        ...new Set(
                            selectedDays
                        ),
                    ]
            ),

        timeSlot: z
            .enum(timeSlots, {
                error:
                    "Please select a valid time slot",
            })
            .default("flexible"),
    })
    .strict({
        error:
            "Availability contains unsupported fields",
    })
    .default({
        days: [],
        timeSlot: "flexible",
    });

const isActiveSchema = z
    .boolean({
        error:
            "Active status must be true or false",
    })
    .optional()
    .default(true);

/*
|--------------------------------------------------------------------------
| Teaching skill schema
|--------------------------------------------------------------------------
*/

const teachSkillBodySchema = z
    .object({
        title: titleSchema,

        category: categorySchema,

        level: z.enum(
            teachingLevels,
            {
                error:
                    "Please select a valid teaching skill level",
            }
        ),

        description: z
            .string({
                error:
                    "Skill description is required",
            })
            .trim()
            .min(20, {
                error:
                    "Description must contain at least 20 characters",
            })
            .max(1000, {
                error:
                    "Description cannot exceed 1000 characters",
            }),

        yearsOfExperience: z.coerce
            .number({
                error:
                    "Years of experience must be a number",
            })
            .finite({
                error:
                    "Years of experience must be a valid number",
            })
            .min(0, {
                error:
                    "Years of experience cannot be negative",
            })
            .max(60, {
                error:
                    "Years of experience cannot exceed 60",
            })
            .default(0),

        teachingMode: z
            .enum(interactionModes, {
                error:
                    "Please select a valid teaching mode",
            })
            .default("online"),

        availability:
            availabilitySchema,

        tags: tagsSchema,

        isActive:
            isActiveSchema,
    })
    .strict({
        error:
            "Request contains unsupported fields",
    });

/*
|--------------------------------------------------------------------------
| Learning skill schema
|--------------------------------------------------------------------------
*/

const learnSkillBodySchema = z
    .object({
        title: titleSchema,

        category: categorySchema,

        currentLevel: z.enum(
            currentLearningLevels,
            {
                error:
                    "Please select a valid current learning level",
            }
        ),

        targetLevel: z.enum(
            targetLearningLevels,
            {
                error:
                    "Please select a valid target learning level",
            }
        ),

        learningGoal: z
            .string({
                error:
                    "Learning goal is required",
            })
            .trim()
            .min(20, {
                error:
                    "Learning goal must contain at least 20 characters",
            })
            .max(500, {
                error:
                    "Learning goal cannot exceed 500 characters",
            }),

        priority: z
            .enum(
                learningPriorities,
                {
                    error:
                        "Please select a valid learning priority",
                }
            )
            .default("medium"),

        preferredLearningMode: z
            .enum(interactionModes, {
                error:
                    "Please select a valid preferred learning mode",
            })
            .default("online"),

        availability:
            availabilitySchema,

        tags: tagsSchema,

        isActive:
            isActiveSchema,
    })
    .strict({
        error:
            "Request contains unsupported fields",
    })
    .refine(
        (data) => {
            const levelOrder = {
                "complete-beginner": 0,
                beginner: 1,
                intermediate: 2,
                advanced: 3,
                expert: 4,
            };

            return (
                levelOrder[
                data.targetLevel
                ] >=
                levelOrder[
                data.currentLevel
                ]
            );
        },
        {
            path: ["targetLevel"],
            message:
                "Target level cannot be lower than current level",
        }
    );

/*
|--------------------------------------------------------------------------
| Teaching skill request validators
|--------------------------------------------------------------------------
*/

export const createTeachSkillSchema =
    z.object({
        body: teachSkillBodySchema,
    });

export const updateTeachSkillSchema =
    z.object({
        body: teachSkillBodySchema,

        params: z
            .object({
                skillId:
                    skillIdSchema,
            })
            .strict({
                error:
                    "Route parameters contain unsupported fields",
            }),
    });

/*
|--------------------------------------------------------------------------
| Learning skill request validators
|--------------------------------------------------------------------------
*/

export const createLearnSkillSchema =
    z.object({
        body: learnSkillBodySchema,
    });

export const updateLearnSkillSchema =
    z.object({
        body: learnSkillBodySchema,

        params: z
            .object({
                skillId:
                    skillIdSchema,
            })
            .strict({
                error:
                    "Route parameters contain unsupported fields",
            }),
    });

/*
|--------------------------------------------------------------------------
| Delete / single-skill parameter validator
|--------------------------------------------------------------------------
*/

export const skillIdParamSchema =
    z.object({
        body: z
            .object({})
            .strict({
                error:
                    "Request body must be empty",
            })
            .optional(),

        params: z
            .object({
                skillId:
                    skillIdSchema,
            })
            .strict({
                error:
                    "Route parameters contain unsupported fields",
            }),
    });