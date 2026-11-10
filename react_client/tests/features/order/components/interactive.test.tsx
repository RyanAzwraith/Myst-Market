import userEvent from "@testing-library/user-event"
import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../../../utils"
import { orderFactory } from "../../../../mock_data/order"
import { server } from "@/core"
import { StatusForm } from "@/features/order/components/interactive"

describe("StatusForm intimacy: high", () => {
    it("functionality renders the order status field and submit action",
        () => {
            const order = orderFactory({
                id: 3,
                status: "pending",
            })

            renderWithRouter(<StatusForm order={order} />)

            expect(screen.getByLabelText("Order status"))
                .toBeInTheDocument()
            expect(screen.getByRole("button", { name: "Submit" }))
                .toBeInTheDocument()
        },
    )

    it("submits a changed order status", async () => {
        const order = orderFactory({
            id: 4,
            status: "pending",
        })
        const patchStatus = vi.spyOn(server.order, "patchStatus")
            .mockResolvedValue(undefined)
        const user = userEvent.setup()

        renderWithRouter(<StatusForm order={order} />)
        await user.selectOptions(
            screen.getByLabelText("Order status"),
            "shipped",
        )
        await user.click(screen.getByRole("button", { name: "Submit" }))

        await vi.waitFor(() => expect(patchStatus)
            .toHaveBeenCalledWith(4, { status: "shipped" }))
    })
})
