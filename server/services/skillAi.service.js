import { askJson } from "./ai.service.js";

import {
    expandTokens,
    tokenize,
} from "../utils/textSimilarity.js";

/*
|--------------------------------------------------------------------------
| AI-assisted product features
|--------------------------------------------------------------------------
|
| Every export here returns a usable result even when the AI provider is
| off or failing: the LLM improves the answer, it is never required for it.
|
*/

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

const asArray = (value) => (Array.isArray(value) ? value : []);

const clampString = (value, maxLength) =>
    String(value || "").trim().slice(0, maxLength);

/*
|--------------------------------------------------------------------------
| Search intent
|--------------------------------------------------------------------------
*/

const fallbackSearchIntent = (query) => {
    const tokens = tokenize(query);

    return {
        keywords: [...expandTokens(tokens)].slice(0, 12),
        category: null,
        level: null,
        mode: null,
        source: "keyword",
    };
};

/**
 * Turns "mujhe website banana seekhna hai" into searchable keywords
 * plus optional filters, so plain text search finds React/HTML mentors.
 */
export const parseSearchIntent = async (query) => {
    const cleanQuery = clampString(query, 300);

    if (!cleanQuery) {
        return fallbackSearchIntent("");
    }

    const parsed = await askJson({
        system:
            "You expand skill-marketplace search queries. Users write in English, Hindi or Hinglish. " +
            "Return concrete, searchable skill keywords (technologies, tools, subjects) - not sentences.",

        prompt: `Query: "${cleanQuery}"

Return JSON:
{
  "keywords": ["max 10 lowercase skill keywords, include obvious related tech"],
  "category": one of ${JSON.stringify(SKILL_CATEGORIES)} or null,
  "level": "beginner" | "intermediate" | "advanced" | "expert" | null,
  "mode": "online" | "offline" | null
}`,

        maxTokens: 250,
        temperature: 0.2,
    });

    if (!parsed || !asArray(parsed.keywords).length) {
        return fallbackSearchIntent(cleanQuery);
    }

    return {
        keywords: [
            ...new Set(
                asArray(parsed.keywords)
                    .map((keyword) => clampString(keyword, 40).toLowerCase())
                    .filter(Boolean)
            ),
        ].slice(0, 12),

        category: SKILL_CATEGORIES.includes(parsed.category)
            ? parsed.category
            : null,

        level: parsed.level || null,
        mode: parsed.mode || null,
        source: "ai",
    };
};

/*
|--------------------------------------------------------------------------
| Profile / skill extraction
|--------------------------------------------------------------------------
*/

const fallbackSkillExtraction = (text) => {
    const tokens = [...new Set(tokenize(text))].slice(0, 8);

    return {
        skills: tokens.map((token) => ({
            title: token,
            category: "other",
            level: "intermediate",
            tags: [token],
        })),
        headline: "",
        source: "keyword",
    };
};

/**
 * Reads a free-form bio/resume paragraph and proposes skills to add,
 * so onboarding does not start with an empty form.
 */
export const extractSkillsFromText = async (text) => {
    const cleanText = clampString(text, 3000);

    if (!cleanText) {
        return {
            skills: [],
            headline: "",
            source: "keyword",
        };
    }

    const parsed = await askJson({
        system:
            "You extract teachable skills from a person's bio or resume for a skill-swap platform.",

        prompt: `Bio:
"""
${cleanText}
"""

Return JSON:
{
  "headline": "one short professional headline, max 120 chars",
  "skills": [
    {
      "title": "skill name, max 60 chars",
      "category": one of ${JSON.stringify(SKILL_CATEGORIES)},
      "level": "beginner" | "intermediate" | "advanced" | "expert",
      "description": "2 sentences on what they can teach, min 20 chars",
      "tags": ["max 5 lowercase tags"]
    }
  ]
}
Only include skills clearly supported by the bio. Max 8 skills.`,

        maxTokens: 900,
        temperature: 0.3,
    });

    if (!parsed || !asArray(parsed.skills).length) {
        return fallbackSkillExtraction(cleanText);
    }

    return {
        headline: clampString(parsed.headline, 120),

        skills: asArray(parsed.skills)
            .slice(0, 8)
            .map((skill) => ({
                title: clampString(skill.title, 60),

                category: SKILL_CATEGORIES.includes(skill.category)
                    ? skill.category
                    : "other",

                level: ["beginner", "intermediate", "advanced", "expert"].includes(
                    skill.level
                )
                    ? skill.level
                    : "intermediate",

                description: clampString(skill.description, 1000),

                tags: asArray(skill.tags)
                    .slice(0, 5)
                    .map((tag) => clampString(tag, 30).toLowerCase())
                    .filter(Boolean),
            }))
            .filter((skill) => skill.title.length >= 2),

        source: "ai",
    };
};

/*
|--------------------------------------------------------------------------
| Learning roadmap
|--------------------------------------------------------------------------
*/

const fallbackRoadmap = ({ skillTitle, currentLevel, targetLevel }) => {
    const phases = [
        ["Fundamentals", "Cover core concepts and vocabulary"],
        ["Guided practice", "Work through examples together"],
        ["Small project", "Build something end to end"],
        ["Deep dive", "Tackle the hard parts of the topic"],
        ["Independent build", "Learner leads, mentor reviews"],
        ["Review & next steps", "Assess progress and plan what follows"],
    ];

    return {
        title: `${skillTitle}: ${currentLevel || "beginner"} → ${
            targetLevel || "advanced"
        }`,

        summary: `A six-week plan to learn ${skillTitle} through weekly one-hour swap sessions.`,

        weeks: phases.map(([focus, goal], index) => ({
            week: index + 1,
            focus,
            goal,
            activities: [
                `Session: ${goal.toLowerCase()}`,
                "Homework before the next session",
            ],
        })),

        source: "template",
    };
};

/**
 * Week-by-week plan generated when a swap is accepted, so both sides
 * know what the sessions will actually cover.
 */
export const generateLearningRoadmap = async ({
    skillTitle,
    currentLevel,
    targetLevel,
    learningGoal,
    teacherLevel,
    weeks = 6,
}) => {
    const title = clampString(skillTitle, 80);

    if (!title) {
        return null;
    }

    const parsed = await askJson({
        system:
            "You design short, practical peer-to-peer learning plans for a skill-swap platform. " +
            "Sessions are one hour per week between two people, not a formal course.",

        prompt: `Skill: ${title}
Learner current level: ${currentLevel || "beginner"}
Learner target level: ${targetLevel || "advanced"}
Learner goal: ${clampString(learningGoal, 400) || "not specified"}
Mentor level: ${teacherLevel || "advanced"}

Return JSON:
{
  "title": "short plan title",
  "summary": "2 sentences",
  "weeks": [
    {
      "week": 1,
      "focus": "short focus title",
      "goal": "what the learner can do after this week",
      "activities": ["2-3 concrete activities"]
    }
  ]
}
Exactly ${weeks} weeks. Be specific to the skill, no generic filler.`,

        maxTokens: 1200,
        temperature: 0.5,
    });

    if (!parsed || !asArray(parsed.weeks).length) {
        return fallbackRoadmap({
            skillTitle: title,
            currentLevel,
            targetLevel,
        });
    }

    return {
        title: clampString(parsed.title, 120) || title,
        summary: clampString(parsed.summary, 400),

        weeks: asArray(parsed.weeks)
            .slice(0, 12)
            .map((week, index) => ({
                week: Number(week.week) || index + 1,
                focus: clampString(week.focus, 120),
                goal: clampString(week.goal, 300),

                activities: asArray(week.activities)
                    .slice(0, 5)
                    .map((activity) => clampString(activity, 200))
                    .filter(Boolean),
            })),

        source: "ai",
    };
};

/*
|--------------------------------------------------------------------------
| Icebreaker message
|--------------------------------------------------------------------------
*/

export const generateIcebreaker = async ({
    senderName,
    receiverName,
    youTeach,
    youWant,
}) => {
    const fallback = `Hi ${receiverName || "there"}! I saw you want to learn ${
        youTeach || "a skill I teach"
    }. I'd love to help, and I'm hoping to learn ${
        youWant || "something from you"
    } in return. Shall we set up a first session?`;

    const parsed = await askJson({
        system:
            "You write short, warm, non-salesy first messages between two people on a skill-swap platform.",

        prompt: `Sender: ${senderName || "A member"}
Receiver: ${receiverName || "the other member"}
Sender can teach: ${youTeach || "unknown"}
Sender wants to learn: ${youWant || "unknown"}

Return JSON: { "message": "max 60 words, friendly, ends with a clear next step" }`,

        maxTokens: 200,
        temperature: 0.8,
        cacheTtlMs: 60 * 1000,
    });

    const message = clampString(parsed?.message, 600);

    return {
        message: message || fallback,
        source: message ? "ai" : "template",
    };
};
