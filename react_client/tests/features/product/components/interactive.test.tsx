import userEvent from "@testing-library/user-event"
import { screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../../../utils"
import { productFactory } from "../../../../mock_data/product"
import { server } from "@/core"
import {
    CategoryBar,
    CreateForm,
    DeleteButton,
    ExportProductsButton,
    ImportProductsButton,
    UpdateForm,
} from "@/features/product/components/interactive"

describe("CreateForm intimacy: high", () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it("functionality renders product fields and submit action", () => {
        renderWithRouter(<CreateForm />)

        expect(screen.getByLabelText("Name")).toBeInTheDocument()
        expect(screen.getByLabelText("Category")).toBeInTheDocument()
        expect(screen.getByLabelText("Rarity")).toBeInTheDocument()
        expect(screen.getByLabelText("Price (cents)"))
            .toBeInTheDocument()
        expect(screen.getByLabelText("Slug")).toBeInTheDocument()
        expect(screen.getByLabelText("Description"))
            .toBeInTheDocument()
        expect(screen.getByLabelText("Stock")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Create product" }))
            .toBeInTheDocument()
    })

    it("submits entered product details", async () => {
        const create = vi.spyOn(server.product, "create")
            .mockResolvedValue(undefined)
        const user = userEvent.setup()

        renderWithRouter(<CreateForm />)
        await user.type(screen.getByLabelText("Name"), "New Product")
        await user.type(screen.getByLabelText("Category"), "artifacts")
        await user.type(screen.getByLabelText("Rarity"), "rare")
        await user.type(screen.getByLabelText("Price (cents)"), "1800")
        await user.type(screen.getByLabelText("Slug"), "new-product")
        await user.type(
            screen.getByLabelText("Description"),
            "A new product.",
        )
        await user.type(screen.getByLabelText("Stock"), "12")
        await user.click(screen.getByRole("button", {
            name: "Create product",
        }))

        await vi.waitFor(() => expect(create).toHaveBeenCalledWith({
            name: "New Product",
            categoryName: "artifacts",
            rarityName: "rare",
            priceAudCent: 1800,
            slug: "new-product",
            description: "A new product.",
            stock: 12,
        }))
    })
})

describe("UpdateForm intimacy: high", () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it("functionality renders existing product values", () => {
        const product = productFactory({
            name: "Existing Product",
            categoryName: "artifacts",
            rarityName: "rare",
            priceAudCent: 2200,
            slug: "existing-product",
            description: "Existing description.",
            stock: 4,
        })

        renderWithRouter(<UpdateForm product={product} />)

        expect(screen.getByLabelText("Name"))
            .toHaveValue("Existing Product")
        expect(screen.getByLabelText("Category"))
            .toHaveValue("artifacts")
        expect(screen.getByLabelText("Rarity")).toHaveValue("rare")
        expect(screen.getByLabelText("Price (cents)"))
            .toHaveValue(2200)
        expect(screen.getByLabelText("Slug"))
            .toHaveValue("existing-product")
        expect(screen.getByLabelText("Description"))
            .toHaveValue("Existing description.")
        expect(screen.getByLabelText("Stock")).toHaveValue(4)
    })

    it("submits changed product values and calls onSuccess", async () => {
        const product = productFactory({
            id: 8,
            name: "Existing Product",
            categoryName: "artifacts",
            rarityName: "rare",
            priceAudCent: 2200,
            slug: "existing-product",
            description: "Existing description.",
            stock: 4,
        })
        const patch = vi.spyOn(server.product, "patch")
            .mockResolvedValue(undefined)
        const onSuccess = vi.fn()
        const user = userEvent.setup()

        renderWithRouter(
            <UpdateForm product={product} onSuccess={onSuccess} />,
        )
        const name = screen.getByLabelText("Name")
        await user.clear(name)
        await user.type(name, "Updated Product")
        await user.click(screen.getByRole("button", {
            name: "Update product",
        }))

        await vi.waitFor(() => expect(patch).toHaveBeenCalledWith(8, {
            name: "Updated Product",
            categoryName: "artifacts",
            rarityName: "rare",
            priceAudCent: 2200,
            slug: "existing-product",
            description: "Existing description.",
            stock: 4,
        }))
        expect(onSuccess).toHaveBeenCalledOnce()
    })
})

describe("CategoryBar intimacy: medium", () => {
    it("functionality renders the available category actions", () => {
        renderWithRouter(<CategoryBar />, {
            initialPath: "/shop",
        })

        expect(screen.getByRole("button", { name: "Artifacts" }))
            .toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Weapons" }))
            .toBeInTheDocument()
    })

    it("updates the shop URL when a category is selected", async () => {
        const user = userEvent.setup()

        renderWithRouter(<CategoryBar />, {
            initialPath: "/shop",
        })
        await user.click(screen.getByRole("button", {
            name: "Artifacts",
        }))

        expect(screen.getByTestId("location"))
            .toHaveTextContent("/shop?categories=artifacts")
    })
})

describe("DeleteButton intimacy: medium", () => {
    it("functionality renders an enabled delete action", () => {
        renderWithRouter(<DeleteButton productId={4} />)

        expect(screen.getByRole("button", { name: "Delete product" }))
            .toBeEnabled()
    })

    it("deletes the product and calls onClick after success", async () => {
        const remove = vi.spyOn(server.product, "delete")
            .mockResolvedValue(undefined)
        const onClick = vi.fn()
        const user = userEvent.setup()

        renderWithRouter(
            <DeleteButton productId={4} onClick={onClick} />,
        )
        await user.click(screen.getByRole("button", {
            name: "Delete product",
        }))

        await vi.waitFor(() => expect(remove).toHaveBeenCalledWith(4))
        expect(onClick).toHaveBeenCalledOnce()
    })

    it("disables deletion while the request is pending", async () => {
        vi.spyOn(server.product, "delete").mockReturnValue(
            new Promise(() => {}),
        )
        const user = userEvent.setup()

        renderWithRouter(<DeleteButton productId={4} />)
        const button = screen.getByRole("button", {
            name: "Delete product",
        })
        await user.click(button)

        expect(button).toBeDisabled()
    })
})

describe("ImportProductsButton intimacy: medium", () => {
    it("functionality renders the import action", () => {
        renderWithRouter(<ImportProductsButton />)

        expect(screen.getByRole("button", { name: "Import Products" }))
            .toBeInTheDocument()
    })

    it("uploads the selected product file", async () => {
        const importProducts = vi.spyOn(server.products, "import")
            .mockResolvedValue({
                imported: 1,
                updated: 0,
                failed: 0,
                errors: [],
            })
        const file = new File(["product"], "products.csv", {
            type: "text/csv",
        })
        const user = userEvent.setup()

        renderWithRouter(<ImportProductsButton />)
        const input = document.querySelector<HTMLInputElement>(
            'input[type="file"]',
        )
        expect(input).not.toBeNull()
        await user.upload(input!, file)

        await vi.waitFor(() => expect(importProducts)
            .toHaveBeenCalledWith({ file }))
    })
})

describe("ExportProductsButton intimacy: medium", () => {
    it("functionality renders the export action", () => {
        renderWithRouter(<ExportProductsButton />)

        expect(screen.getByRole("button", { name: "Export Products" }))
            .toBeInTheDocument()
    })

    it("downloads the exported product CSV", async () => {
        const exportProducts = vi.spyOn(server.products, "export")
            .mockResolvedValue(new Blob(["products"]))
        const createObjectURL = vi.fn(() => "blob:products")
        const revokeObjectURL = vi.fn()
        const click = vi.spyOn(HTMLAnchorElement.prototype, "click")
            .mockImplementation(() => {})
        vi.stubGlobal("URL", {
            createObjectURL,
            revokeObjectURL,
        })
        const user = userEvent.setup()

        renderWithRouter(<ExportProductsButton />)
        await user.click(screen.getByRole("button", {
            name: "Export Products",
        }))

        await vi.waitFor(() => expect(exportProducts)
            .toHaveBeenCalledOnce())
        await vi.waitFor(() => expect(createObjectURL)
            .toHaveBeenCalledOnce())
        expect(revokeObjectURL).toHaveBeenCalledWith("blob:products")
        expect(click).toHaveBeenCalledOnce()
    })
})
