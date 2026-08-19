import { env } from "../config/env.js";
import { resolveCanonicalSkill } from "../models/Skill.js";

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

export const extractLatestUserMessage = (prompt) => {
    if (!prompt || typeof prompt !== "string") return "";
    if (prompt.includes("\nuser: ")) {
        const parts = prompt.split("\nuser: ");
        return parts[parts.length - 1].trim();
    }
    return prompt.replace(/^user:\s*/i, "").trim();
};

export const getSkillExplanationFallback = (rawMessage) => {
    const cleanTopic = rawMessage.replace(/^(tell me about|what is|how to learn|explain|about)\s+/i, "").trim();
    
    // Auto-correct spelling using canonical skill mapping if available
    const canonical = resolveCanonicalSkill(cleanTopic) || resolveCanonicalSkill(rawMessage);
    const correctTitle = canonical ? canonical.title : (cleanTopic || rawMessage.trim());
    const lower = correctTitle.toLowerCase().trim();
    
    if (/\b(ai assistant|skillswap ai|assistant)\b/i.test(rawMessage) && !lower.includes("machine learning")) {
        return "SkillSwap AI Assistant helps you discover mentors, create personalized week-by-week learning roadmaps, practice with quizzes, and find the right skill partners for your learning journey! You can ask me to generate a roadmap, search for mentors, or guide your learning goals.";
    }
    if (lower === "data science" || lower.includes("data analytics") || lower.includes("data analyst")) {
        return "Data Science is an interdisciplinary field combining statistics, programming (Python/R), data manipulation (Pandas, SQL), and Machine Learning. On SkillSwap, you can connect with Data Science mentors to learn data visualization, predictive modeling, and real-world projects!";
    }
    if (lower === "react" || lower.includes("reactjs") || lower.includes("react js")) {
        return "React is a popular JavaScript library for building modern, component-based web applications. Key concepts include JSX, Components, Props, State (useState/useEffect), and State Management. On SkillSwap, you can connect with mentors who teach React in exchange for skills you know!";
    }
    if (lower === "python" || lower.includes("django") || lower.includes("flask")) {
        return "Python is a versatile, high-level programming language used in Web Development, Data Science, AI, and Automation. It is beginner-friendly with clean syntax. Key topics include data structures, OOP, frameworks (Django/Flask), and data tools (Pandas/NumPy).";
    }
    if (lower === "javascript" || lower.includes("node.js") || lower.includes("nodejs")) {
        return "JavaScript is the core programming language of the Web. It powers dynamic client-side UIs as well as backend applications via Node.js. Essential concepts include ES6+ syntax, Async/Await, DOM manipulation, and Event loops.";
    }
    if (lower.includes("design") || lower.includes("ui") || lower.includes("ux") || lower.includes("figma")) {
        return "UI/UX Design focuses on crafting intuitive, aesthetic, and user-centric digital experiences. Figma is the leading tool for visual design, prototyping, and wireframing. You can find experienced design mentors on SkillSwap!";
    }

    return `To learn and master "${correctTitle}", focus on core fundamentals, build practical hands-on projects, and practice consistently. On SkillSwap, you can search for mentors teaching "${correctTitle}" and exchange skills directly!`;
};

export const streamChatWithGemini = async (prompt, systemInstruction, onChunk) => {
    const targetMsg = extractLatestUserMessage(prompt);
    const mentorMatch = systemInstruction?.match(/💡 Top mentors on SkillSwap for this skill:[\s\S]*/);
    const mentorSuffix = mentorMatch ? "\n\n" + mentorMatch[0] : "";

    if (!env.ai.apiKey) {
        const isGreeting = /^(hello|hi|hey|hy|hola|namaste|good\s*morning|good\s*afternoon|good\s*evening|gm|gn)\b[\s!?.]*$/i.test(targetMsg);
        const isNonSkill = !isGreeting && /\b(who is|tell me a story|sing a song|what is your name|whats ur name|whats your name|what's your name|who are you|who r u|how old are you|where do you live|who made you|your name|ur name|what is ur name|how are you|how r u|how are u|hru|kaise ho|kese ho|what are you doing|wbu|recipe|maggi|movie|song|joke|gossip|score|ipl)\b/i.test(targetMsg);
        
        let fallbackText;
        if (isGreeting) {
            fallbackText = "Hello! Welcome to SkillSwap AI. I am your AI learning assistant. I can help you navigate skill swaps, learning goals, and mentorship on the platform! What would you like to learn today?";
        } else if (isNonSkill) {
            fallbackText = "Sorry, I am your SkillSwap AI assistant and I can only help you with skill-related topics, learning, teaching, or platform queries. What skill would you like to learn today?";
        } else {
            fallbackText = getSkillExplanationFallback(targetMsg) + mentorSuffix;
        }
        
        const words = fallbackText.split(" ");
        for (const word of words) {
            onChunk(word + " ");
            await new Promise((r) => setTimeout(r, 20));
        }
        return fallbackText;
    }

    const messages = [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
    ];

    try {
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
                stream: true,
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`AI Request failed: ${errorText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = "";
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith(":")) continue;

                if (trimmed === "data: [DONE]") {
                    break;
                }

                if (trimmed.startsWith("data: ")) {
                    try {
                        const json = JSON.parse(trimmed.slice(6));
                        const content = json.choices?.[0]?.delta?.content || "";
                        if (content) {
                            fullText += content;
                            onChunk(content);
                        }
                    } catch {
                        // ignore JSON parse error for incomplete chunks
                    }
                }
            }
        }

        return fullText || "No response generated.";
    } catch (err) {
        console.warn("Streaming AI failed, falling back to simulated stream:", err.message);
        try {
            const fullContent = await chatWithGemini(prompt, systemInstruction);
            const words = fullContent.split(" ");
            for (const word of words) {
                onChunk(word + " ");
                await new Promise((r) => setTimeout(r, 15));
            }
            return fullContent;
        } catch (fallbackErr) {
            const isGreeting = /^(hello|hi|hey|hy|hola|namaste|good\s*morning|good\s*afternoon|good\s*evening|gm|gn)\b[\s!?.]*$/i.test(targetMsg);
            const isNonSkill = !isGreeting && /\b(who is|tell me a story|sing a song|what is your name|whats ur name|whats your name|what's your name|who are you|who r u|how old are you|where do you live|who made you|your name|ur name|what is ur name|how are you|how r u|how are u|hru|kaise ho|kese ho|what are you doing|wbu|recipe|maggi|movie|song|joke|gossip|score|ipl)\b/i.test(targetMsg);
            
            let friendlyFallback;
            if (isGreeting) {
                friendlyFallback = "Hello! Welcome to SkillSwap AI. I am your AI learning assistant. I can help you navigate skill swaps, learning goals, and mentorship on the platform! What would you like to learn today?";
            } else if (isNonSkill) {
                friendlyFallback = "Sorry, I am your SkillSwap AI assistant and I can only help you with skill-related topics, learning, teaching, or platform queries. What skill would you like to learn today?";
            } else {
                friendlyFallback = getSkillExplanationFallback(targetMsg) + mentorSuffix;
            }
            
            const words = friendlyFallback.split(" ");
            for (const word of words) {
                onChunk(word + " ");
                await new Promise((r) => setTimeout(r, 15));
            }
            return friendlyFallback;
        }
    }
};

export const getDailyPlanFallback = (prompt) => {
    const minsMatch = prompt.match(/(\d+)\s*minutes/i);
    const totalMinutes = minsMatch ? parseInt(minsMatch[1], 10) : 45;

    const conceptMins = Math.max(10, Math.round(totalMinutes * 0.35));
    const practiceMins = Math.max(15, Math.round(totalMinutes * 0.45));
    const reviewMins = Math.max(5, totalMinutes - conceptMins - practiceMins);

    return {
        plan: [
            {
                durationMinutes: conceptMins,
                activity: "Concept Review & Fundamentals",
                description: "Deep dive into core principles, documentation, and key theoretical concepts for today's target module."
            },
            {
                durationMinutes: practiceMins,
                activity: "Hands-on Practice & Coding Exercises",
                description: "Build practical mini-projects, implement code snippets, and solve real-world exercises."
            },
            {
                durationMinutes: reviewMins,
                activity: "Quick Quiz & Progress Review",
                description: "Test your understanding with self-assessment questions and review key takeaways."
            }
        ],
        totalMinutes
    };
};

export const getRoadmapFallback = (prompt) => {
    const topicMatch = prompt.match(/learn\s+([^.\n]+)/i);
    const topic = topicMatch ? topicMatch[1].trim() : "Target Skill";

    return {
        weeks: [
            {
                weekNumber: 1,
                focus: `Introduction & Fundamentals of ${topic}`,
                tasks: [
                    { title: "Core Concepts & Setup", description: "Learn the foundational principles, setup environment, and explore syntax." },
                    { title: "Basic Syntax & Data Structures", description: "Master fundamental data structures, control flows, and variables." },
                    { title: "First Hands-on Project", description: "Build a small starter application to apply foundational concepts." }
                ]
            },
            {
                weekNumber: 2,
                focus: `Intermediate Workflows & Best Practices`,
                tasks: [
                    { title: "Advanced Patterns & Architecture", description: "Understand modular design, error handling, and standard libraries." },
                    { title: "Database & API Integration", description: "Connect application logic with persistent data storage and APIs." }
                ]
            },
            {
                weekNumber: 3,
                focus: `Capstone Project & Real-World Application`,
                tasks: [
                    { title: "Capstone Project Development", description: "Design and implement a complete end-to-end project." },
                    { title: "Testing & Code Optimization", description: "Write unit tests, optimize performance, and prepare for deployment." }
                ]
            }
        ]
    };
};

export const getQuizFallback = (prompt) => {
    const topicMatch = prompt.match(/topic:\s*([^.\n]+)/i) || prompt.match(/topic\s+([^.\n]+)/i) || prompt.match(/quiz\s+on\s+([^.\n]+)/i);
    const rawTopic = topicMatch ? topicMatch[1].trim() : "Skill Concepts";
    const canonical = resolveCanonicalSkill(rawTopic);
    const topic = canonical ? canonical.title : rawTopic;

    return {
        questions: [
            // 4 MCQs
            {
                type: "MCQ",
                questionText: `What is the primary core concept of ${topic}?`,
                options: [
                    `Understanding foundational principles and core architecture of ${topic}`,
                    `Hardcoding static variables in production without error handling`,
                    `Ignoring standard syntax conventions and system constraints`,
                    `None of the above`
                ],
                correctAnswer: `Understanding foundational principles and core architecture of ${topic}`,
                explanation: `${topic} relies heavily on core architectural principles for building scalable and maintainable solutions.`
            },
            {
                type: "MCQ",
                questionText: `Which of the following is considered a primary best practice in ${topic}?`,
                options: [
                    `Writing modular, clean, and well-documented code/workflows`,
                    `Storing sensitive credentials in plain text`,
                    `Avoiding error handling and exception logging`,
                    `Using deprecated legacy APIs without migration`
                ],
                correctAnswer: `Writing modular, clean, and well-documented code/workflows`,
                explanation: `Modularity, clean structure, and documentation ensure long-term maintainability.`
            },
            {
                type: "MCQ",
                questionText: `How do you optimize performance and execution speed when working with ${topic}?`,
                options: [
                    `By identifying execution bottlenecks and optimizing algorithm complexity`,
                    `By allocating unnecessary redundant memory buffers`,
                    `By disabling response caching mechanisms`,
                    `By executing infinite unthrottled loops`
                ],
                correctAnswer: `By identifying execution bottlenecks and optimizing algorithm complexity`,
                explanation: `Profiling performance bottlenecks and refactoring logic is key to high efficiency.`
            },
            {
                type: "MCQ",
                questionText: `What is the recommended pattern for error handling in ${topic}?`,
                options: [
                    `Using structured try-catch blocks and logging errors gracefully`,
                    `Swallowing all exceptions silently without logging`,
                    `Crashing the entire process immediately on minor errors`,
                    `Disabling runtime validation checks`
                ],
                correctAnswer: `Using structured try-catch blocks and logging errors gracefully`,
                explanation: `Graceful error handling prevents application crashes and helps isolate failures.`
            },

            // 3 Q/A Questions
            {
                type: "Q/A",
                questionText: `Explain the fundamental lifecycle and architecture when building applications with ${topic}.`,
                options: [],
                correctAnswer: `${topic} applications operate on a structured execution lifecycle: initialization, state management, operational logic, and cleanup. Managing component lifecycles properly prevents memory leaks and ensures smooth execution.`,
                explanation: `Understanding lifecycle phases is critical for resource management and application stability.`
            },
            {
                type: "Q/A",
                questionText: `What are the key advantages of using ${topic} over traditional alternatives?`,
                options: [],
                correctAnswer: `${topic} provides superior performance, modular architecture, strong ecosystem support, and developer tooling that accelerates project delivery while maintaining high code quality.`,
                explanation: `Evaluating technical trade-offs helps select the right tools for production workloads.`
            },
            {
                type: "Q/A",
                questionText: `Describe the step-by-step troubleshooting workflow when diagnosing a bug in ${topic}.`,
                options: [],
                correctAnswer: `1. Inspect stack trace and error logs.\n2. Isolate the failing component or logic.\n3. Reproduce the bug with test cases.\n4. Apply a root-cause fix.\n5. Run automated tests to verify stability.`,
                explanation: `A methodical debugging process prevents superficial symptom patches and ensures bug resolution.`
            },

            // 3 Coding Questions
            {
                type: "Coding",
                questionText: `Write a clean function/script in ${topic} to validate and transform an array of data items.`,
                options: [],
                correctAnswer: `// Data Transformer in ${topic}\nfunction processItems(items) {\n    if (!Array.isArray(items)) return [];\n    return items\n        .filter(item => item !== null && item !== undefined)\n        .map(item => String(item).trim().toUpperCase());\n}`,
                explanation: `Demonstrates array filtering, sanitization, and functional transformation.`
            },
            {
                type: "Coding",
                questionText: `Implement an asynchronous helper function in ${topic} that fetches data safely with error handling.`,
                options: [],
                correctAnswer: `// Async Data Fetcher in ${topic}\nasync function safeFetch(url) {\n    try {\n        const res = await fetch(url);\n        if (!res.ok) throw new Error(\`HTTP error \${res.status}\`);\n        return await res.json();\n    } catch (err) {\n        console.error("Fetch failed:", err.message);\n        return null;\n    }\n}`,
                explanation: `Demonstrates async/await, response status checking, and try-catch error safety.`
            },
            {
                type: "Coding",
                questionText: `Write a utility function in ${topic} to sanitize and format user input strings.`,
                options: [],
                correctAnswer: `// String Sanitizer in ${topic}\nfunction sanitizeInput(str) {\n    if (typeof str !== 'string') return '';\n    return str.trim().toLowerCase().replace(/\\s+/g, ' ');\n}`,
                explanation: `Demonstrates string type validation, whitespace trimming, and canonical normalization.`
            }
        ]
    };
};

export const getNextFocusFallback = () => ({
    nextFocus: "Intermediate Concepts & Practice Exercises",
    message: "Great progress! Keep building hands-on projects to solidify your learning."
});

export const generateStructuredContent = async (prompt, systemInstruction, schemaDefinition) => {
    if (!env.ai.apiKey) {
        if (schemaDefinition === dailyPlanSchema) return getDailyPlanFallback(prompt);
        if (schemaDefinition === roadmapSchema) return getRoadmapFallback(prompt);
        if (schemaDefinition === quizSchema) return getQuizFallback(prompt);
        if (schemaDefinition === nextFocusSchema) return getNextFocusFallback();
        return getDailyPlanFallback(prompt);
    }

    const strictSystemPrompt = `${systemInstruction}\n\nIMPORTANT: You must return ONLY a raw JSON object that strictly matches this schema structure. No markdown formatting, no backticks, no explanations. Just the JSON object.\n\nSchema Structure:\n${JSON.stringify(schemaDefinition)}`;

    try {
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

        if (content.startsWith("```json")) content = content.replace(/^```json\n/, "").replace(/\n```$/, "");
        if (content.startsWith("```")) content = content.replace(/^```\n/, "").replace(/\n```$/, "");

        return JSON.parse(content);
    } catch (err) {
        console.warn("Structured AI call failed, falling back to schema fallback:", err.message);
        if (schemaDefinition === dailyPlanSchema) return getDailyPlanFallback(prompt);
        if (schemaDefinition === roadmapSchema) return getRoadmapFallback(prompt);
        if (schemaDefinition === quizSchema) return getQuizFallback(prompt);
        if (schemaDefinition === nextFocusSchema) return getNextFocusFallback();
        return getDailyPlanFallback(prompt);
    }
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
