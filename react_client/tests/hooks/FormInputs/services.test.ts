import { act, renderHook } from "@testing-library/react"
import type { Dispatch, SetStateAction } from "react"
import { describe, expect, it, vi } from "vitest"

import {
    bindField,
    useFormInputs,
} from "@/hooks/FormInputs/services"
import {
    kind,
    type BooleanFieldDef,
    type FieldDefs,
    type FieldValues,
    type TextFieldDef,
} from "@/hooks/FormInputs/schema"

const statusOptions = {
    draft: "draft",
    published: "published",
}

const statusLabels = {
    draft: "Draft",
    published: "Published",
}

describe("useFormInputs intimacy: high", () => {
    it("functionality initializes values and updates bindings", () => {
        const fields = {
            name: {
                kind: kind.text,
                initial: "Moon Orb",
            },
            enabled: {
                kind: kind.boolean,
                initial: true,
                defaultValue: false,
            },
        } satisfies FieldDefs

        const { result } = renderHook(() => useFormInputs({ fields }))

        expect(result.current.values).toEqual({
            name: "Moon Orb",
            enabled: true,
        })

        act(() => {
            result.current.bindings.name.set(
                previous => `${previous ?? ""} updated`,
            )
            result.current.bindings.enabled.set(previous => !previous)
        })

        expect(result.current.values).toEqual({
            name: "Moon Orb updated",
            enabled: false,
        })
    })

    it("uses field defaults when validating missing values", () => {
        const fields = {
            status: {
                kind: kind.selectOne,
                options: statusOptions,
                labels: statusLabels,
                defaultValue: statusOptions.draft,
            },
            tags: {
                kind: kind.selectMultiple,
                options: statusOptions,
                labels: statusLabels,
                defaultValue: [statusOptions.published],
            },
        } satisfies FieldDefs

        const { result } = renderHook(() => useFormInputs({ fields }))

        expect(result.current.values).toEqual({
            status: null,
            tags: null,
        })

        act(() => {
            expect(result.current.validate()).toBeNull()
        })

        expect(result.current.values).toEqual({
            status: "draft",
            tags: ["published"],
        })
    })

    it("returns and exposes custom field validation errors", () => {
        const validate = vi.fn((value: string | null) =>
            value ? null : "Name required",
        )
        const fields = {
            name: {
                kind: kind.text,
                validate,
            },
        } satisfies FieldDefs
        const { result } = renderHook(() => useFormInputs({ fields }))

        let validationError: string | null = null
        act(() => {
            validationError = result.current.validate()
        })

        expect(validationError).toBe("Name required")
        expect(result.current.errorMsg).toBe("Name required")
        expect(validate).toHaveBeenCalledWith(null)
    })

    it("validates required and malformed email values", () => {
        const fields = {
            email: {
                kind: kind.email,
            },
        } satisfies FieldDefs
        const { result } = renderHook(() => useFormInputs({ fields }))

        let validationError: string | null = null
        act(() => {
            validationError = result.current.validate()
        })
        expect(validationError).toBe("Email required")

        act(() => {
            result.current.bindings.email.set("not-an-email")
        })
        act(() => {
            validationError = result.current.validate()
        })
        expect(validationError).toBe("Invalid email")

        act(() => {
            result.current.bindings.email.set("user@example.com")
        })
        act(() => {
            validationError = result.current.validate()
        })
        expect(validationError).toBeNull()
    })

    it("runs form-level validation with normalized values", () => {
        const onValidate = vi.fn(() => "Form is invalid")
        const fields = {
            status: {
                kind: kind.selectOne,
                options: statusOptions,
                labels: statusLabels,
                defaultValue: statusOptions.published,
            },
        } satisfies FieldDefs
        const { result } = renderHook(() =>
            useFormInputs({ fields, onValidate }),
        )

        let validationError: string | null = null
        act(() => {
            validationError = result.current.validate()
        })

        expect(validationError).toBe("Form is invalid")
        expect(onValidate).toHaveBeenCalledWith({
            status: statusOptions.published,
        })
        expect(result.current.errorMsg).toBe("Form is invalid")
    })

    it("resets values to initial or supplied values and clears errors", () => {
        const fields = {
            name: {
                kind: kind.text,
                initial: "Initial name",
            },
            enabled: {
                kind: kind.boolean,
                initial: true,
                defaultValue: false,
            },
        } satisfies FieldDefs
        const { result } = renderHook(() => useFormInputs({ fields }))

        act(() => {
            result.current.bindings.name.set("Changed name")
            result.current.bindings.enabled.set(false)
            result.current.setErrorMsg("Invalid form")
        })

        act(() => {
            result.current.reset({ name: "Reset name" })
        })

        expect(result.current.values).toEqual({
            name: "Reset name",
            enabled: true,
        })
        expect(result.current.errorMsg).toBeNull()

        act(() => {
            result.current.reset()
        })

        expect(result.current.values).toEqual({
            name: "Initial name",
            enabled: true,
        })
    })

    it("prevents invalid submission and does not call onSubmit", () => {
        const onSubmit = vi.fn()
        const fields = {
            name: {
                kind: kind.text,
                validate: (value: string | null) =>
                    value ? null : "Name required",
            },
        } satisfies FieldDefs
        const { result } = renderHook(() =>
            useFormInputs({ fields, onSubmit }),
        )
        const preventDefault = vi.fn()

        act(() => {
            result.current.handleSubmit({
                preventDefault,
            } as never)
        })

        expect(preventDefault).toHaveBeenCalledOnce()
        expect(onSubmit).not.toHaveBeenCalled()
        expect(result.current.errorMsg).toBe("Name required")
    })

    it("submits valid values and resets the form", () => {
        const onSubmit = vi.fn()
        const fields = {
            status: {
                kind: kind.selectOne,
                options: statusOptions,
                labels: statusLabels,
                defaultValue: statusOptions.published,
            },
        } satisfies FieldDefs
        const { result } = renderHook(() =>
            useFormInputs({ fields, onSubmit }),
        )
        const preventDefault = vi.fn()

        act(() => {
            result.current.handleSubmit({
                preventDefault,
            } as never)
        })

        expect(preventDefault).toHaveBeenCalledOnce()
        expect(onSubmit).toHaveBeenCalledWith(
            { status: statusOptions.published },
            expect.any(Function),
            expect.any(Function),
        )
        expect(result.current.values).toEqual({ status: null })
    })
})

describe("bindField intimacy: low", () => {
    it("functionality exposes field metadata and reads its value", () => {
        const field: TextFieldDef = {
            kind: kind.text,
            label: "Name",
        }
        type Fields = { name: TextFieldDef }
        const fieldValues: FieldValues<Fields> = { name: "Moon Orb" }
        const setFieldValues: Dispatch<
            SetStateAction<FieldValues<Fields>>
        > = vi.fn()

        const binding = bindField({
            fieldValues,
            setFieldValues,
            fieldKey: "name",
            field,
        })

        expect(binding.fieldKey).toBe("name")
        expect(binding.label).toBe("Name")
        expect(binding.get()).toBe("Moon Orb")
    })

    it("updates one field while preserving other values", () => {
        const nameField: TextFieldDef = {
            kind: kind.text,
        }
        const enabledField: BooleanFieldDef = {
            kind: kind.boolean,
            defaultValue: false,
        }
        type Fields = {
            name: TextFieldDef
            enabled: BooleanFieldDef
        }
        let fieldValues: FieldValues<Fields> = {
            name: null,
            enabled: true,
        }
        const setFieldValues: Dispatch<
            SetStateAction<FieldValues<Fields>>
        > = next => {
            fieldValues = typeof next === "function"
                ? next(fieldValues)
                : next
        }

        const binding = bindField({
            fieldValues,
            setFieldValues,
            fieldKey: "name",
            field: nameField,
        })

        binding.set(previous => `${previous ?? ""}Orb`)

        expect(fieldValues).toEqual({
            name: "Orb",
            enabled: true,
        })
    })
})
