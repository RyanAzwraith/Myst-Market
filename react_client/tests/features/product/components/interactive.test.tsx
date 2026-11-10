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
