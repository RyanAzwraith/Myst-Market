import { describe, expect, it, vi, beforeEach, test } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import {userEvent, type UserEvent} from "@testing-library/user-event"

import { 
    renderWithRouter, 
    resetAuthState, 
    getByRole,
    getByText,
    expectIsNullByText,
} from "../utils";
import { formatMoney } from "@/utils/formatMoney"

import { AppRoutes } from '@/AppRoutes'
import { ServerException } from "@/core"
import { useCategoriesQuery } from '@/features/shop/shopService'
import { SortBy } from '@/features/shop/shopSchemas'
import {
    RarityCheckBoxesDiv,
    CategoryCheckBoxesDiv,
    SortByDropDown,
    AscendingCheckBox,
} from '@/features/shop/SearchParamsComponent'

const mockRequest = vi.hoisted(() => vi.fn())
vi.mock('@/api', async () => ({
    request: mockRequest 
}))

let user: UserEvent


describe("SearchParamsComponent", () => {
    it("s fine", () => {})
}) 

describe("CategoryCheckBoxesDiv", () => {
    const [catOne, catTwo] = ['catOne', 'catTwo']

    beforeEach(async () => {
        mockRequest.mockResolvedValue({categories: [catOne, catTwo]})
        renderWithRouter(<CategoryCheckBoxesDiv />)
        user = userEvent.setup()
    })

    test("sets categories params and clears", async () => {
        await waitFor(() => user.click(getByRole('checkbox', catOne)))
        expect(screen.getByTestId("location")).toHaveTextContent(
            `${AppRoutes.shop}?categories=${catOne}`
        )
        await user.click(getByRole('checkbox', catTwo))
        expect(screen.getByTestId("location")).toHaveTextContent(
            `${AppRoutes.shop}?categories=${catOne}%2C${catTwo}`
        )
        await user.click(getByRole('button', 'clear'))
        expect(screen.getByTestId("location")).toHaveTextContent(
            `${AppRoutes.shop}`
        )
    })
}) 

describe("RarityCheckBoxesDiv", () => {
    const [rarOne, rarTwo] = ['rarOne', 'rarTwo']

    beforeEach(async () => {
        mockRequest.mockResolvedValue({rarities: [rarOne, rarTwo]})
        renderWithRouter(<RarityCheckBoxesDiv />)
        user = userEvent.setup()
    })

    test("sets rarities params and clears", async () => {
        await waitFor(() => user.click(getByRole('checkbox', rarOne)))
        expect(screen.getByTestId("location")).toHaveTextContent(
            `${AppRoutes.shop}?rarities=${rarOne}`
        )
        await user.click(getByRole('checkbox', rarTwo))
        expect(screen.getByTestId("location")).toHaveTextContent(
            `${AppRoutes.shop}?rarities=${rarOne}%2C${rarTwo}`
        )
        await user.click(getByRole('button', 'clear'))
        expect(screen.getByTestId("location")).toHaveTextContent(
            `${AppRoutes.shop}`
        )
    })
}) 

describe("AscendingCheckBox", () => {
    beforeEach(async () => {
        renderWithRouter(<AscendingCheckBox />)
        user = userEvent.setup()
    })

    test("sets ascending", async () => {
        await user.click(getByRole('checkbox', "Ascending"))
        expect(screen.getByTestId("location")).toHaveTextContent(
            `${AppRoutes.shop}?isAscending=${true}`
        )
        await user.click(getByRole('checkbox', "Ascending"))
        expect(screen.getByTestId("location")).toHaveTextContent(
            `${AppRoutes.shop}?isAscending=${false}`
        )
    })
}) 

describe("SortByDropDown", () => {
    const sampleSortBy = SortBy.price
    beforeEach(async () => {
        renderWithRouter(<SortByDropDown />)
        user = userEvent.setup()
    })

    test("sets sortBy", async () => {
        await user.selectOptions(getByRole('combobox', "Sort by"), sampleSortBy)
        expect(screen.getByTestId("location")).toHaveTextContent(
            `${AppRoutes.shop}?sortBy=${sampleSortBy}`
        )
    })
}) 