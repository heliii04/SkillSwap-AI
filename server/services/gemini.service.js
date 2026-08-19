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
    const rawLower = rawMessage.toLowerCase().trim();

    // 0a. Vague pronoun follow-ups like "whats the steps??", "give me info about it", "tell me more about it"
    // These don't refer to a specific skill — ask for clarification instead of echoing the raw text
    const isVagueReference = /\b(it|this|that|these|those|about it|about this|steps of it|info about it|info about this|more about it|more about this|steps\??|steps of|the steps)\b/i.test(rawLower)
        || /^(give me info|whats the steps|what are the steps|how to start|tell me more|more info|explain it|what is it|give info|get info|steps|more details|detail|details|elaborate)\b/i.test(rawLower.replace(/[?!]+$/, '').trim());

    if (isVagueReference) {
        return "Great question! 😊 Could you let me know which specific skill or topic you'd like to explore? For example — are you curious about **React**, **Python**, **UI/UX Design**, **Data Science**, or something else? Just name the skill and I'll give you a detailed guide! 🚀";
    }


    // 0b. Learning path / how-to queries ("how to learn X", "kaise sikhu", "steps to learn X")
    const isLearningPathQuery = /\b(how to learn|steps to learn|how do i learn|how can i learn|kaise sikhu|kese sikhu|kahan se sikhu|where to learn|how to start learning|roadmap for|sikhna hai|sikhna chahta|sikhna chahti|learn from scratch|beginner guide|steps for|learning path|course for)\b/i.test(rawLower);

    if (isLearningPathQuery) {
        const skillRaw = rawLower
            .replace(/\b(how to learn|steps to learn|kaise sikhu|kese sikhu|kahan se sikhu|where to learn|how to start learning|roadmap for|sikhna hai|steps for|learning path|course for)\b/gi, '')
            .replace(/[?!.,]/g, '')
            .trim();
        const resolvedSkill = resolveCanonicalSkill(skillRaw);
        const skillName = resolvedSkill
            ? resolvedSkill.title
            : (skillRaw.length > 1 ? skillRaw.charAt(0).toUpperCase() + skillRaw.slice(1) : 'this skill');
        // Detect if user wrote in English or Hindi/Hinglish
        const isEnglishQuery = /^[a-zA-Z0-9\s.,?!'"-]+$/.test(rawMessage.trim());
        if (isEnglishQuery) {
            return '🚀 Here are the best ways to learn **' + skillName + '** on SkillSwap!\n\n📍 **Roadmap** — Click the \'Roadmap\' tab to generate a personalized week-by-week learning plan tailored to your level!\n\n🧠 **Quiz** — Use the \'Quiz\' tab to practice with auto-generated MCQs, Q&A, and Coding questions to measure your progress!\n\n🤝 **Swap Request** — Find mentors who teach **' + skillName + '** on SkillSwap, send them a match request, and learn 1-on-1 through skill exchange!\n\nAll three features combined will make your **' + skillName + '** learning journey effective and fun. Start today! 💪';
        }
        return '🚀 SkillSwap pe **' + skillName + '** sikhne ke kai behtareen tarike hain!\n\n📍 **Roadmap** — \'Roadmap\' tab pe click karo aur ek personalized week-by-week learning plan generate karo apne level ke hisaab se!\n\n🧠 **Quiz** — \'Quiz\' tab se auto-generated MCQs, Q&A aur Coding questions ke sath apna knowledge test karo aur progress measure karo!\n\n🤝 **Swap Request** — SkillSwap pe **' + skillName + '** sikhane wale mentors ko dhundo, unhe match request bhejo, aur 1-on-1 skill exchange se seekho!\n\nIn teeno features se aap effectively **' + skillName + '** sikh sakte hain. Shuru karo aaj! 💪';
    }

    let cleanTopic = rawMessage
        .replace(/^(give me mentors (for|in|on)?|find mentors (for|in|on)?|show mentors (for|in|on)?|recommend mentors (for|in|on)?|who teaches|tell me about|what is|how to learn|explain|about|description of|details of)\s+/i, "")
        .replace(/^(mentors|mentor|mentors for|mentor for)\s+/i, "")
        .replace(/\s+(mentors|mentor)$/i, "")
        .trim();
    
    // Auto-correct spelling using canonical skill mapping if available
    const canonical = resolveCanonicalSkill(cleanTopic) || resolveCanonicalSkill(rawMessage);
    const correctTitle = canonical ? canonical.title : (cleanTopic || rawMessage.trim());
    const lower = correctTitle.toLowerCase().trim();
    
    // 0b. Handle generic mentor lookup queries without repeating user prompt
    if (/\b(give me mentors|find mentors|show mentors|recommend mentors|who are the mentors|list mentors)\b/i.test(rawLower) && (!cleanTopic || lower === "mentors" || lower === "mentor" || lower.includes("give me mentors"))) {
        return "SkillSwap features active mentors across Tech, Design, Business, Languages, Music, and Fitness! You can search for specific skills to connect with available mentors and send match requests directly.";
    }

    if (/\b(ai assistant|skillswap ai|assistant)\b/i.test(rawLower) && !lower.includes("machine learning")) {
        return "SkillSwap AI Assistant helps you discover mentors, create personalized week-by-week learning roadmaps, practice with quizzes, and find the right skill partners for your learning journey! You can ask me to generate a roadmap, search for mentors, or guide your learning goals.";
    }
    
    // 1. React
    if (lower === "react" || lower.includes("reactjs") || lower.includes("react js") || lower.includes("react native")) {
        return "React is a modern, component-based JavaScript library developed by Meta for building dynamic, high-performance user interfaces. Core concepts to master include JSX syntax, Functional Components, State Management (`useState`, `useReducer`), Side-Effects (`useEffect`), Context API, and Routing (React Router). Learning React allows you to build fast single-page web applications and cross-platform mobile apps.";
    }

    // 2. Python
    if (lower === "python" || lower.includes("django") || lower.includes("flask") || lower.includes("fastapi")) {
        return "Python is a versatile, high-level programming language famous for its clean, readable syntax and massive library ecosystem. Key topics include Data Structures (Lists, Dictionaries, Sets), Object-Oriented Programming (OOP), Web Frameworks (Django, Flask), Data Science tools (Pandas, NumPy), and AI/ML (PyTorch, TensorFlow). Python is ideal for web development, automation, and data analytics.";
    }

    // 3. JavaScript & Node.js
    if (lower === "javascript" || lower === "node.js" || lower.includes("nodejs") || lower.includes("express")) {
        return "JavaScript is the primary programming language of the Web, powering both dynamic client-side UIs and scalable backend servers via Node.js & Express. Essential concepts include ES6+ features (Arrow Functions, Destructuring, Promises, Async/Await), Event Loops, DOM Manipulation, and RESTful API Architecture. Mastering JavaScript empowers you to build complete full-stack web applications.";
    }

    // 4. Data Science & Data Analytics
    if (lower === "data science" || lower.includes("data analytics") || lower.includes("data analyst") || lower.includes("tableau") || lower.includes("power bi")) {
        return "Data Science is an interdisciplinary field that extracts actionable insights and predictive intelligence from complex data. Key pillars to learn include Statistical Analysis, Data Cleaning & Wrangling (Pandas, SQL), Data Visualization (Matplotlib, Tableau, Power BI), and Machine Learning models (Regression, Classification, Clustering). Data Science enables data-driven decision making across industries.";
    }

    // 5. AI & Machine Learning
    if (lower === "ai & machine learning" || lower.includes("machine learning") || lower.includes("artificial intelligence") || lower.includes("deep learning")) {
        return "Artificial Intelligence & Machine Learning focus on building systems that learn patterns from data, automate decision-making, and process natural language. Key concepts include Supervised & Unsupervised Learning, Neural Networks, Deep Learning frameworks (TensorFlow, PyTorch), Natural Language Processing (NLP), and Computer Vision.";
    }

    // 6. UI/UX Design & Figma
    if (lower === "ui/ux design" || lower.includes("design") || lower.includes("ui") || lower.includes("ux") || lower.includes("figma")) {
        return "UI/UX Design combines visual aesthetics (User Interface) with human-centered user experience (User Experience). UI focuses on typography, color theory, layout grids, and visual hierarchy. UX focuses on user research, wireframing, information architecture, usability testing, and interactive prototyping in tools like Figma.";
    }

    // 7. HTML & CSS
    if (lower === "html & css" || lower.includes("html") || lower.includes("css") || lower.includes("tailwind") || lower.includes("bootstrap")) {
        return "HTML & CSS form the fundamental building blocks of the Web. HTML5 provides structural semantic markup for web content, while CSS3 handles styling, responsive layouts (Flexbox, Grid), animations, and modern utility frameworks like Tailwind CSS & Bootstrap.";
    }

    // 8. SQL & Databases
    if (lower === "sql & databases" || lower.includes("sql") || lower.includes("database") || lower.includes("mongodb") || lower.includes("postgres")) {
        return "SQL & Database Engineering focus on managing, querying, and structuring persistent data efficiently. Relational databases (PostgreSQL, MySQL) use SQL queries, schema constraints, and joins. NoSQL databases (MongoDB) store unstructured/semi-structured JSON documents for high-speed horizontal scaling.";
    }

    // 9. Cloud & DevOps
    if (lower === "cloud & devops" || lower.includes("devops") || lower.includes("docker") || lower.includes("kubernetes") || lower.includes("aws")) {
        return "Cloud Engineering & DevOps automate application deployment pipelines and infrastructure management. Key skills include Containerization (Docker), Orchestration (Kubernetes), CI/CD Automation (GitHub Actions, Jenkins), Cloud Platforms (AWS, Azure, GCP), and Infrastructure as Code (Terraform).";
    }

    // 10. Mobile App Development & Flutter
    if (lower === "mobile app development" || lower.includes("flutter") || lower.includes("android") || lower.includes("ios") || lower.includes("swift") || lower.includes("kotlin")) {
        return "Mobile App Development involves building cross-platform or native mobile applications for Android & iOS using frameworks like Flutter (Dart) or React Native (JavaScript). Key topics include Responsive UI layouts, State Management, Navigation, Local DB Storage, and Native API Integration.";
    }

    // 11. Languages (English, Spanish, French, German, Hindi, Japanese)
    if (/\b(english|spanish|french|german|hindi|japanese|language)\b/i.test(lower)) {
        return `${correctTitle} language learning focuses on building practical conversational fluency, listening comprehension, vocabulary, and proper grammar. Key learning areas include pronunciation, sentence structure, idiomatic expressions, and real-world 1-on-1 speaking practice. On SkillSwap, you can pair up with native speakers for language exchange!`;
    }

    // 12. Music & Arts (Guitar, Piano, Singing, Music Production, Drawing)
    if (/\b(guitar|piano|singing|music|art|drawing|painting)\b/i.test(lower)) {
        return `${correctTitle} is a creative discipline combining foundational technique, practice routines, and artistic expression. Core areas include rhythm, ear training, scales/chords, composition, and performance confidence. On SkillSwap, you can connect with experienced mentors to jam, learn techniques, and receive feedback!`;
    }

    // 13. Fitness & Lifestyle (Yoga, Fitness, Cooking, Photography)
    if (/\b(yoga|fitness|gym|cooking|baking|photography)\b/i.test(lower)) {
        return `${correctTitle} focuses on practical mastery, proper technique, and daily practice habits. Key aspects include form alignment, safety/consistency, tools & materials, and step-by-step skill execution. Connect with mentors on SkillSwap to share routines and accelerate your growth!`;
    }

    // 14. Business, Marketing & Other Skills
    const topicLabel = correctTitle.replace(/^(give me|find|show|recommend|tell me about|explain)\s+/i, "").trim();
    return `Learning ${topicLabel || "new skills"} is great for personal and professional growth. Focus on building strong foundational concepts, understanding industry best practices, and applying your knowledge through practical hands-on projects. On SkillSwap, you can connect with mentors who teach ${topicLabel || "these skills"} and exchange skills 1-on-1!`;
};

export const streamChatWithGemini = async (prompt, systemInstruction, onChunk) => {
    const targetMsg = extractLatestUserMessage(prompt);
    const mentorMatch = systemInstruction?.match(/💡 Top mentors on SkillSwap for this skill:[\s\S]*/);
    const mentorSuffix = mentorMatch ? "\n\n" + mentorMatch[0] : "";

    if (!env.ai.apiKey) {
        const isGreeting = /^(hello|hi|hey|hy|hola|namaste|good\s*morning|good\s*afternoon|good\s*evening|gm|gn)\b[\s!?.]*$/i.test(targetMsg);
        const isNonSkill = !isGreeting && /\b(who is|tell me a story|sing a song|what is your name|whats ur name|whats your name|what's your name|who are you|who r u|how old are you|where do you live|who made you|your name|ur name|what is ur name|how are you|how r u|how are u|hru|kaise ho|kese ho|what are you doing|wbu|recipe|maggi|movie|song|joke|gossip|score|ipl)\b/i.test(targetMsg);
        
        const isVagueFollowUp = /^(what(s|'?s)?\s+(the\s+)?(steps|more|next|it|this|that|about it|about this)|tell me more|how (to|do|can)|continue|and then|next step|more details|explain more|detail|elaborate)\b/i.test(targetMsg.trim());
        
        let fallbackText;
        if (isGreeting) {
            fallbackText = "Hey there! 👋 Welcome to SkillSwap AI! I'm your personal learning companion here. Whether you want to explore a new skill, get a step-by-step learning roadmap, take a quiz, or connect with top mentors — I've got you covered! 😊\n\nSo, what skill are you curious about today?";
        } else if (isNonSkill) {
            fallbackText = "Oops, that's a bit outside my zone! 😊 I'm specialized in helping you learn, teach, and exchange skills on SkillSwap. Ask me about any skill like Python, UI/UX Design, React, Data Science, and more — I'd love to help you grow!";
        } else if (isVagueFollowUp) {
            fallbackText = "Great question! 😊 To dive deeper, could you let me know which specific skill or topic you're referring to? For example — are you asking about React, Python, UI/UX Design, or something else? That way I can give you a perfect step-by-step guide!";
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
