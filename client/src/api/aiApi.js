import axiosClient from "./axiosClient";

export const chatWithAi = async (message, history, sessionId) => {
    const response = await axiosClient.post("/ai/chat", { message, history, sessionId });
    return response.data;
};

export const streamAiChatApi = async ({ message, history, sessionId, onChunk, onDone, onError }) => {
    const token = (await import("./tokenStore")).getAccessToken();
    const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const API_BASE_URL =
        envBaseUrl ||
        (typeof window !== "undefined" && window.location.hostname === "localhost"
            ? "http://localhost:5000/api/v1"
            : "https://skillswap-ai-8ill.onrender.com/api/v1");

    try {
        const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/ai/chat/stream`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: "include",
            body: JSON.stringify({ message, history, sessionId }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let msg = "Failed to communicate with AI stream";
            try {
                const parsed = JSON.parse(errorText);
                msg = parsed.message || msg;
            } catch {}
            throw new Error(msg);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
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
                    if (onDone) onDone();
                    return;
                }

                if (trimmed.startsWith("data: ")) {
                    try {
                        const json = JSON.parse(trimmed.slice(6));
                        if (json.chunk && onChunk) {
                            onChunk(json.chunk, json.sessionId);
                        }
                    } catch {
                        // ignore JSON parse error for partial lines
                    }
                }
            }
        }

        if (onDone) onDone();
    } catch (err) {
        if (onError) onError(err);
        else throw err;
    }
};

export const fetchAiChatSessions = async () => {
    const response = await axiosClient.get("/ai/chat/sessions");
    return response.data;
};

export const deleteAiChatSessionApi = async (sessionId) => {
    const response = await axiosClient.delete(`/ai/chat/sessions/${sessionId}`);
    return response.data;
};

export const clearAllAiChatSessionsApi = async () => {
    const response = await axiosClient.delete("/ai/chat/sessions");
    return response.data;
};

export const generateRoadmap = async (data) => {
    const response = await axiosClient.post("/ai/roadmap/generate", data);
    return response.data;
};

export const updateRoadmapProgress = async (roadmapId, weekNumber, taskTitle, isCompleted) => {
    const response = await axiosClient.patch(`/ai/roadmap/${roadmapId}/progress`, {
        weekNumber,
        taskTitle,
        isCompleted
    });
    return response.data;
};

export const getDailyPlan = async (roadmapId, availableMinutes) => {
    const response = await axiosClient.post(`/ai/roadmap/${roadmapId}/daily-plan`, { availableMinutes });
    return response.data;
};

export const generateQuiz = async (topic, numQuestions) => {
    const response = await axiosClient.post("/ai/quiz", { topic, numQuestions });
    return response.data;
};

export const saveQuizResultApi = async (data) => {
    const response = await axiosClient.post("/ai/quiz/save", data);
    return response.data;
};

export const fetchQuizResultsHistory = async () => {
    const response = await axiosClient.get("/ai/quiz/history");
    return response.data;
};

export const deleteQuizResultApi = async (id) => {
    const response = await axiosClient.delete(`/ai/quiz/history/${id}`);
    return response.data;
};

export const clearAllQuizResultsApi = async () => {
    const response = await axiosClient.delete("/ai/quiz/history");
    return response.data;
};
