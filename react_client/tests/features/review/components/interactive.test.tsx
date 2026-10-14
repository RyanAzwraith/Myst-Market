import userEvent from "@testing-library/user-event"
import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../../../utils"
import { server } from "@/core"
import {
    CreateForm,
    DeleteButton,
} from "@/features/review/components/interactive"

describe("CreateForm intimacy: high", () => {
    it("functionality renders rating, description, and submit controls",
        () => {
            renderWithRouter(<CreateForm productId={12} />)

            expect(screen.getByText("0.0/5")).toBeInTheDocument()
            expect(screen.getByLabelText("Description"))
                .toBeInTheDocument()
            expect(screen.getByRole("button", { name: "Submit" }))
                .toBeInTheDocument()
        },
    )

    it("submits the selected rating and description", async () => {
        const create = vi.spyOn(server.review, "create")
            .mockResolvedValue(undefined)
        const user = userEvent.setup()

        renderWithRouter(<CreateForm productId={12} />)
        await user.click(screen.getAllByRole("button", {
            name: "StarOutlineIcon",
        })[2])
        await user.type(
            screen.getByLabelText("Description"),
            "A helpful review.",
        )
        await user.click(screen.getByRole("button", { name: "Submit" }))

        await vi.waitFor(() => expect(create).toHaveBeenCalledWith({
            reviewInput: {
                rating: 3,
                description: "A helpful review.",
            },
        }))
    })

    it("shows a validation message when no rating is selected",
        async () => {
            const create = vi.spyOn(server.review, "create")
                .mockResolvedValue(undefined)
            const user = userEvent.setup()

            renderWithRouter(<CreateForm productId={12} />)
            await user.click(screen.getByRole("button", { name: "Submit" }))

            expect(await screen.findByText("Select Rating"))
                .toBeInTheDocument()
            expect(create).not.toHaveBeenCalled()
        },
    )
})

describe("DeleteButton intimacy: medium", () => {
    it("functionality renders the review delete trigger", () => {
        renderWithRouter(<DeleteButton reviewId={9} />)

        expect(screen.getByRole("button")).toBeInTheDocument()
    })

    it("closes the confirmation dialog when deletion is cancelled",
        async () => {
            const user = userEvent.setup()

            renderWithRouter(<DeleteButton reviewId={9} />)
            await user.click(screen.getByRole("button"))

            expect(screen.getByRole("heading", {
                name: "Are you sure you'd like to delete your Review?",
            })).toBeInTheDocument()
            await user.click(screen.getByRole("button", { name: "No" }))

            expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
        },
    )

    it("deletes the review when confirmation is accepted", async () => {
        const remove = vi.spyOn(server.review, "delete")
            .mockResolvedValue(undefined)
        const user = userEvent.setup()

        renderWithRouter(<DeleteButton reviewId={9} />)
        await user.click(screen.getByRole("button"))
        await user.click(screen.getByRole("button", { name: "Yes" }))

        await vi.waitFor(() => expect(remove).toHaveBeenCalledWith({
            reviewId: 9,
        }))
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
})
