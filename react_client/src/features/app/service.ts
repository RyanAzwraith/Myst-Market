import { useQuery } from "@tanstack/react-query"

import { server } from "@/core/server"

export {
    useStatsQuery,
    usePerformanceQuery,
    useAttentionQuery,
    useGraphQuery,
}

function useStatsQuery() {
    return useQuery ({
        queryKey: ["stats"],
        queryFn: () => server.app.getStats(),
        select: data => data.stats 
    })
}

function usePerformanceQuery() {
    return useQuery ({
        queryKey: ["performance"],
        queryFn: () => server.app.getPerformance(),
        select: data => data.performance 
    })
}

function useAttentionQuery() {
    return useQuery ({
        queryKey: ["attention"],
        queryFn: () => server.app.getAttention(),
        select: data => data.attention 
    })
}

function useGraphQuery() {
    return useQuery ({
        queryKey: ["graph"],
        queryFn: () => server.app.getGraph(),
        select: data => data.graphPoints 
    })
}