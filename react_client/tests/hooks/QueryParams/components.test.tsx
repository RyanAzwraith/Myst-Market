import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"

import {
    BooleanField,
    QueryParamField,
    QueryParamsContainer,
    QueryParamsFields,
    SelectMultipleField,
    SelectOneField,
    TextField,
} from "@/hooks/QueryParams/components"
import type { Bindings, FieldDefs } from "@/hooks/QueryParams/schema"
import { makeBinding, queryFields } from "./QueryParamsMock"

describe("BooleanField", () => {
    it("renders its label and checked state", () => {
        const binding = makeBinding("enabled", queryFields.enabled, true)

        render(<BooleanField binding={binding} />)

        expect(screen.getByLabelText("Enabled")).toBeChecked()
    })

    it("sets the binding when the checkbox changes", async () => {
        const user = userEvent.setup()
        const binding = makeBinding("enabled", queryFields.enabled, false)

        render(<BooleanField binding={binding} />)
        await user.click(screen.getByLabelText("Enabled"))

        expect(binding.set).toHaveBeenCalledWith(true)
    })
})

describe("SelectOneField", () => {
    it("renders every option with its display label", () => {
        const binding = makeBinding("sort", queryFields.sort, "name")

        render(<SelectOneField binding={binding} />)

        expect(screen.getByRole("option", { name: "Name" }))
            .toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Price" }))
            .toBeInTheDocument()
    })

    it("sets the selected option", async () => {
        const user = userEvent.setup()
        const binding = makeBinding("sort", queryFields.sort, "name")

        render(<SelectOneField binding={binding} />)
        await user.selectOptions(screen.getByLabelText("Sort"), "price")

        expect(binding.set).toHaveBeenCalledWith("price")
    })
})

describe("SelectMultipleField", () => {
    it("sets an option when it is checked", async () => {
        const user = userEvent.setup()
        const binding = makeBinding(
            "categories",
            queryFields.categories,
            [],
        )

        render(<SelectMultipleField binding={binding} />)
        await user.click(screen.getByLabelText("Magic"))

        expect(binding.set).toHaveBeenCalledWith(["magic"])
    })

    it("removes an unchecked option from the current selection", async () => {
        const user = userEvent.setup()
        const binding = makeBinding(
            "categories",
            queryFields.categories,
            ["magic", "weapon"],
        )

        render(<SelectMultipleField binding={binding} />)
        await user.click(screen.getByLabelText("Magic"))

        expect(binding.set).toHaveBeenCalledWith(["weapon"])
    })

    it("clears all selected options", async () => {
        const user = userEvent.setup()
        const binding = makeBinding(
            "categories",
            queryFields.categories,
            ["magic"],
        )

        render(<SelectMultipleField binding={binding} />)
        await user.click(screen.getByTestId("clear-button"))

        expect(binding.set).toHaveBeenCalledTimes(1)
        const [update] = vi.mocked(binding.set).mock.calls[0]
        expect(typeof update).toBe("function")
        if (typeof update === "function") {
            expect(update(["magic"])).toEqual([])
        }
    })
})

describe("TextField", () => {
    it("updates the binding when Enter is pressed", async () => {
        const user = userEvent.setup()
        const binding = makeBinding("search", queryFields.search, "")

        render(<TextField binding={binding} />)
        const input = screen.getByLabelText("Search")
        await user.type(input, "moon")
        await user.keyboard("{Enter}")

        expect(binding.set).toHaveBeenCalledTimes(1)
        const [update] = vi.mocked(binding.set).mock.calls[0]
        expect(typeof update).toBe("function")
        if (typeof update === "function") {
            expect(update("old")).toBe("moon")
        }
    })

    it("updates the binding when the input loses focus", async () => {
        const user = userEvent.setup()
        const binding = makeBinding("search", queryFields.search, "")

        render(
            <>
                <TextField binding={binding} />
                <button type="button">Outside</button>
            </>,
        )
        const input = screen.getByLabelText("Search")
        await user.type(input, "sword")
        await user.click(
            screen.getByRole("button", { name: "Outside" }),
        )

        expect(binding.set).toHaveBeenCalledTimes(1)
    })

    it("clears the input and binding", async () => {
        const user = userEvent.setup()
        const binding = makeBinding("search", queryFields.search, "moon")

        render(<TextField binding={binding} />)
        await user.click(screen.getByTestId("clear-button"))

        expect(screen.getByLabelText("Search")).toHaveValue("")
        expect(binding.set).toHaveBeenCalledTimes(1)
        const [update] = vi.mocked(binding.set).mock.calls[0]
        expect(typeof update).toBe("function")
        if (typeof update === "function") {
            expect(update("old")).toBe("")
        }
    })
})

describe("QueryParamsContainer", () => {
    it("renders its children", () => {
        render(
            <QueryParamsContainer>
                <span>Query content</span>
            </QueryParamsContainer>,
        )

        expect(screen.getByText("Query content")).toBeInTheDocument()
    })
})

describe("QueryParamField", () => {
    it("renders a boolean field", () => {
        const binding = makeBinding("enabled", queryFields.enabled, false)

        render(<QueryParamField binding={binding} />)

        expect(screen.getByLabelText("Enabled")).toBeInTheDocument()
    })

    it("renders a select-one field", () => {
        const binding = makeBinding("sort", queryFields.sort, "name")

        render(<QueryParamField binding={binding} />)

        expect(screen.getByLabelText("Sort")).toBeInTheDocument()
    })

    it("renders a select-multiple field", () => {
        const binding = makeBinding(
            "categories",
            queryFields.categories,
            [],
        )

        render(<QueryParamField binding={binding} />)

        expect(screen.getByText("Categories")).toBeInTheDocument()
    })

    it("renders a text field", () => {
        const binding = makeBinding("search", queryFields.search, "")

        render(<QueryParamField binding={binding} />)

        expect(screen.getByLabelText("Search")).toBeInTheDocument()
    })
})

describe("QueryParamsFields", () => {
    it("renders a field component for every binding", () => {
        const bindings = {
            enabled: makeBinding("enabled", queryFields.enabled, false),
            sort: makeBinding("sort", queryFields.sort, "name"),
            categories: makeBinding(
                "categories",
                queryFields.categories,
                [],
            ),
            search: makeBinding("search", queryFields.search, ""),
        } as Bindings<FieldDefs>

        render(<QueryParamsFields bindings={bindings} />)

        expect(screen.getByLabelText("Enabled")).toBeInTheDocument()
        expect(screen.getByLabelText("Sort")).toBeInTheDocument()
        expect(screen.getByText("Categories")).toBeInTheDocument()
        expect(screen.getByLabelText("Search")).toBeInTheDocument()
    })
})

describe("SelectMultipleField handleChange", () => {
    it("uses the current selected values when changing an option", async () => {
        const user = userEvent.setup()
        const binding = makeBinding(
            "categories",
            queryFields.categories,
            ["magic"],
        )

        render(<SelectMultipleField binding={binding} />)
        await user.click(screen.getByLabelText("Weapon"))

        expect(binding.set).toHaveBeenCalledWith(["magic", "weapon"])
    })
})

describe("TextField handleSearch", () => {
    it("submits the local input value", async () => {
        const user = userEvent.setup()
        const binding = makeBinding("search", queryFields.search, "")

        render(<TextField binding={binding} />)
        await user.type(screen.getByLabelText("Search"), "potion")
        await user.keyboard("{Enter}")

        const [update] = vi.mocked(binding.set).mock.calls[0]
        expect(typeof update).toBe("function")
        if (typeof update === "function") {
            expect(update("")).toBe("potion")
        }
    })
})
