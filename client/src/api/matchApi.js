import axiosClient from "./axiosClient";

export async function getMyMatches(limit = 10) {
    const response = await axiosClient.get("/matches", {
        params: {
            limit,
        },
    });

    const data = response.data?.data || {};
    return {
        matches: data.matches || [],
        hasTeachSkills: Boolean(data.hasTeachSkills),
        hasLearnSkills: Boolean(data.hasLearnSkills),
    };
}

export async function searchSkills(query, limit = 20) {
    const response = await axiosClient.get("/ai/search", {
        params: {
            q: query,
            limit,
        },
    });

    return response.data?.data;
}

export async function suggestSkillsFromBio(text) {
    const response = await axiosClient.post("/ai/suggest-skills", {
        text,
    });

    return response.data?.data;
}

export async function getSwapRoadmap(requestId) {
    const response = await axiosClient.get(`/ai/roadmap/${requestId}`);

    return response.data?.data?.roadmap || null;
}

export async function generateSwapRoadmap(requestId, regenerate = false) {
    const response = await axiosClient.post(`/ai/roadmap/${requestId}`, {
        regenerate,
    });

    return response.data?.data?.roadmap || null;
}

export async function getIcebreaker(payload) {
    const response = await axiosClient.post("/ai/icebreaker", payload);

    return response.data?.data;
}
