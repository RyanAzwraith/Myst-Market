import userEvent from "@testing-library/user-event"
import { screen, render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ThemeProvider, useTheme } from "@/app/ThemeProvider"

function ThemeConsumer() {
    const { theme, toggleTheme } = useTheme()

    return (
        <>
            <p>Current theme: {theme}</p>
            <button onClick={toggleTheme}>Toggle theme</button>
        </>
    )
}

describe("ThemeProvider intimacy: low", () => {
    it("functionality provides the default light theme", () => {
        render(
            <ThemeProvider>
                <ThemeConsumer />
            </ThemeProvider>,
        )

        expect(screen.getByText("Current theme: light"))
            .toBeInTheDocument()
        expect(document.documentElement)
            .toHaveAttribute("data-theme", "light")
    })

    it("toggles the theme and updates the document attribute", async () => {
        const user = userEvent.setup()

        render(
            <ThemeProvider>
                <ThemeConsumer />
            </ThemeProvider>,
        )

        await user.click(screen.getByRole("button", {
            name: "Toggle theme",
        }))

        expect(screen.getByText("Current theme: dark"))
            .toBeInTheDocument()
        expect(document.documentElement)
            .toHaveAttribute("data-theme", "dark")
    })
})