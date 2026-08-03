import { env } from "../config/env.js";

// Note: Although this file is named gemini.service.js, it uses OpenRouter 
// (or any OpenAI-compatible endpoint) as configured in env.ai.baseUrl.
// To use Gemini specifically via OpenRouter, set AI_MODEL="google/gemini-2.5-flash" in your .env

export const chatWithGemini = async (prompt, systemInstruction) => {
    if (!env.ai.apiKey) throw new Error("AI API key is not configured.");

    const messages = [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
    ];

    const response = await fetch(`${env.ai.baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.ai.apiKey}`,
            "HTTP-Referer": env.clientUrl || "http://localhost:5173",
            "X-Title": "SkillSwap AI",
        },
        body: JSON.stringify({
            model: env.ai.model || "google/gemini-2.5-flash",
            messages,
            temperature: 0.7,
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`AI Request failed: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
};

export const generateStructuredContent = async (prompt, systemInstruction, schemaDefinition) => {
    if (!env.ai.apiKey) throw new Error("AI API key is not configured.");

    // We pass the schema shape as a string in the system prompt to force the model
    // to return a valid JSON object matching this structure, since some OpenRouter 
    // models might not strictly enforce JSON Schema natively like the Google SDK does.
    const strictSystemPrompt = `${systemInstruction}\n\nIMPORTANT: You must return ONLY a raw JSON object that strictly matches this schema structure. No markdown formatting, no backticks, no explanations. Just the JSON object.\n\nSchema Structure:\n${JSON.stringify(schemaDefinition)}`;

    const response = await fetch(`${env.ai.baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.ai.apiKey}`,
            "HTTP-Referer": env.clientUrl || "http://localhost:5173",
            "X-Title": "SkillSwap AI",
        },
        body: JSON.stringify({
            model: env.ai.model || "google/gemini-2.5-flash",
            messages: [
                { role: "system", content: strictSystemPrompt },
                { role: "user", content: prompt }
            ],
            temperature: 0.4,
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`AI Request failed: ${error}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Sometimes models still return markdown backticks even when told not to.
    if (content.startsWith("```json")) content = content.replace(/^```json\n/, "").replace(/\n```$/, "");
    if (content.startsWith("```")) content = content.replace(/^```\n/, "").replace(/\n```$/, "");
    
    return JSON.parse(content);
};

// Schema Definitions (Kept similar for prompt structure injection)
export const roadmapSchema = {
    weeks: [
        {
            weekNumber: "number",
            focus: "string",
            tasks: [
                {
                    title: "string",
                    description: "string"
                }
            ]
        }
    ]
};

export const nextFocusSchema = {
    nextFocus: "string",
    message: "string"
};

export const dailyPlanSchema = {
    plan: [
        {
            durationMinutes: "number",
            activity: "string",
            description: "string"
        }
    ],
    totalMinutes: "number"
};

export const quizSchema = {
    questions: [
        {
            type: "MCQ or Coding",
            questionText: "string",
            options: ["string", "string", "string", "string"],
            correctAnswer: "string",
            explanation: "string"
        }
    ]
};
