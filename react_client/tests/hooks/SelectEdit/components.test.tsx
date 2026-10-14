import userEvent from "@testing-library/user-event"
import { render, screen } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import {
    BooleanField,
    ItemRow,
    NumberField,
    SelectEditDisplay,
    SelectMultipleField,
    SelectOneField,
    TextField,
} from "@/hooks/SelectEdit/components"
import { useSelectEdit } from "@/hooks/SelectEdit/services"
import {
    kind,
    type Binding,
    type BooleanFieldDef,
    type NumberFieldDef,
    type SelectMultipleFieldDef,
    type SelectOneFieldDef,
    type TextFieldDef,
} from "@/hooks/SelectEdit/schema"

const categoryOptions = {
    artifacts: "artifacts",
    potions: "potions",
}

function BooleanHarness() {
    const [value, setValue] = useState<boolean | null>(null)
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

function TextHarness() {
    const [value, setValue] = useState<string | null>(null)
    const field: TextFieldDef = {
        kind: kind.text,
        label: "Name",
        placeholder: "Product name",
    }
    const binding: Binding<TextFieldDef> = {
        ...field,
        fieldKey: "name",
        get: () => value,
        set: next => setValue(current =>
            typeof next === "function" ? next(current) : next,
        ),
    }

    return (
        <>
            <TextField binding={binding} />
            <output data-testid="text-value">
                {String(value)}
            </output>
        </>
    )
}

function NumberHarness() {
    const [value, setValue] = useState<number | null>(null)
    const field: NumberFieldDef = {
        kind: kind.number,
        label: "Stock",
    }
    const binding: Binding<NumberFieldDef> = {
        ...field,
        fieldKey: "stock",
        get: () => value,
        set: next => setValue(current =>
            typeof next === "function" ? next(current) : next,
        ),
    }

    return (
        <>
            <NumberField binding={binding} />
            <output data-testid="number-value">
                {String(value)}
            </output>
        </>
    )
}

function SelectOneHarness() {
    const [value, setValue] = useState<
        (typeof categoryOptions)[keyof typeof categoryOptions] | null
    >(null)
    const field: SelectOneFieldDef<typeof categoryOptions> = {
        kind: kind.selectOne,
        label: "Category",
        options: categoryOptions,
        labels: {
            artifacts: "Artifacts",
            potions: "Potions",
        },
    }
    const binding: Binding<typeof field> = {
        ...field,
        fieldKey: "category",
        get: () => value,
        set: next => setValue(current =>
            typeof next === "function" ? next(current) : next,
        ),
    }

    return <SelectOneField binding={binding} />
}

function SelectMultipleHarness() {
    const [value, setValue] = useState<
        (typeof categoryOptions)[keyof typeof categoryOptions][] | null
    >(null)
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

    return <SelectMultipleField binding={binding} />
}

function SelectEditDisplayHarness({
    onSubmit,
}: {
    onSubmit: (
        ids: Set<number>,
        values: {
            category: string | null
            stock: number | null
        },
    ) => void
}) {
    const fields = {
        category: {
            kind: kind.selectOne,
            label: "Category",
            options: categoryOptions,
            labels: {
                artifacts: "Artifacts",
                potions: "Potions",
            },
        },
        stock: {
            kind: kind.number,
            label: "Stock",
        },
    } as const
    const selectEdit = useSelectEdit({
        ids: new Set([1, 2]),
        fields,
        handleSubmit: onSubmit,
    })

    return <SelectEditDisplay selectEdit={selectEdit} />
}

function ItemRowHarness() {
    const fields = {
        stock: {
            kind: kind.number,
            label: "Stock",
        },
    } as const
    const selectEdit = useSelectEdit({
        ids: new Set([7]),
        fields,
        handleSubmit: vi.fn(),
    })

    return (
        <ItemRow id={7} selectEdit={selectEdit}>
            <span>Selected row</span>
        </ItemRow>
    )
}

describe("BooleanField intimacy: low", () => {
    it("functionality changes between no change and boolean values",
        async () => {
            const user = userEvent.setup()
            render(<BooleanHarness />)

            const select = screen.getByLabelText("Enabled")
            expect(select).toHaveValue("")

            await user.selectOptions(select, "true")
            expect(select).toHaveValue("true")
            expect(screen.getByTestId("boolean-value"))
                .toHaveTextContent("true")

            await user.selectOptions(select, "")
            expect(screen.getByTestId("boolean-value"))
                .toHaveTextContent("null")
        },
    )
})

describe("TextField intimacy: low", () => {
    it("functionality updates text values and converts blank input to null",
        async () => {
            const user = userEvent.setup()
            render(<TextHarness />)

            const input = screen.getByLabelText("Name")
            await user.type(input, "Moon Orb")
            expect(screen.getByTestId("text-value"))
                .toHaveTextContent("Moon Orb")

            await user.clear(input)
            expect(screen.getByTestId("text-value"))
                .toHaveTextContent("null")
        },
    )
})

describe("NumberField intimacy: low", () => {
    it("functionality converts numeric input and clears to null", async () => {
        const user = userEvent.setup()
        render(<NumberHarness />)

        const input = screen.getByLabelText("Stock")
        await user.type(input, "12")
        expect(screen.getByTestId("number-value"))
            .toHaveTextContent("12")

        await user.clear(input)
        expect(screen.getByTestId("number-value"))
            .toHaveTextContent("null")
    })
})

describe("SelectOneField intimacy: low", () => {
    it("functionality renders options and updates the selected value",
        async () => {
            const user = userEvent.setup()
            render(<SelectOneHarness />)

            const select = screen.getByLabelText("Category")
            expect(select).toHaveValue("")
            expect(screen.getByRole("option", {
                name: "No change",
            })).toBeInTheDocument()

            await user.selectOptions(select, "potions")
            expect(select).toHaveValue("potions")
        },
    )
})

describe("SelectMultipleField intimacy: low", () => {
    it("functionality toggles options and supports no-change state",
        async () => {
            const user = userEvent.setup()
            render(<SelectMultipleHarness />)

            const noChange = screen.getByLabelText("No change")
            const artifacts = screen.getByLabelText("Artifacts")

            expect(noChange).toBeChecked()
            await user.click(noChange)
            expect(noChange).not.toBeChecked()

            await user.click(artifacts)
            expect(artifacts).toBeChecked()
            await user.click(artifacts)
            expect(artifacts).not.toBeChecked()

            await user.click(noChange)
            expect(noChange).toBeChecked()
        },
    )
})

describe("SelectEditDisplay intimacy: high", () => {
    it("functionality selects all, edits fields, and submits", async () => {
        const user = userEvent.setup()
        const onSubmit = vi.fn()

        render(<SelectEditDisplayHarness onSubmit={onSubmit} />)

        const update = screen.getByRole("button", {
            name: "Update selected",
        })
        expect(update).toBeDisabled()

        await user.click(screen.getByLabelText("Select all"))
        await user.selectOptions(
            screen.getByLabelText("Category"),
            "potions",
        )
        await user.type(screen.getByLabelText("Stock"), "8")
        await user.click(update)

        expect(onSubmit).toHaveBeenCalledWith(
            new Set([1, 2]),
            {
                category: "potions",
                stock: 8,
            },
        )
    })
})

describe("ItemRow intimacy: medium", () => {
    it("functionality toggles selection for its row ID", async () => {
        const user = userEvent.setup()
        render(<ItemRowHarness />)

        const checkbox = screen.getByRole("checkbox")
        expect(checkbox).not.toBeChecked()

        await user.click(checkbox)

        expect(checkbox).toBeChecked()
        expect(screen.getByText("Selected row")).toBeInTheDocument()
    })
})
