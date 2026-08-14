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

export const CANONICAL_SKILL_MAP = [
    // Design & Creative
    {
        regex: /^\s*(ui[\/\s\-]*ux(\s*design)?|ux[\/\s\-]*ui|user\s*interface(\s*design)?|ui\s*design|ux\s*design)\s*$/i,
        title: "UI/UX Design",
        normalizedTitle: "ui/ux design",
        category: "design"
    },
    {
        regex: /^\s*(figma|figma\s*design)\s*$/i,
        title: "Figma",
        normalizedTitle: "figma",
        category: "design"
    },
    {
        regex: /^\s*(graphic\s*design|graphics\s*design)\s*$/i,
        title: "Graphic Design",
        normalizedTitle: "graphic design",
        category: "design"
    },
    {
        regex: /^\s*(photoshop|adobe\s*photoshop|ps)\s*$/i,
        title: "Photoshop",
        normalizedTitle: "photoshop",
        category: "design"
    },
    {
        regex: /^\s*(illustrator|adobe\s*illustrator)\s*$/i,
        title: "Illustrator",
        normalizedTitle: "illustrator",
        category: "design"
    },
    {
        regex: /^\s*(web\s*design|website\s*design)\s*$/i,
        title: "Web Design",
        normalizedTitle: "web design",
        category: "design"
    },
    {
        regex: /^\s*(video\s*editing|video\s*editor|premiere\s*pro|capcut|da\s*vinci)\s*$/i,
        title: "Video Editing",
        normalizedTitle: "video editing",
        category: "design"
    },
    {
        regex: /^\s*(3d\s*modeling|blender|3ds\s*max|maya)\s*$/i,
        title: "3D Modeling",
        normalizedTitle: "3d modeling",
        category: "design"
    },

    // Technology & Programming
    {
        regex: /^\s*(react|reactjs|react\.js|react\s*js|react\s*native)\s*$/i,
        title: "React",
        normalizedTitle: "react",
        category: "technology"
    },
    {
        regex: /^\s*(node|nodejs|node\.js|node\s*js|express|expressjs|express\.js)\s*$/i,
        title: "Node.js",
        normalizedTitle: "node.js",
        category: "technology"
    },
    {
        regex: /^\s*(python|python3|python\s*3|py)\s*$/i,
        title: "Python",
        normalizedTitle: "python",
        category: "technology"
    },
    {
        regex: /^\s*(js|javascript|java\s*script|es6)\s*$/i,
        title: "JavaScript",
        normalizedTitle: "javascript",
        category: "technology"
    },
    {
        regex: /^\s*(ts|typescript|type\s*script)\s*$/i,
        title: "TypeScript",
        normalizedTitle: "typescript",
        category: "technology"
    },
    {
        regex: /^\s*(java|core\s*java|java\s*8|java\s*programming)\s*$/i,
        title: "Java",
        normalizedTitle: "java",
        category: "technology"
    },
    {
        regex: /^\s*(c\+\+|cpp|c\s*plus\s*plus)\s*$/i,
        title: "C++",
        normalizedTitle: "c++",
        category: "technology"
    },
    {
        regex: /^\s*(c\#|csharp|c\s*sharp)\s*$/i,
        title: "C#",
        normalizedTitle: "c#",
        category: "technology"
    },
    {
        regex: /^\s*(php|php7|php8|laravel)\s*$/i,
        title: "PHP",
        normalizedTitle: "php",
        category: "technology"
    },
    {
        regex: /^\s*(go|golang)\s*$/i,
        title: "Go",
        normalizedTitle: "go",
        category: "technology"
    },
    {
        regex: /^\s*(rust|rustlang|rust\s*lang)\s*$/i,
        title: "Rust",
        normalizedTitle: "rust",
        category: "technology"
    },
    {
        regex: /^\s*(sql|mysql|postgres|postgresql|mongodb|mongo|database|db)\s*$/i,
        title: "SQL & Databases",
        normalizedTitle: "sql & databases",
        category: "technology"
    },
    {
        regex: /^\s*(html|css|html5|css3|html[\/\s]*css|tailwind|bootstrap)\s*$/i,
        title: "HTML & CSS",
        normalizedTitle: "html & css",
        category: "technology"
    },
    {
        regex: /^\s*(ai|ml|ai\s*\&\s*ml|ai[\/\s]*ml|machine\s*learning|artificial\s*intelligence|deep\s*learning|data\s*science)\s*$/i,
        title: "AI & Machine Learning",
        normalizedTitle: "ai & machine learning",
        category: "technology"
    },
    {
        regex: /^\s*(aws|docker|kubernetes|devops|cloud|azure|gcp)\s*$/i,
        title: "Cloud & DevOps",
        normalizedTitle: "cloud & devops",
        category: "technology"
    },
    {
        regex: /^\s*(flutter|android|ios|swift|kotlin|mobile\s*app\s*dev)\s*$/i,
        title: "Mobile App Development",
        normalizedTitle: "mobile app development",
        category: "technology"
    },

    // Business & Management
    {
        regex: /^\s*(project\s*management|pmp|agile|scrum)\s*$/i,
        title: "Project Management",
        normalizedTitle: "project management",
        category: "business"
    },
    {
        regex: /^\s*(product\s*management|product\s*manager)\s*$/i,
        title: "Product Management",
        normalizedTitle: "product management",
        category: "business"
    },
    {
        regex: /^\s*(business\s*analytics|data\s*analytics|excel|power\s*bi|tableau)\s*$/i,
        title: "Business Analytics",
        normalizedTitle: "business analytics",
        category: "business"
    },
    {
        regex: /^\s*(entrepreneurship|startup|business\s*development)\s*$/i,
        title: "Entrepreneurship",
        normalizedTitle: "entrepreneurship",
        category: "business"
    },
    {
        regex: /^\s*(finance|accounting|bookkeeping|tally|stock\s*market)\s*$/i,
        title: "Finance & Accounting",
        normalizedTitle: "finance & accounting",
        category: "business"
    },

    // Marketing & Communication
    {
        regex: /^\s*(digital\s*marketing|online\s*marketing)\s*$/i,
        title: "Digital Marketing",
        normalizedTitle: "digital marketing",
        category: "marketing"
    },
    {
        regex: /^\s*(seo|search\s*engine\s*optimization|content\s*marketing)\s*$/i,
        title: "SEO & Content Marketing",
        normalizedTitle: "seo & content marketing",
        category: "marketing"
    },
    {
        regex: /^\s*(social\s*media|smm|instagram\s*marketing|facebook\s*ads)\s*$/i,
        title: "Social Media Marketing",
        normalizedTitle: "social media marketing",
        category: "marketing"
    },
    {
        regex: /^\s*(public\s*speaking|communication\s*skills|presentation)\s*$/i,
        title: "Public Speaking",
        normalizedTitle: "public speaking",
        category: "marketing"
    },
    {
        regex: /^\s*(copywriting|content\s*writing)\s*$/i,
        title: "Copywriting",
        normalizedTitle: "copywriting",
        category: "marketing"
    },

    // Languages
    {
        regex: /^\s*(english|spoken\s*english|english\s*grammar|ielts|toefl)\s*$/i,
        title: "English",
        normalizedTitle: "english",
        category: "languages"
    },
    {
        regex: /^\s*(spanish|espanol)\s*$/i,
        title: "Spanish",
        normalizedTitle: "spanish",
        category: "languages"
    },
    {
        regex: /^\s*(french|francais)\s*$/i,
        title: "French",
        normalizedTitle: "french",
        category: "languages"
    },
    {
        regex: /^\s*(german|deutsch)\s*$/i,
        title: "German",
        normalizedTitle: "german",
        category: "languages"
    },
    {
        regex: /^\s*(hindi|spoken\s*hindi)\s*$/i,
        title: "Hindi",
        normalizedTitle: "hindi",
        category: "languages"
    },
    {
        regex: /^\s*(japanese|nihongo)\s*$/i,
        title: "Japanese",
        normalizedTitle: "japanese",
        category: "languages"
    },

    // Music & Arts
    {
        regex: /^\s*(guitar|acoustic\s*guitar|electric\s*guitar)\s*$/i,
        title: "Guitar",
        normalizedTitle: "guitar",
        category: "music"
    },
    {
        regex: /^\s*(piano|keyboard)\s*$/i,
        title: "Piano",
        normalizedTitle: "piano",
        category: "music"
    },
    {
        regex: /^\s*(singing|vocal|vocals)\s*$/i,
        title: "Singing",
        normalizedTitle: "singing",
        category: "music"
    },
    {
        regex: /^\s*(music\s*production|fl\s*studio|ableton|logic\s*pro)\s*$/i,
        title: "Music Production",
        normalizedTitle: "music production",
        category: "music"
    },
    {
        regex: /^\s*(drawing|painting|sketching|digital\s*art)\s*$/i,
        title: "Drawing & Art",
        normalizedTitle: "drawing & art",
        category: "music"
    },

    // Fitness & Lifestyle
    {
        regex: /^\s*(yoga|meditation|mindfulness)\s*$/i,
        title: "Yoga & Meditation",
        normalizedTitle: "yoga & meditation",
        category: "fitness"
    },
    {
        regex: /^\s*(fitness|gym|weight\s*training|calisthenics)\s*$/i,
        title: "Fitness & Gym Training",
        normalizedTitle: "fitness & gym training",
        category: "fitness"
    },
    {
        regex: /^\s*(cooking|baking|culinary)\s*$/i,
        title: "Cooking & Baking",
        normalizedTitle: "cooking & baking",
        category: "lifestyle"
    },
    {
        regex: /^\s*(photography|photo\s*editing|lightroom)\s*$/i,
        title: "Photography",
        normalizedTitle: "photography",
        category: "photography"
    }
];

export function resolveCanonicalSkill(rawTitle) {
    if (!rawTitle || typeof rawTitle !== "string") {
        return null;
    }
    const clean = rawTitle.trim();
    const found = CANONICAL_SKILL_MAP.find(c => c.regex.test(clean));
    if (found) {
        return {
            title: found.title,
            normalizedTitle: found.normalizedTitle,
            category: found.category
        };
    }
    return null;
}

skillSchema.pre(
    "save",
    function normalizeSkillData() {
        if (this.title) {
            let rawTitle = this.title.trim();
            
            const canonical = resolveCanonicalSkill(rawTitle);
            if (canonical) {
                this.title = canonical.title;
                this.normalizedTitle = canonical.normalizedTitle;
                this.category = canonical.category;
            } else {
                let cleanTitle = rawTitle.replace(/\b(advanced|beginner|intermediate|intro|introduction to|basics|tutorial|course)\b/gi, '').trim();
                cleanTitle = cleanTitle.replace(/^[^\w\s]+|[^\w\s]+$/g, '').trim();
                if (!cleanTitle) cleanTitle = rawTitle.replace(/^[^\w\s]+|[^\w\s]+$/g, '').trim();
                cleanTitle = cleanTitle.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

                this.title = cleanTitle;
                this.normalizedTitle = cleanTitle.toLowerCase().replace(/\s+/g, " ");
            }
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
    type: 1,
    category: 1,
    isActive: 1,
});

skillSchema.index({
    owner: 1,
    isActive: 1,
});

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