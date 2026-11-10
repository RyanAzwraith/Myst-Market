import userEvent from "@testing-library/user-event"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { saleFactory } from "../../mock_data/sale"
import { SaleBadge } from "@/shared/presentation"

describe("SaleBadge intimacy: low", () => {
    it("functionality renders a sale discount badge", () => {
        const sale = saleFactory({
            name: "Spring Sale",
            discountPerc: 25,
        })

        render(<SaleBadge sale={sale} />)

        const badge = screen.getByLabelText(
            "Spring Sale, -25% discount",
        )
        expect(badge).toHaveTextContent("-25%")
        expect(badge).toHaveClass(
            "shared-sale-badge",
            "shared-sale-badge-medium",
        )
        expect(badge.tagName).toBe("SPAN")
    })

    it("does not render a badge when there is no sale", () => {
        const { container } = render(<SaleBadge sale={null} />)

        expect(container).toBeEmptyDOMElement()
    })

    it("applies the requested size and custom class", () => {
        const sale = saleFactory({ discountPerc: 10 })

        render(
            <SaleBadge
                sale={sale}
                size="large"
                className="custom-badge"
            />,
        )

        expect(screen.getByText("-10%")).toHaveClass(
            "shared-sale-badge-large",
            "custom-badge",
        )
    })

    it("calls the callback with the sale and stops propagation", async () => {
        const sale = saleFactory({
            name: "Spring Sale",
            discountPerc: 15,
        })
        const onClick = vi.fn()
        const parentOnClick = vi.fn()
        const user = userEvent.setup()

        render(
            <div onClick={parentOnClick}>
                <SaleBadge sale={sale} onClick={onClick} />
            </div>,
        )

        await user.click(screen.getByRole("button", {
            name: "Spring Sale, -15% discount",
        }))

        expect(onClick).toHaveBeenCalledOnce()
        expect(onClick).toHaveBeenCalledWith(sale)
        expect(parentOnClick).not.toHaveBeenCalled()
    })
})
