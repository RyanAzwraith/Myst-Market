import userEvent from "@testing-library/user-event"
import { render, screen } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import {
    BooleanField,
    EmailField,
    FormInputsContainer,
    FormInputsField,
    FormInputsForm,
    NumberField,
    PasswordField,
    SelectMultipleField,
    SelectOneField,
    TextAreaField,
    TextField,
} from "@/hooks/FormInputs/components"
import { useFormInputs } from "@/hooks/FormInputs/services"
import {
    kind,
    type Binding,
    type BooleanFieldDef,
    type EmailFieldDef,
    type FieldDef,
    type FieldDefs,
    type FieldValues,
    type NumberFieldDef,
    type PasswordFieldDef,
    type SelectMultipleFieldDef,
    type SelectOneFieldDef,
    type TextFieldDef,
} from "@/hooks/FormInputs/schema"

const statusOptions = {
    draft: "draft",
    published: "published",
}

function BooleanHarness() {
    const [value, setValue] = useState<boolean | null>(null)
    const field: BooleanFieldDef = {
        kind: kind.boolean,
        label: "Enabled",
        defaultValue: false,
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
            <output data-testid="boolean-value">{String(value)}</output>
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
            <output data-testid="text-value">{String(value)}</output>
        </>
    )
}

function TextAreaHarness() {
    const [value, setValue] = useState<string | null>(null)
    const field: TextFieldDef = {
        kind: kind.text,
        label: "Description",
        placeholder: "Product description",
    }
    const binding: Binding<TextFieldDef> = {
        ...field,
        fieldKey: "description",
        get: () => value,
        set: next => setValue(current =>
            typeof next === "function" ? next(current) : next,
        ),
    }

    return (
        <>
            <TextAreaField binding={binding} />
            <output data-testid="textarea-value">{String(value)}</output>
        </>
    )
}

function NumberHarness() {
    const [value, setValue] = useState<number | null>(null)
    const field: NumberFieldDef = {
        kind: kind.number,
        label: "Stock",
        step: 1,
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
            <NumberField binding={binding} positiveInteger />
            <output data-testid="number-value">{String(value)}</output>
        </>
    )
}

function EmailHarness() {
    const [value, setValue] = useState<string | null>(null)
    const field: EmailFieldDef = {
        kind: kind.email,
        label: "Email",
        placeholder: "Email address",
    }
    const binding: Binding<EmailFieldDef> = {
        ...field,
        fieldKey: "email",
        get: () => value,
        set: next => setValue(current =>
            typeof next === "function" ? next(current) : next,
        ),
    }

    return (
        <>
            <EmailField binding={binding} />
            <output data-testid="email-value">{String(value)}</output>
        </>
    )
}

function PasswordHarness() {
    const [value, setValue] = useState<string | null>(null)
    const field: PasswordFieldDef = {
        kind: kind.password,
        label: "Password",
        placeholder: "Password",
    }
    const binding: Binding<PasswordFieldDef> = {
        ...field,
        fieldKey: "password",
        get: () => value,
        set: next => setValue(current =>
            typeof next === "function" ? next(current) : next,
        ),
    }

    return (
        <>
            <PasswordField binding={binding} />
            <output data-testid="password-value">{String(value)}</output>
        </>
    )
}

function SelectOneHarness() {
    const [value, setValue] = useState<
        (typeof statusOptions)[keyof typeof statusOptions] | null
    >(null)
    const field: SelectOneFieldDef<typeof statusOptions> = {
        kind: kind.selectOne,
        label: "Status",
        options: statusOptions,
        labels: {
            draft: "Draft",
            published: "Published",
        },
        defaultValue: statusOptions.draft,
    }
    const binding: Binding<typeof field> = {
        ...field,
        fieldKey: "status",
        get: () => value,
        set: next => setValue(current =>
            typeof next === "function" ? next(current) : next,
        ),
    }

    return (
        <>
            <SelectOneField binding={binding} />
            <output data-testid="select-one-value">{String(value)}</output>
        </>
    )
}

function SelectMultipleHarness() {
    const [value, setValue] = useState<
        (typeof statusOptions)[keyof typeof statusOptions][] | null
    >(["draft"])
    const field: SelectMultipleFieldDef<
        typeof statusOptions
    > = {
        kind: kind.selectMultiple,
        label: "Statuses",
        options: statusOptions,
        labels: {
            draft: "Draft",
            published: "Published",
        },
    }
    const binding: Binding<typeof field> = {
        ...field,
        fieldKey: "statuses",
        get: () => value,
        set: next => setValue(current =>
            typeof next === "function" ? next(current) : next,
        ),
    }

    return (
        <>
            <SelectMultipleField binding={binding} />
            <output data-testid="select-multiple-value">
                {value?.join(",") ?? "null"}
            </output>
        </>
    )
}

const formFields = {
    name: {
        kind: kind.text,
        label: "Name",
        validate: (value: string | null) =>
            value ? null : "Name required",
    },
    status: {
        kind: kind.selectOne,
        label: "Status",
        options: statusOptions,
        labels: {
            draft: "Draft",
            published: "Published",
        },
        defaultValue: statusOptions.draft,
    },
} satisfies FieldDefs

function FormInputsFieldHarness() {
    const formInputs = useFormInputs({ fields: formFields })
    const bindings = Object.values(formInputs.bindings)

    return (
        <>
            {bindings.map(binding => (
                <FormInputsField
                    key={binding.fieldKey}
                    binding={binding as Binding<FieldDef>}
                />
            ))}
        </>
    )
}

function FormInputsFormHarness({
    onSubmit,
}: {
    onSubmit?: (
        values: FieldValues<typeof formFields>,
    ) => void
}) {
    const formInputs = useFormInputs({
        fields: formFields,
        onSubmit: values => onSubmit?.(values),
    })

    return (
        <FormInputsForm
            formInputs={
                formInputs as unknown as
                    import("@/hooks/FormInputs/schema").FormInputs<
                        FieldDefs,
                        FieldValues<FieldDefs>
                    >
            }
            submitLabel="Save form"
            hasResetButton
            className="form-class"
        />
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

describe("TextAreaField intimacy: low", () => {
    it("functionality updates and clears textarea values", async () => {
        const user = userEvent.setup()
        render(<TextAreaHarness />)

        const textarea = screen.getByLabelText("Description")
        await user.type(textarea, "A moonlit artifact")

        expect(screen.getByTestId("textarea-value"))
            .toHaveTextContent("A moonlit artifact")

        await user.clear(textarea)
        expect(screen.getByTestId("textarea-value"))
            .toHaveTextContent("null")
    })
})

describe("NumberField intimacy: low", () => {
    it("functionality converts numeric input and clears to null", async () => {
        const user = userEvent.setup()
        render(<NumberHarness />)

        const input = screen.getByLabelText("Stock")
        expect(input).toHaveAttribute("min", "0")
        expect(input).toHaveAttribute("step", "1")

        await user.type(input, "12")
        expect(screen.getByTestId("number-value"))
            .toHaveTextContent("12")

        await user.clear(input)
        expect(screen.getByTestId("number-value"))
            .toHaveTextContent("null")
    })
})

describe("EmailField intimacy: low", () => {
    it("functionality renders an email input and updates its value",
        async () => {
            const user = userEvent.setup()
            render(<EmailHarness />)

            const input = screen.getByLabelText("Email")
            expect(input).toHaveAttribute("type", "email")

            await user.type(input, "user@example.com")
            expect(screen.getByTestId("email-value"))
                .toHaveTextContent("user@example.com")
        },
    )
})

describe("PasswordField intimacy: low", () => {
    it("functionality renders a password input and updates its value",
        async () => {
            const user = userEvent.setup()
            render(<PasswordHarness />)

            const input = screen.getByLabelText("Password")
            expect(input).toHaveAttribute("type", "password")

            await user.type(input, "secret")
            expect(screen.getByTestId("password-value"))
                .toHaveTextContent("secret")
        },
    )
})

describe("SelectOneField intimacy: low", () => {
    it("functionality renders options and updates the selected value",
        async () => {
            const user = userEvent.setup()
            render(<SelectOneHarness />)

            const select = screen.getByLabelText("Status")
            expect(select).toHaveValue("draft")
            expect(screen.getByRole("option", {
                name: "Published",
            })).toBeInTheDocument()

            await user.selectOptions(select, "published")

            expect(select).toHaveValue("published")
            expect(screen.getByTestId("select-one-value"))
                .toHaveTextContent("published")
        },
    )
})

describe("SelectMultipleField intimacy: low", () => {
    it("functionality toggles multiple selected options", async () => {
        const user = userEvent.setup()
        render(<SelectMultipleHarness />)

        const draft = screen.getByLabelText("Draft")
        const published = screen.getByLabelText("Published")

        expect(draft).toBeChecked()

        await user.click(published)
        expect(screen.getByTestId("select-multiple-value"))
            .toHaveTextContent("draft,published")

        await user.click(draft)
        expect(draft).not.toBeChecked()
        expect(screen.getByTestId("select-multiple-value"))
            .toHaveTextContent("published")
    })
})

describe("FormInputsContainer intimacy: low", () => {
    it("functionality submits its children and forwards the class name",
        async () => {
            const user = userEvent.setup()
            const submit = vi.fn()

            const { container } = render(
                <FormInputsContainer
                    submit={submit}
                    className="form-class"
                >
                    <button type="submit">Save</button>
                </FormInputsContainer>,
            )

            expect(container.querySelector("form"))
                .toHaveClass("form-class")

            await user.click(screen.getByRole("button", { name: "Save" }))

            expect(submit).toHaveBeenCalledOnce()
        },
    )
})

describe("FormInputsField intimacy: medium", () => {
    it("functionality renders the field control selected by each kind", () => {
        render(<FormInputsFieldHarness />)

        expect(screen.getByLabelText("Name")).toBeInTheDocument()
        expect(screen.getByLabelText("Status")).toBeInTheDocument()
    })
})

describe("FormInputsForm intimacy: high", () => {
    it("functionality renders, submits, and resets the form", async () => {
        const user = userEvent.setup()
        const onSubmit = vi.fn()
        render(<FormInputsFormHarness onSubmit={onSubmit} />)

        const name = screen.getByLabelText("Name")
        await user.type(name, "Moon Orb")
        await user.click(screen.getByRole("button", { name: "Save form" }))

        expect(onSubmit).toHaveBeenCalledWith({
            name: "Moon Orb",
            status: "draft",
        })
        expect(name).toHaveValue("")

        await user.type(name, "Changed")
        await user.click(screen.getByRole("button", { name: "Reset" }))

        expect(name).toHaveValue("")
    })

    it("shows validation errors and does not submit invalid values",
        async () => {
            const user = userEvent.setup()
            const onSubmit = vi.fn()
            render(<FormInputsFormHarness onSubmit={onSubmit} />)

            await user.click(screen.getByRole("button", {
                name: "Save form",
            }))

            expect(screen.getByText("Name required"))
                .toBeInTheDocument()
            expect(onSubmit).not.toHaveBeenCalled()
        },
    )
})
