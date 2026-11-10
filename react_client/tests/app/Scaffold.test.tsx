import { screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { Scaffold } from "@/app/Scaffold"
import { server } from "@/core"
import { renderWithRouter, resetAuthState } from "../utils"
import { useAuthState } from "@/features/user"
import { userFactory } from "../../mock_data/user"

describe("Scaffold intimacy: high", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("renders its children without refreshing a guest session", () => {
            const refresh = vi.spyOn(server.auth, "refresh")
                .mockResolvedValue({ accessToken: "refreshed-token" })

            renderWithRouter(
                <Scaffold>
                    <div>Application content</div>
                </Scaffold>,
                {
                    path: "*",
                    initialPath: "/catalogue",
                },
            )

            expect(screen.getByText("Application content"))
                .toBeInTheDocument()
            expect(refresh).not.toHaveBeenCalled()
        },
    )

    it("refreshes authentication for a persisted user",
        async () => {
            const user = userFactory()
            resetAuthState({ accessToken: null, user })
            vi.spyOn(server.auth, "refresh")
                .mockResolvedValue({ accessToken: "new-token" })

            renderWithRouter(
                <Scaffold>
                    <div>Application content</div>
                </Scaffold>,
                {
                    path: "*",
                    initialPath: "/catalogue",
                },
            )

            await waitFor(() => {
                expect(useAuthState.getState().accessToken)
                    .toBe("new-token")
            })
        },
    )

    it("waits for authentication before rendering a persisted session",
        async () => {
            const user = userFactory()
            resetAuthState({ accessToken: null, user })

            let resolveRefresh:
                ((value: { accessToken: string }) => void) | undefined
            const refreshPromise = new Promise<{ accessToken: string }>(
                resolve => {
                    resolveRefresh = resolve
                },
            )
            vi.spyOn(server.auth, "refresh")
                .mockReturnValue(refreshPromise)

            renderWithRouter(
                <Scaffold>
                    <div>Application content</div>
                </Scaffold>,
                {
                    path: "*",
                    initialPath: "/admin/dashboard",
                },
            )

            expect(screen.queryByText("Application content"))
                .not.toBeInTheDocument()

            resolveRefresh?.({ accessToken: "new-token" })

            await waitFor(() => {
                expect(screen.getByText("Application content"))
                    .toBeInTheDocument()
            })
        },
    )
})