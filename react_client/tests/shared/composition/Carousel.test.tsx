import userEvent from "@testing-library/user-event"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Carousel } from "@/shared/composition/Carousel"

describe("Carousel intimacy: low", () => {
    it("functionality renders the initial content window", () => {
        render(
            <Carousel
            content={[
                <span key="item-1">Item 1</span>,
                <span key="item-2">Item 2</span>,
                <span key="item-3">Item 3</span>,
            ]}
            limit={2}
            />,
        )

        expect(screen.getByText("Item 1")).toBeInTheDocument()
        expect(screen.getByText("Item 2")).toBeInTheDocument()
        expect(screen.queryByText("Item 3"))
            .not.toBeInTheDocument()
        expect(screen.getByRole("button", {
            name: "Previous items",
        })).toBeInTheDocument()
        expect(screen.getByRole("button", {
            name: "Next items",
        })).toBeInTheDocument()
    })

    it("moves the content window forward and wraps around", async () => {
        const user = userEvent.setup()

        render(
            <Carousel
            content={[
                <span key="item-1">Item 1</span>,
                <span key="item-2">Item 2</span>,
                <span key="item-3">Item 3</span>,
                <span key="item-4">Item 4</span>,
            ]}
            limit={2}
            />,
        )

        await user.click(screen.getByRole("button", {
            name: "Next items",
        }))
        expect(screen.queryByText("Item 1"))
            .not.toBeInTheDocument()
        expect(screen.getByText("Item 3")).toBeInTheDocument()

        await user.click(screen.getByRole("button", {
            name: "Next items",
        }))
        await user.click(screen.getByRole("button", {
            name: "Next items",
        }))

        expect(screen.getByText("Item 1")).toBeInTheDocument()
        expect(screen.getByText("Item 2")).toBeInTheDocument()
    })

    it("renders nothing when there is no content", () => {
        render(<Carousel content={[]} />)

        expect(screen.queryByRole("button", {
            name: "Next items",
        })).not.toBeInTheDocument()
    })
})