import axiosClient from "./axiosClient";

export const chatWithAi = async (message, history, sessionId) => {
    const response = await axiosClient.post("/ai/chat", { message, history, sessionId });
    return response.data;
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
