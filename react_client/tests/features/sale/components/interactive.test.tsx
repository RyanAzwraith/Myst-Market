import userEvent from "@testing-library/user-event"
import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../../../utils"
import {
    saleAnalyticsFactory,
} from "../../../../mock_data/sale"
import { server } from "@/core"
import {
    CreateForm,
    DeleteButton,
    ExportSalesButton,
    ImportSalesButton,
    UpdateForm,
} from "@/features/sale/components/interactive"

describe("CreateForm intimacy: high", () => {
    it("functionality renders the sale fields and submit action", () => {
        renderWithRouter(<CreateForm />)

        expect(screen.getByLabelText("Name")).toBeInTheDocument()
        expect(screen.getByLabelText("Discount percent"))
            .toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Submit" }))
            .toBeInTheDocument()
    })

    it("submits entered sale values", async () => {
        const user = userEvent.setup()
        const create = vi.spyOn(server.sale, "create")
            .mockResolvedValue(undefined)

        renderWithRouter(<CreateForm />)
        await user.type(screen.getByLabelText("Name"), "New Sale")
        await user.clear(screen.getByLabelText("Slug"))
        await user.type(screen.getByLabelText("Slug"), "new-sale")
        await user.type(
            screen.getByLabelText("Description"),
            "A new sale",
        )
        await user.clear(screen.getByLabelText("Start date"))
        await user.type(screen.getByLabelText("Start date"), "2026-05-01")
        await user.type(screen.getByLabelText("End date"), "2026-05-31")
        await user.clear(screen.getByLabelText("Discount percent"))
        await user.type(screen.getByLabelText("Discount percent"), "20")
        await user.click(screen.getByRole("button", { name: "Submit" }))

        await vi.waitFor(() => expect(create).toHaveBeenCalledWith({
            name: "New Sale",
            slug: "new-sale",
            description: "A new sale",
            startAt: "2026-05-01",
            endAt: "2026-05-31",
            discountPerc: 20,
        }))
    })

    it("rejects a discount percentage above 100", async () => {
        const user = userEvent.setup()
        const create = vi.spyOn(server.sale, "create")
            .mockResolvedValue(undefined)

        renderWithRouter(<CreateForm />)
        const discount = screen.getByLabelText("Discount percent")
        await user.clear(discount)
        await user.type(discount, "101")
        await user.click(screen.getByRole("button", { name: "Submit" }))

        expect(await screen.findByText(
            "Discount percent must be between 0 and 100",
        )).toBeInTheDocument()
        expect(create).not.toHaveBeenCalled()
    })
})

describe("UpdateForm intimacy: high", () => {
    it("functionality renders existing sale values", () => {
        const sale = saleAnalyticsFactory({
            name: "Existing Sale",
            discountPerc: 15,
        })

        renderWithRouter(<UpdateForm sale={sale} />)

        expect(screen.getByLabelText("Name")).toHaveValue("Existing Sale")
        expect(screen.getByLabelText("Discount percent")).toHaveValue(15)
    })

    it("submits changed values and calls onSuccess", async () => {
        const user = userEvent.setup()
        const sale = saleAnalyticsFactory({ id: 7 })
        const patch = vi.spyOn(server.sale, "patch")
            .mockResolvedValue(undefined)
        const onSuccess = vi.fn()

        renderWithRouter(<UpdateForm sale={sale} onSuccess={onSuccess} />)
        const name = screen.getByLabelText("Name")
        await user.clear(name)
        await user.type(name, "Updated Sale")
        await user.click(screen.getByRole("button", { name: "Submit" }))

        await vi.waitFor(() => expect(patch).toHaveBeenCalledWith(
            7,
            expect.objectContaining({ name: "Updated Sale" }),
        ))
        expect(onSuccess).toHaveBeenCalledOnce()
    })
})

describe("DeleteButton intimacy: medium", () => {
    it("functionality renders an enabled delete action", () => {
        renderWithRouter(<DeleteButton saleId={4} />)

        expect(screen.getByRole("button", { name: "Delete sale" }))
            .toBeEnabled()
    })

    it("deletes the sale and calls onClick after success", async () => {
        const user = userEvent.setup()
        const remove = vi.spyOn(server.sale, "delete")
            .mockResolvedValue(undefined)
        const onClick = vi.fn()

        renderWithRouter(<DeleteButton saleId={4} onClick={onClick} />)
        await user.click(screen.getByRole("button", { name: "Delete sale" }))

        await vi.waitFor(() => expect(remove).toHaveBeenCalledWith(4))
        expect(onClick).toHaveBeenCalledOnce()
    })

    it("disables deletion while the request is pending", async () => {
        const user = userEvent.setup()
        let resolveDelete: (() => void) | undefined
        vi.spyOn(server.sale, "delete").mockReturnValue(
            new Promise(resolve => {
                resolveDelete = () => resolve()
            }),
        )

        renderWithRouter(<DeleteButton saleId={4} />)
        const button = screen.getByRole("button", { name: "Delete sale" })
        await user.click(button)

        expect(button).toBeDisabled()
        resolveDelete?.()
    })
})

describe("ImportSalesButton intimacy: medium", () => {
    it("functionality renders the import action", () => {
        renderWithRouter(<ImportSalesButton />)

        expect(screen.getByRole("button", { name: "Import Sales" }))
            .toBeInTheDocument()
    })

    it("uploads the selected file to the server", async () => {
        const user = userEvent.setup()
        const importSales = vi.spyOn(server.sales, "import")
            .mockResolvedValue({
                imported: 1,
                updated: 0,
                failed: 0,
                errors: [],
            })
        const file = new File(["name"], "sales.csv", {
            type: "text/csv",
        })

        renderWithRouter(<ImportSalesButton />)
        const input = document.querySelector<HTMLInputElement>(
            'input[type="file"]',
        )
        expect(input).not.toBeNull()
        await user.upload(input!, file)

        await vi.waitFor(() => expect(importSales).toHaveBeenCalledWith({
            file,
        }))
    })
})

describe("ExportSalesButton intimacy: medium", () => {
    it("functionality renders the export action", () => {
        renderWithRouter(<ExportSalesButton />)

        expect(screen.getByRole("button", { name: "Export Sales" }))
            .toBeInTheDocument()
    })

    it("downloads the exported CSV", async () => {
        const user = userEvent.setup()
        const exportSales = vi.spyOn(server.sales, "export")
            .mockResolvedValue(new Blob(["csv"]))
        const createObjectURL = vi.fn(() => "blob:sales")
        const revokeObjectURL = vi.fn()
        vi.stubGlobal("URL", {
            createObjectURL,
            revokeObjectURL,
        })
        const click = vi.spyOn(HTMLAnchorElement.prototype, "click")

        renderWithRouter(<ExportSalesButton />)
        await user.click(screen.getByRole("button", { name: "Export Sales" }))

        await vi.waitFor(() => expect(exportSales).toHaveBeenCalledOnce())
        expect(createObjectURL).toHaveBeenCalledOnce()
        expect(revokeObjectURL).toHaveBeenCalledWith("blob:sales")
        expect(click).toHaveBeenCalledOnce()
    })
})