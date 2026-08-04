import mongoose from "mongoose";

const SKILL_TYPES = [
    "teach",
    "learn",
];

const SKILL_CATEGORIES = [
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

const SKILL_LEVELS = [
    "beginner",
    "intermediate",
    "advanced",
    "expert",
];

const CURRENT_LEARNING_LEVELS = [
    "complete-beginner",
    "beginner",
    "intermediate",
    "advanced",
];

const INTERACTION_MODES = [
    "online",
    "offline",
    "both",
];

const PRIORITY_LEVELS = [
    "low",
    "medium",
    "high",
];

const WEEK_DAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
];

const TIME_SLOTS = [
    "morning",
    "afternoon",
    "evening",
    "flexible",
];

const availabilitySchema =
    new mongoose.Schema(
        {
            days: {
                type: [String],
                enum: WEEK_DAYS,
                default: [],
            },

            timeSlot: {
                type: String,
                enum: TIME_SLOTS,
                default: "flexible",
            },
        },
        {
            _id: false,
        }
    );

const skillSchema =
    new mongoose.Schema(
        {
            owner: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: [
                    true,
                    "Skill owner is required",
                ],
                index: true,
            },

            type: {
                type: String,
                enum: SKILL_TYPES,
                required: [
                    true,
                    "Skill type is required",
                ],
                index: true,
            },

            title: {
                type: String,
                required: [
                    true,
                    "Skill title is required",
                ],
                trim: true,
                minlength: [
                    2,
                    "Skill title must contain at least 2 characters",
                ],
                maxlength: [
                    80,
                    "Skill title cannot exceed 80 characters",
                ],
            },

            normalizedTitle: {
                type: String,
                required: [
                    true,
                    "Normalized skill title is required",
                ],
                lowercase: true,
                trim: true,
                select: false,
            },

            category: {
                type: String,
                required: [
                    true,
                    "Skill category is required",
                ],
                enum: SKILL_CATEGORIES,
                index: true,
            },

            /*
            |--------------------------------------------------------------------------
            | Teaching-skill fields
            |--------------------------------------------------------------------------
            */

            level: {
                type: String,
                enum: {
                    values: SKILL_LEVELS,
                    message:
                        "Invalid teaching skill level",
                },
                default: undefined,
            },

            description: {
                type: String,
                trim: true,
                minlength: [
                    20,
                    "Description must contain at least 20 characters",
                ],
                maxlength: [
                    1000,
                    "Description cannot exceed 1000 characters",
                ],
                default: undefined,
            },

            yearsOfExperience: {
                type: Number,
                min: [
                    0,
                    "Years of experience cannot be negative",
                ],
                max: [
                    60,
                    "Years of experience cannot exceed 60",
                ],
                default: undefined,
            },

            teachingMode: {
                type: String,
                enum: {
                    values: INTERACTION_MODES,
                    message:
                        "Invalid teaching mode",
                },
                default: undefined,
            },

            /*
            |--------------------------------------------------------------------------
            | Learning-skill fields
            |--------------------------------------------------------------------------
            */

            currentLevel: {
                type: String,
                enum: {
                    values:
                        CURRENT_LEARNING_LEVELS,
                    message:
                        "Invalid current learning level",
                },
                default: undefined,
            },

            targetLevel: {
                type: String,
                enum: {
                    values: SKILL_LEVELS,
                    message:
                        "Invalid target learning level",
                },
                default: undefined,
            },

            learningGoal: {
                type: String,
                trim: true,
                minlength: [
                    20,
                    "Learning goal must contain at least 20 characters",
                ],
                maxlength: [
                    500,
                    "Learning goal cannot exceed 500 characters",
                ],
                default: undefined,
            },

            priority: {
                type: String,
                enum: {
                    values: PRIORITY_LEVELS,
                    message:
                        "Invalid learning priority",
                },
                default: undefined,
                index: true,
            },

            preferredLearningMode: {
                type: String,
                enum: {
                    values: INTERACTION_MODES,
                    message:
                        "Invalid preferred learning mode",
                },
                default: undefined,
            },

            /*
            |--------------------------------------------------------------------------
            | Shared fields
            |--------------------------------------------------------------------------
            */

            availability: {
                type: availabilitySchema,
                default: () => ({
                    days: [],
                    timeSlot: "flexible",
                }),
            },

            tags: {
                type: [String],
                default: [],
                validate: {
                    validator: (tags) =>
                        tags.length <= 10,

                    message:
                        "A maximum of 10 tags is allowed",
                },
            },

            isActive: {
                type: Boolean,
                default: true,
                index: true,
            },
        },
        {
            timestamps: true,
            versionKey: false,
        }
    );

/*
|--------------------------------------------------------------------------
| Conditional validation
|--------------------------------------------------------------------------
|
| Teaching and learning records share one collection,
| but each type requires different fields.
|
*/

skillSchema.pre(
    "validate",
    function validateSkillType() {
        if (this.type === "teach") {
            const missingTeachingFields = [];

            if (!this.level) {
                missingTeachingFields.push("level");
            }

            if (!this.description) {
                missingTeachingFields.push(
                    "description"
                );
            }

            if (
                this.yearsOfExperience ===
                undefined
            ) {
                missingTeachingFields.push(
                    "yearsOfExperience"
                );
            }

            if (!this.teachingMode) {
                missingTeachingFields.push(
                    "teachingMode"
                );
            }

            if (
                missingTeachingFields.length >
                0
            ) {
                throw new Error(
                    `Teaching skill is missing required field(s): ${missingTeachingFields.join(
                        ", "
                    )}`
                );
            }

            this.currentLevel = undefined;
            this.targetLevel = undefined;
            this.learningGoal = undefined;
            this.priority = undefined;
            this.preferredLearningMode =
                undefined;
        }

        if (this.type === "learn") {
            const missingLearningFields = [];

            if (!this.currentLevel) {
                missingLearningFields.push(
                    "currentLevel"
                );
            }

            if (!this.targetLevel) {
                missingLearningFields.push(
                    "targetLevel"
                );
            }

            if (!this.learningGoal) {
                missingLearningFields.push(
                    "learningGoal"
                );
            }

            if (!this.priority) {
                missingLearningFields.push(
                    "priority"
                );
            }

            if (
                !this.preferredLearningMode
            ) {
                missingLearningFields.push(
                    "preferredLearningMode"
                );
            }

            if (
                missingLearningFields.length >
                0
            ) {
                throw new Error(
                    `Learning skill is missing required field(s): ${missingLearningFields.join(
                        ", "
                    )}`
                );
            }

            this.level = undefined;
            this.description = undefined;
            this.yearsOfExperience =
                undefined;
            this.teachingMode = undefined;
        }
    }
);

/*
|--------------------------------------------------------------------------
| Data normalization
|--------------------------------------------------------------------------
*/

skillSchema.pre(
    "save",
    function normalizeSkillData() {
        if (this.title) {
            let rawTitle = this.title.trim();
            
            // Remove common redundant prefixes and suffixes
            let cleanTitle = rawTitle.replace(/\b(advanced|beginner|intermediate|intro|introduction to|basics|programming|development|js|tutorial|learn|course)\b/gi, '').trim();
            
            // Remove trailing punctuation (like a dot at the end)
            cleanTitle = cleanTitle.replace(/^[^\w\s]+|[^\w\s]+$/g, '').trim();
            
            // Fallback if the user typed ONLY those words
            if (!cleanTitle) cleanTitle = rawTitle.replace(/^[^\w\s]+|[^\w\s]+$/g, '').trim();
            
            // Convert to Title Case
            cleanTitle = cleanTitle.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

            this.title = cleanTitle;

            this.normalizedTitle =
                this.title
                    .toLowerCase()
                    .replace(/\s+/g, " ");
        }

        if (Array.isArray(this.tags)) {
            this.tags = [
                ...new Set(
                    this.tags
                        .map((tag) =>
                            String(tag)
                                .trim()
                                .toLowerCase()
                        )
                        .filter(Boolean)
                ),
            ];
        }

        if (
            Array.isArray(
                this.availability?.days
            )
        ) {
            this.availability.days = [
                ...new Set(
                    this.availability.days
                ),
            ];
        }
    }
);

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

skillSchema.index(
    {
        owner: 1,
        type: 1,
        normalizedTitle: 1,
    },
    {
        unique: true,
    }
);

skillSchema.index({
    title: "text",
    description: "text",
    learningGoal: "text",
    tags: "text",
});

export default mongoose.model(
    "Skill",
    skillSchema
);