import { fireEvent, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithRouter } from "../../../utils"
import { saleFactory } from "../../../../mock_data/sale"
import { mediaFactory } from "../../../../mock_data/media"
import { SaleCard } from "@/features/sale/components/composition"

describe("SaleCard intimacy: low", () => {
    it("functionality renders sale information", () => {
        const sale = saleFactory({ name: "Spring Sale" })

        renderWithRouter(
            <SaleCard sale={sale} image={mediaFactory()} />,
        )

        expect(screen.getByText("Spring Sale")).toBeInTheDocument()
    })

    it("calls onClick with the sale when selected", () => {
        const sale = saleFactory()
        const onClick = vi.fn()

        renderWithRouter(
            <SaleCard
                sale={sale}
                image={mediaFactory()}
                onClick={onClick}
            />,
        )

        fireEvent.click(screen.getByText(sale.name))

        expect(onClick).toHaveBeenCalledWith(sale)
    })
})