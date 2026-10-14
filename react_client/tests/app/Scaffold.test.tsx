import { screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { Scaffold } from "@/app/Scaffold"
import { server } from "@/core"
import { renderWithRouter, resetAuthState } from "../utils"
import { useAuthState } from "@/features/user"

describe("Scaffold intimacy: high", () => {
    beforeEach(() => {
        resetAuthState()
    })

    it("functionality renders its children and refreshes authentication",
        async () => {
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
            await waitFor(() => expect(refresh).toHaveBeenCalledOnce())
        },
    )

    it("stores the access token returned by authentication refresh",
        async () => {
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
})