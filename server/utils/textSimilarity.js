/*
|--------------------------------------------------------------------------
| Lightweight text similarity helpers
|--------------------------------------------------------------------------
|
| Used by the match engine and search so that "JS" still matches
| "JavaScript" without requiring an external AI provider.
|
*/

const STOP_WORDS = new Set([
    "a",
    "an",
    "and",
    "for",
    "from",
    "in",
    "of",
    "on",
    "or",
    "the",
    "to",
    "with",
    "i",
    "me",
    "my",
    "want",
    "learn",
    "learning",
    "teach",
    "teaching",
    "skill",
    "skills",
    "help",
    "basic",
    "basics",
]);

const SYNONYM_GROUPS = [
    ["js", "javascript", "ecmascript"],
    ["ts", "typescript"],
    ["reactjs", "react"],
    ["nodejs", "node"],
    ["nextjs", "next"],
    ["py", "python"],
    ["ml", "machinelearning"],
    ["ai", "artificialintelligence"],
    ["dsa", "datastructures", "algorithms"],
    ["ui", "userinterface"],
    ["ux", "userexperience"],
    ["uiux", "ui", "ux", "design"],
    ["db", "database"],
    ["sql", "mysql", "postgres", "postgresql"],
    ["mongo", "mongodb"],
    ["css", "tailwind", "bootstrap"],
    ["photoshop", "ps", "photoediting"],
    ["seo", "searchengineoptimization"],
    ["yoga", "fitness", "workout"],
    ["guitar", "music"],
    ["english", "spokenenglish", "communication"],
];

const SYNONYM_MAP = SYNONYM_GROUPS.reduce((map, group) => {
    const canonical = group[0];

    for (const word of group) {
        const existing = map.get(word) || new Set();

        for (const related of group) {
            existing.add(related);
        }

        existing.add(canonical);
        map.set(word, existing);
    }

    return map;
}, new Map());

export const tokenize = (value) => {
    if (!value) {
        return [];
    }

    return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9+#.\s]/g, " ")
        .split(/\s+/)
        .map((token) => token.trim())
        .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
};

export const expandTokens = (tokens) => {
    const expanded = new Set();

    for (const token of tokens) {
        expanded.add(token);

        const compact = token.replace(/[^a-z0-9]/g, "");
        const related = SYNONYM_MAP.get(compact);

        if (related) {
            for (const word of related) {
                expanded.add(word);
            }
        }
    }

    return expanded;
};

/**
 * Similarity between two short texts in the 0..1 range.
 * Exact (normalized) equality short-circuits to 1.
 */
export const textSimilarity = (left, right) => {
    const leftText = String(left || "").trim().toLowerCase();
    const rightText = String(right || "").trim().toLowerCase();

    if (!leftText || !rightText) {
        return 0;
    }

    if (leftText === rightText) {
        return 1;
    }

    const leftTokens = expandTokens(tokenize(leftText));
    const rightTokens = expandTokens(tokenize(rightText));

    if (leftTokens.size === 0 || rightTokens.size === 0) {
        return 0;
    }

    let intersection = 0;

    for (const token of leftTokens) {
        if (rightTokens.has(token)) {
            intersection += 1;
        }
    }

    if (intersection === 0) {
        const containment =
            leftText.includes(rightText) || rightText.includes(leftText);

        return containment ? 0.6 : 0;
    }

    const union = new Set([...leftTokens, ...rightTokens]).size;
    const jaccard = intersection / union;

    // Containment matters more than symmetry for short skill titles.
    const coverage =
        intersection / Math.min(leftTokens.size, rightTokens.size);

    return Math.min(1, 0.4 * jaccard + 0.6 * coverage);
};

export const arraySimilarity = (leftTags = [], rightTags = []) => {
    if (!leftTags.length || !rightTags.length) {
        return 0;
    }

    const left = expandTokens(leftTags.map((tag) => String(tag).toLowerCase()));
    const right = expandTokens(
        rightTags.map((tag) => String(tag).toLowerCase())
    );

    let intersection = 0;

    for (const tag of left) {
        if (right.has(tag)) {
            intersection += 1;
        }
    }

    if (intersection === 0) {
        return 0;
    }

    return intersection / Math.min(left.size, right.size);
};
