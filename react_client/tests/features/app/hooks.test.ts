import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { createWrapper } from "../../utils"
import { usePerformanceForm } from "@/features/app/hooks"

describe("usePerformanceForm intimacy: low", () => {
    it("functionality exposes the supported default period", () => {
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => usePerformanceForm({}),
            { wrapper },
        )

        expect(result.current.values.period).toBeNull()
        expect(result.current.bindings.period.defaultValue).toBe(30)
        expect(result.current.bindings.period.options).toEqual({
            7: "Last 7 days",
            30: "Last 30 days",
            90: "Last 90 days",
        })
        act(() => result.current.validate())
        expect(result.current.values.period).toBe(30)
    })

    it("submits a selected period", () => {
        const onSubmit = vi.fn()
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => usePerformanceForm({ onSubmit }),
            { wrapper },
        )

        act(() => result.current.bindings.period.set(7))
        act(() => {
            result.current.handleSubmit({
                preventDefault: vi.fn(),
            } as never)
        })

        expect(onSubmit).toHaveBeenCalled()
        expect(onSubmit.mock.calls[0][0]).toEqual({ period: 7 })
    })
})
