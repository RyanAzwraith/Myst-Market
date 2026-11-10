import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { createWrapper } from "../../utils"
import { server } from "@/core"
import { useCreateForm } from "@/features/review/hook"

describe("useCreateForm intimacy: high", () => {
    it("functionality submits a selected rating and description",
        async () => {
            const create = vi.spyOn(server.review, "create")
                .mockResolvedValue(undefined)
            const { wrapper } = createWrapper()
            const { result } = renderHook(
                () => useCreateForm({ productId: 12 }),
                { wrapper },
            )

            act(() => {
                result.current.bindings.rating.set(4)
                result.current.bindings.description
                    .set("A helpful review.")
            })
            act(() => {
                result.current.handleSubmit({
                    preventDefault: vi.fn(),
                } as never)
            })

            await waitFor(() => expect(create).toHaveBeenCalledWith({
                reviewInput: {
                    rating: 4,
                    description: "A helpful review.",
                },
            }))
        },
    )

    it("requires a rating before submitting", () => {
        const create = vi.spyOn(server.review, "create")
            .mockResolvedValue(undefined)
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => useCreateForm({ productId: 12 }),
            { wrapper },
        )

        act(() => {
            result.current.handleSubmit({
                preventDefault: vi.fn(),
            } as never)
        })

        expect(result.current.errorMsg).toBe("Select Rating")
        expect(create).not.toHaveBeenCalled()
    })

    it("rejects ratings outside the supported range", () => {
        const create = vi.spyOn(server.review, "create")
            .mockResolvedValue(undefined)
        const { wrapper } = createWrapper()
        const { result } = renderHook(
            () => useCreateForm({ productId: 12 }),
            { wrapper },
        )

        act(() => result.current.bindings.rating.set(6))
        act(() => {
            result.current.handleSubmit({
                preventDefault: vi.fn(),
            } as never)
        })

        expect(result.current.errorMsg).toBe("Select Rating")
        expect(create).not.toHaveBeenCalled()
    })
})
