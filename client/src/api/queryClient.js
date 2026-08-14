import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes fresh cache (0ms instant navigation load)
            gcTime: 15 * 60 * 1000, // 15 minutes garbage collection window
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            retry: 1,
        },
    },
});

export default queryClient;
