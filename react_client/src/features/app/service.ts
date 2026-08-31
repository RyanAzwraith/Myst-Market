import { useQuery } from "@tanstack/react-query"

import { getServer } from "@/core/server"

export {
    useStatsQuery,
    usePerformanceQuery,
    useAttentionQuery,
    useGraphQuery,
}

function useStatsQuery() {
    return useQuery ({
        queryKey: ["stats"],
        queryFn: () => getServer().app.getStats(),
        select: data => data.stats 
    })
}

function usePerformanceQuery() {
    return useQuery ({
        queryKey: ["performance"],
        queryFn: () => getServer().app.getPerformance(),
        select: data => data.performance 
    })
}

function useAttentionQuery() {
    return useQuery ({
        queryKey: ["attention"],
        queryFn: () => getServer().app.getAttention(),
        select: data => data.attention 
    })
}

function useGraphQuery() {
    return useQuery ({
        queryKey: ["graph"],
        queryFn: () => getServer().app.getGraph(),
        select: data => data.graphPoints 
    })
}