import { renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { createWrapper } from "../../utils"
import {
    attention,
    graphPoints,
    performance,
    stats,
} from "../../../mock_data/app"
import { server } from "@/core"
import {
    useAttentionQuery,
    useGraphQuery,
    usePerformanceQuery,
    useStatsQuery,
} from "@/features/app/service"

describe("useStatsQuery intimacy: medium", () => {
    it("functionality returns dashboard statistics", async () => {
        const getStats = vi.spyOn(server.app, "getStats")
            .mockResolvedValue({ stats })
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useStatsQuery(), { wrapper })

        await waitFor(() => expect(result.current.data).toEqual(stats))
        expect(getStats).toHaveBeenCalledOnce()
    })

    it("exposes a server error when statistics cannot be loaded",
        async () => {
            const error = new Error("Statistics unavailable")
            vi.spyOn(server.app, "getStats").mockRejectedValue(error)
            const { wrapper } = createWrapper()

            const { result } = renderHook(() => useStatsQuery(), { wrapper })

            await waitFor(() => expect(result.current.error).toBe(error))
        },
    )
})

describe("usePerformanceQuery intimacy: medium", () => {
    it("functionality requests performance for the selected period",
        async () => {
            const retrievePerformance = vi.spyOn(
                server.app,
                "retrievePerformance",
            ).mockResolvedValue({ performance })
            const { wrapper } = createWrapper()

            const { result } = renderHook(
                () => usePerformanceQuery({ period: 90 }),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.data).toEqual(performance)
            })
            expect(retrievePerformance).toHaveBeenCalledWith({ period: 90 })
        },
    )

    it("exposes a server error when performance cannot be loaded",
        async () => {
            const error = new Error("Performance unavailable")
            vi.spyOn(server.app, "retrievePerformance")
                .mockRejectedValue(error)
            const { wrapper } = createWrapper()

            const { result } = renderHook(
                () => usePerformanceQuery({ period: 30 }),
                { wrapper },
            )

            await waitFor(() => expect(result.current.error).toBe(error))
        },
    )
})

describe("useAttentionQuery intimacy: medium", () => {
    it("functionality returns dashboard attention counts", async () => {
        const getAttention = vi.spyOn(server.app, "getAttention")
            .mockResolvedValue({ attention })
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useAttentionQuery(), { wrapper })

        await waitFor(() => expect(result.current.data).toEqual(attention))
        expect(getAttention).toHaveBeenCalledOnce()
    })

    it("exposes a server error when attention cannot be loaded", async () => {
        const error = new Error("Attention unavailable")
        vi.spyOn(server.app, "getAttention").mockRejectedValue(error)
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useAttentionQuery(), { wrapper })

        await waitFor(() => expect(result.current.error).toBe(error))
    })
})

describe("useGraphQuery intimacy: medium", () => {
    it("functionality returns graph points", async () => {
        const getGraph = vi.spyOn(server.app, "getGraph")
            .mockResolvedValue({ graphPoints })
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useGraphQuery(), { wrapper })

        await waitFor(() => expect(result.current.data).toEqual(graphPoints))
        expect(getGraph).toHaveBeenCalledOnce()
    })

    it("exposes a server error when graph data cannot be loaded", async () => {
        const error = new Error("Graph unavailable")
        vi.spyOn(server.app, "getGraph").mockRejectedValue(error)
        const { wrapper } = createWrapper()

        const { result } = renderHook(() => useGraphQuery(), { wrapper })

        await waitFor(() => expect(result.current.error).toBe(error))
    })
})
