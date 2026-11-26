import type { ReactNode } from "react"

import { screen, render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { App } from "@/app/App"

vi.mock("@/app/PageRoutes", () => ({
    PageRoutesComponent: () => (
        <div data-testid="page-routes">Page routes</div>
    ),
}))

vi.mock("@/app/Scaffold", () => ({
    Scaffold: ({ children }: { children: ReactNode }) => (
        <div data-testid="scaffold">{children}</div>
    ),
}))

describe("App intimacy: high", () => {
    it("functionality renders the application scaffold and routes", () => {
        render(<App />)

        expect(screen.getByTestId("scaffold")).toBeInTheDocument()
        expect(screen.getByTestId("page-routes")).toBeInTheDocument()
        expect(document.title).toBe("Myst Market")
    })
})