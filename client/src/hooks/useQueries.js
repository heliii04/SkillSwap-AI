import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";

/*
|--------------------------------------------------------------------------
| Custom TanStack Query Hooks for SkillSwap AI
|--------------------------------------------------------------------------
|
| Provides Stale-While-Revalidate caching, zero-latency page transitions,
| and automatic background cache invalidation on mutations.
|
*/

// Query keys constants
export const QUERY_KEYS = {
    BROWSE_SKILLS: ["skills", "browse"],
    MY_TEACH_SKILLS: ["skills", "teach"],
    MY_LEARN_SKILLS: ["skills", "learn"],
    RECOMMENDATIONS: ["matches", "recommendations"],
    NOTIFICATIONS: ["notifications"],
    CHATS: ["chats"],
};

/**
 * Fetch and cache browse skills feed
 */
export function useBrowseSkillsQuery(options = {}) {
    return useQuery({
        queryKey: QUERY_KEYS.BROWSE_SKILLS,
        queryFn: async () => {
            const response = await axiosClient.get("/skills/browse");
            return response.data?.data || [];
        },
        ...options,
    });
}

/**
 * Fetch and cache user teaching skills
 */
export function useMyTeachSkillsQuery(options = {}) {
    return useQuery({
        queryKey: QUERY_KEYS.MY_TEACH_SKILLS,
        queryFn: async () => {
            const response = await axiosClient.get("/skills/teach");
            return response.data?.data?.skills || [];
        },
        ...options,
    });
}

/**
 * Fetch and cache user learning skills
 */
export function useMyLearnSkillsQuery(options = {}) {
    return useQuery({
        queryKey: QUERY_KEYS.MY_LEARN_SKILLS,
        queryFn: async () => {
            const response = await axiosClient.get("/skills/learn");
            return response.data?.data?.skills || [];
        },
        ...options,
    });
}

/**
 * Fetch and cache AI Recommendations & Matches
 */
export function useRecommendationsQuery(limit = 10, options = {}) {
    return useQuery({
        queryKey: [...QUERY_KEYS.RECOMMENDATIONS, limit],
        queryFn: async () => {
            const response = await axiosClient.get(`/matches?limit=${limit}`);
            const data = response.data?.data || {};
            return {
                matches: data.matches || [],
                hasTeachSkills: Boolean(data.hasTeachSkills),
                hasLearnSkills: Boolean(data.hasLearnSkills),
            };
        },
        ...options,
    });
}

/**
 * Fetch and cache user notifications list
 */
export function useNotificationsQuery(options = {}) {
    return useQuery({
        queryKey: QUERY_KEYS.NOTIFICATIONS,
        queryFn: async () => {
            const response = await axiosClient.get("/notifications");
            return response.data?.data?.notifications || [];
        },
        ...options,
    });
}

/**
 * Custom mutation helper with automatic cache invalidation
 */
export function useInvalidateQueries() {
    const queryClient = useQueryClient();

    return {
        invalidateSkills: () => {
            queryClient.invalidateQueries({ queryKey: ["skills"] });
        },
        invalidateMatches: () => {
            queryClient.invalidateQueries({ queryKey: ["matches"] });
        },
        invalidateNotifications: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
        invalidateChats: () => {
            queryClient.invalidateQueries({ queryKey: ["chats"] });
        },
        invalidateAll: () => {
            queryClient.invalidateQueries();
        },
    };
}
