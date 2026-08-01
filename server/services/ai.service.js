import crypto from "node:crypto";

import { env } from "../config/env.js";
import logger from "../utils/logger.js";

/*
|--------------------------------------------------------------------------
| AI provider wrapper
|--------------------------------------------------------------------------
|
| Single entry point for every LLM call in the app. Works with any
| OpenAI-compatible chat completions endpoint (OpenAI, OpenRouter, Groq...).
|
| Design rules:
|   - Never throw at the call site: callers get `null` and use their own
|     rule-based fallback, so the product keeps working without a key.
|   - Cache aggressively: identical prompts should not burn tokens twice.
|   - Circuit breaker: after repeated provider failures we stop calling
|     for a cooldown window instead of making every request slow.
|
*/

const CACHE_MAX_ENTRIES = 500;

const cache = new Map();

const breaker = {
    consecutiveFailures: 0,
    openedAt: 0,
};

const buildCacheKey = (payload) =>
    crypto
        .createHash("sha256")
        .update(JSON.stringify(payload))
        .digest("hex");

const readCache = (key) => {
    const entry = cache.get(key);

    if (!entry) {
        return null;
    }

    if (Date.now() > entry.expiresAt) {
        cache.delete(key);

        return null;
    }

    // Refresh recency for the naive LRU eviction below.
    cache.delete(key);
    cache.set(key, entry);

    return entry.value;
};

const writeCache = (key, value, ttlMs) => {
    if (cache.size >= CACHE_MAX_ENTRIES) {
        const oldestKey = cache.keys().next().value;

        cache.delete(oldestKey);
    }

    cache.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
    });
};

const isBreakerOpen = () => {
    if (breaker.consecutiveFailures < env.ai.breakerThreshold) {
        return false;
    }

    const cooledDown =
        Date.now() - breaker.openedAt > env.ai.breakerCooldownMs;

    if (cooledDown) {
        breaker.consecutiveFailures = 0;
        breaker.openedAt = 0;

        return false;
    }

    return true;
};

const recordFailure = () => {
    breaker.consecutiveFailures += 1;

    if (breaker.consecutiveFailures === env.ai.breakerThreshold) {
        breaker.openedAt = Date.now();

        logger.warn(
            `AI provider disabled for ${Math.round(
                env.ai.breakerCooldownMs / 1000
            )}s after ${breaker.consecutiveFailures} consecutive failures`
        );
    }
};

export const isAiEnabled = () =>
    Boolean(env.ai.enabled && env.ai.apiKey) && !isBreakerOpen();

const extractJson = (content) => {
    if (!content) {
        return null;
    }

    const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = (fenced ? fenced[1] : content).trim();

    const start = candidate.search(/[[{]/);

    if (start === -1) {
        return null;
    }

    const end = Math.max(
        candidate.lastIndexOf("}"),
        candidate.lastIndexOf("]")
    );

    if (end <= start) {
        return null;
    }

    try {
        return JSON.parse(candidate.slice(start, end + 1));
    } catch {
        return null;
    }
};

/**
 * Ask the model for a JSON answer.
 *
 * @returns {Promise<object|array|null>} parsed JSON, or null when AI is
 * unavailable / the provider failed / the answer was not valid JSON.
 */
export const askJson = async ({
    system,
    prompt,
    maxTokens = 700,
    temperature = 0.4,
    cacheTtlMs = env.ai.cacheTtlMs,
}) => {
    if (!isAiEnabled()) {
        return null;
    }

    const body = {
        model: env.ai.model,
        temperature,
        max_tokens: maxTokens,
        response_format: {
            type: "json_object",
        },
        messages: [
            {
                role: "system",
                content: `${system}\n\nAlways reply with a single valid JSON object. No prose, no markdown.`,
            },
            {
                role: "user",
                content: prompt,
            },
        ],
    };

    const cacheKey = buildCacheKey(body);
    const cached = readCache(cacheKey);

    if (cached) {
        return cached;
    }

    const controller = new AbortController();
    const timeout = setTimeout(
        () => controller.abort(),
        env.ai.timeoutMs
    );

    try {
        const response = await fetch(
            `${env.ai.baseUrl.replace(/\/$/, "")}/chat/completions`,
            {
                method: "POST",
                signal: controller.signal,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${env.ai.apiKey}`,
                    // Recommended by OpenRouter, ignored by other providers.
                    "HTTP-Referer": env.clientUrl,
                    "X-Title": "SkillSwap AI",
                },
                body: JSON.stringify(body),
            }
        );

        if (!response.ok) {
            const details = await response.text();

            throw new Error(
                `AI provider responded ${response.status}: ${details.slice(0, 200)}`
            );
        }

        const payload = await response.json();
        const content = payload?.choices?.[0]?.message?.content;
        const parsed = extractJson(content);

        if (!parsed) {
            throw new Error("AI provider returned non-JSON content");
        }

        breaker.consecutiveFailures = 0;
        writeCache(cacheKey, parsed, cacheTtlMs);

        return parsed;
    } catch (error) {
        recordFailure();

        logger.warn(`AI request failed: ${error.message}`);

        return null;
    } finally {
        clearTimeout(timeout);
    }
};

export const aiStatus = () => ({
    enabled: Boolean(env.ai.enabled && env.ai.apiKey),
    available: isAiEnabled(),
    model: env.ai.apiKey ? env.ai.model : null,
});
