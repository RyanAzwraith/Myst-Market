import userEvent from "@testing-library/user-event"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ExpandableContent } from "@/shared/composition/ExpandableContent"

describe("ExpandableContent intimacy: low", () => {
    it("functionality renders only the limited content initially", () => {
        render(
            <ExpandableContent
            content={[
                <span key="item-1">Item 1</span>,
                <span key="item-2">Item 2</span>,
                <span key="item-3">Item 3</span>,
                <span key="item-4">Item 4</span>,
            ]}
            limit={2}
            />,
        )

        expect(screen.getByText("Item 1")).toBeInTheDocument()
        expect(screen.getByText("Item 2")).toBeInTheDocument()
        expect(screen.queryByText("Item 3"))
            .not.toBeInTheDocument()
        expect(screen.getByRole("button", {
            name: "Expand content",
        })).toBeInTheDocument()
    })

    it("expands and collapses the content window", async () => {
        const user = userEvent.setup()

        render(
            <ExpandableContent
            content={[
                <span key="item-1">Item 1</span>,
                <span key="item-2">Item 2</span>,
                <span key="item-3">Item 3</span>,
            ]}
            limit={2}
            />,
        )

        await user.click(screen.getByRole("button", {
            name: "Expand content",
        }))
        expect(screen.getByText("Item 3")).toBeInTheDocument()
        expect(screen.getByRole("button", {
            name: "Collapse content",
        })).toBeInTheDocument()

        await user.click(screen.getByRole("button", {
            name: "Collapse content",
        }))
        expect(screen.queryByText("Item 3"))
            .not.toBeInTheDocument()
    })

    it("does not offer expansion when content fits the limit", () => {
        render(
            <ExpandableContent
            content={[
                <span key="item-1">Item 1</span>,
                <span key="item-2">Item 2</span>,
            ]}
            limit={2}
            />,
        )

        expect(screen.getByText("Item 1")).toBeInTheDocument()
        expect(screen.getByText("Item 2")).toBeInTheDocument()
        expect(screen.queryByRole("button", {
            name: "Expand content",
        })).not.toBeInTheDocument()
    })
})