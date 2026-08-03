import axiosClient from "./axiosClient";

export const chatWithAi = async (message, history) => {
    const response = await axiosClient.post("/ai/chat", { message, history });
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
