import userEvent from "@testing-library/user-event"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { LoadContent } from "@/shared/composition/LoadContent"

describe("LoadContent intimacy: low", () => {
    it("functionality renders content and the load control", () => {
        const onClick = vi.fn()

        render(
            <LoadContent
            content={[
                <span key="first">First item</span>,
                <span key="second">Second item</span>,
            ]}
            hasMore={true}
            onClick={onClick}
            />,
        )

        expect(screen.getByText("First item")).toBeInTheDocument()
        expect(screen.getByText("Second item")).toBeInTheDocument()
        expect(screen.getByRole("button", {
            name: "Load more content",
        })).toBeInTheDocument()
    })

    it("calls the callback when more content is requested", async () => {
        const onClick = vi.fn()
        const user = userEvent.setup()

        render(
            <LoadContent
            content={[<span key="first">First item</span>]}
            hasMore={true}
            onClick={onClick}
            />,
        )

        await user.click(screen.getByRole("button", {
            name: "Load more content",
        }))

        expect(onClick).toHaveBeenCalledOnce()
    })

    it("hides the load control when there is no more content", () => {
        render(
            <LoadContent
            content={[<span key="only">Only item</span>]}
            hasMore={false}
            onClick={vi.fn()}
            />,
        )

        expect(screen.getByText("Only item")).toBeInTheDocument()
        expect(screen.queryByRole("button", {
            name: "Load more content",
        })).not.toBeInTheDocument()
    })
})