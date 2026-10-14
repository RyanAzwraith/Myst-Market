import userEvent from "@testing-library/user-event"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ModalTrigger } from "@/shared/composition/ModalTrigger"

describe("ModalTrigger intimacy: medium", () => {
    it("functionality opens a labelled modal from its trigger", async () => {
        const user = userEvent.setup()
        const renderContent = vi.fn(() => (
            <p>Modal content</p>
        ))

        render(
            <ModalTrigger
            button="Open modal"
            dialogLabel="Details"
            render={renderContent}
            />,
        )

        await user.click(screen.getByRole("button", {
            name: "Open modal",
        }))

        expect(screen.getByRole("dialog", {
            name: "Details",
        })).toBeInTheDocument()
        expect(screen.getByText("Modal content"))
            .toBeInTheDocument()
        expect(renderContent).toHaveBeenCalledOnce()
    })

    it("closes the modal when the render callback invokes onClose",
        async () => {
            const user = userEvent.setup()

            render(
                <ModalTrigger
                button="Open modal"
                render={onClose => (
                    <button onClick={onClose}>Close modal</button>
                )}
                />,
            )

            await user.click(screen.getByRole("button", {
                name: "Open modal",
            }))
            await user.click(screen.getByRole("button", {
                name: "Close modal",
            }))

            expect(screen.queryByRole("dialog"))
                .not.toBeInTheDocument()
        },
    )

    it("closes on Escape and when clicking outside the dialog", async () => {
        const user = userEvent.setup()

        render(
            <ModalTrigger
            button="Open modal"
            render={() => <p>Modal content</p>}
            />,
        )

        await user.click(screen.getByRole("button", {
            name: "Open modal",
        }))
        await user.keyboard("{Escape}")
        expect(screen.queryByRole("dialog"))
            .not.toBeInTheDocument()

        await user.click(screen.getByRole("button", {
            name: "Open modal",
        }))
        await user.click(screen.getByText("Modal content"))
        expect(screen.getByRole("dialog")).toBeInTheDocument()

        await user.click(document.body)
        expect(screen.queryByRole("dialog"))
            .not.toBeInTheDocument()
    })
})