import userEvent from "@testing-library/user-event"
import { render, screen } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import {
    BooleanField,
    QueryParamFields,
    SelectMultipleField,
    SelectOneField,
    SearchField,
    TextField,
} from "@/hooks/QueryParams/components"
import {
    kind,
    type Binding,
    type BooleanFieldDef,
    type FieldDefs,
    type QueryParams,
    type SelectMultipleFieldDef,
    type SelectOneFieldDef,
    type TextFieldDef,
} from "@/hooks/QueryParams/schema"

const sortOptions = {
    newest: "newest",
    price: "price",
}

const categoryOptions = {
    artifacts: "artifacts",
    potions: "potions",
}

function BooleanHarness() {
    const [value, setValue] = useState(false)
    const field: BooleanFieldDef = {
        kind: kind.boolean,
        label: "Enabled",
    }
    const binding: Binding<BooleanFieldDef> = {
        ...field,
        fieldKey: "enabled",
        get: () => value,
        set: next => setValue(current =>
            typeof next === "function" ? next(current) : next,
        ),
    }

    return (
        <>
            <BooleanField binding={binding} />
            <output data-testid="boolean-value">
                {String(value)}
            </output>
        </>
    )
}

function SelectOneHarness() {
    const [value, setValue] = useState<
        typeof sortOptions[keyof typeof sortOptions]
    >("newest")
    const field: SelectOneFieldDef<typeof sortOptions> = {
        kind: kind.selectOne,
        label: "Sort",
        defaultValue: "newest",
        options: sortOptions,
        labels: {
            newest: "Newest",
            price: "Price",
        },
    }
    const binding: Binding<typeof field> = {
        ...field,
        fieldKey: "sort",
        get: () => value,
        set: next => setValue(current =>
            typeof next === "function" ? next(current) : next,
        ),
    }

    return (
        <>
            <SelectOneField binding={binding} />
            <output data-testid="sort-value">{value}</output>
        </>
    )
}

function SelectMultipleHarness() {
    const [value, setValue] = useState<
        (typeof categoryOptions)[keyof typeof categoryOptions][]
    >([])
    const field: SelectMultipleFieldDef<
        typeof categoryOptions
    > = {
        kind: kind.selectMultiple,
        label: "Categories",
        options: categoryOptions,
        labels: {
            artifacts: "Artifacts",
            potions: "Potions",
        },
    }
    const binding: Binding<typeof field> = {
        ...field,
        fieldKey: "categories",
        get: () => value,
        set: next => setValue(current =>
            typeof next === "function" ? next(current) : next,
        ),
    }

    return (
        <>
            <SelectMultipleField binding={binding} />
            <output data-testid="selected-values">
                {value.join(",")}
            </output>
        </>
    )
}

function TextHarness() {
    const [value, setValue] = useState("")
    const field: TextFieldDef = {
        kind: kind.text,
        label: "Search",
        placeholder: "Search items",
    }
    const binding: Binding<TextFieldDef> = {
        ...field,
        fieldKey: "search",
        get: () => value,
        set: next => setValue(current =>
            typeof next === "function" ? next(current) : next,
        ),
    }

    return (
        <>
            <TextField binding={binding} />
            <output data-testid="text-value">{value}</output>
        </>
    )
}

function SearchHarness() {
    const [value, setValue] = useState("")
    const field: TextFieldDef = {
        kind: kind.text,
        label: "Search",
        placeholder: "Search items",
    }
    const binding: Binding<TextFieldDef> = {
        ...field,
        fieldKey: "search",
        get: () => value,
        set: next => setValue(current =>
            typeof next === "function" ? next(current) : next,
        ),
    }

    return (
        <>
            <SearchField binding={binding} />
            <output data-testid="search-value">{value}</output>
        </>
    )
}

describe("BooleanField intimacy: low", () => {
    it("functionality reflects and updates a boolean binding", async () => {
        const user = userEvent.setup()
        render(<BooleanHarness />)

        const checkbox = screen.getByLabelText("Enabled")
        expect(checkbox).not.toBeChecked()

        await user.click(checkbox)

        expect(checkbox).toBeChecked()
        expect(screen.getByTestId("boolean-value"))
            .toHaveTextContent("true")
    })
})

describe("SelectOneField intimacy: low", () => {
    it("functionality renders options and updates the selected value",
        async () => {
            const user = userEvent.setup()
            render(<SelectOneHarness />)

            const select = screen.getByLabelText("Sort")
            expect(select).toHaveValue("newest")
            expect(screen.getByRole("option", {
                name: "Price",
            })).toBeInTheDocument()

            await user.selectOptions(select, "price")

            expect(select).toHaveValue("price")
            expect(screen.getByTestId("sort-value"))
                .toHaveTextContent("price")
        },
    )
})

describe("SelectMultipleField intimacy: low", () => {
    it("functionality selects, unselects, and clears options", async () => {
        const user = userEvent.setup()
        render(<SelectMultipleHarness />)

        const artifacts = screen.getByLabelText("Artifacts")
        const potions = screen.getByLabelText("Potions")

        await user.click(artifacts)
        await user.click(potions)
        expect(screen.getByTestId("selected-values"))
            .toHaveTextContent("artifacts,potions")

        await user.click(artifacts)
        expect(screen.getByTestId("selected-values"))
            .toHaveTextContent("potions")

        await user.click(screen.getByRole("button", {
            name: "Clear Categories",
        }))
        expect(screen.getByTestId("selected-values"))
            .toBeEmptyDOMElement()
        expect(artifacts).not.toBeChecked()
        expect(potions).not.toBeChecked()
    })
})

describe("TextField intimacy: low", () => {
    it("functionality commits text on Enter and clears it", async () => {
        const user = userEvent.setup()
        render(<TextHarness />)

        const input = screen.getByPlaceholderText("Search items")
        await user.type(input, "amulet")
        await user.keyboard("{Enter}")

        expect(screen.getByTestId("text-value"))
            .toHaveTextContent("amulet")

        await user.click(screen.getByRole("button", {
            name: "XMarkIcon",
        }))
        expect(screen.getByTestId("text-value"))
            .toBeEmptyDOMElement()
        expect(input).toHaveValue("")
    })
})

describe("SearchField intimacy: low", () => {
    it("functionality commits search text on blur", async () => {
        const user = userEvent.setup()
        render(<SearchHarness />)

        const input = screen.getByPlaceholderText("Search items")
        await user.type(input, "orb")
        await user.tab()

        expect(screen.getByTestId("search-value"))
            .toHaveTextContent("orb")
    })
})

describe("QueryParamFields intimacy: medium", () => {
    it("functionality renders every supported field component", () => {
        const fields: FieldDefs = {
            enabled: {
                kind: kind.boolean,
                label: "Enabled",
            },
            sort: {
                kind: kind.selectOne,
                label: "Sort",
                defaultValue: "newest",
                options: sortOptions,
                labels: {
                    newest: "Newest",
                    price: "Price",
                },
            },
            categories: {
                kind: kind.selectMultiple,
                label: "Categories",
                options: categoryOptions,
                labels: {
                    artifacts: "Artifacts",
                    potions: "Potions",
                },
            },
            search: {
                kind: kind.text,
                label: "Search",
                placeholder: "Search items",
            },
        }
        const bindings = Object.fromEntries(
            Object.entries(fields).map(([fieldKey, field]) => [
                fieldKey,
                {
                    ...field,
                    fieldKey,
                    get: () => field.kind === kind.boolean
                        ? false
                        : field.kind === kind.selectOne
                            ? field.defaultValue
                            : field.kind === kind.selectMultiple
                                ? []
                                : "",
                    set: () => {},
                },
            ]),
        ) as QueryParams<FieldDefs>["bindings"]

        render(
            <QueryParamFields
            queryParams={{
                bindings,
                values: () => ({
                    enabled: false,
                    sort: "newest",
                    categories: [],
                    search: "",
                }),
            }}
            />,
        )

        expect(screen.getByLabelText("Enabled")).toBeInTheDocument()
        expect(screen.getByLabelText("Sort")).toBeInTheDocument()
        expect(screen.getByLabelText("Artifacts")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Search items"))
            .toBeInTheDocument()
    })
})