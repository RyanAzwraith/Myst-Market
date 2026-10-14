import { act, renderHook } from "@testing-library/react"
import type { Dispatch, SetStateAction } from "react"
import { describe, expect, it, vi } from "vitest"

import {
    bindField,
    useSelectEdit,
} from "@/hooks/SelectEdit/services"
import {
    kind,
    type FieldDefs,
    type FieldValues,
    type TextFieldDef,
} from "@/hooks/SelectEdit/schema"

const options = {
    artifacts: "artifacts",
    potions: "potions",
}

const fields = {
    category: {
        kind: kind.selectOne,
        label: "Category",
        defaultValue: "artifacts",
        options,
        labels: {
            artifacts: "Artifacts",
            potions: "Potions",
        },
    },
    stock: {
        kind: kind.number,
        label: "Stock",
    },
} satisfies FieldDefs

describe("useSelectEdit intimacy: high", () => {
    it("functionality selects only known IDs and exposes selection state",
        () => {
            const { result } = renderHook(() => useSelectEdit({
                ids: new Set([1, 2]),
                fields,
                handleSubmit: vi.fn(),
            }))

            expect(result.current.selectedIds).toEqual(new Set())
            expect(result.current.isAllSelected).toBe(false)
            expect(result.current.isSelected(1)).toBe(false)

            act(() => {
                result.current.toggleSelect(1)
                result.current.toggleSelect(99)
            })

            expect(result.current.selectedIds).toEqual(new Set([1]))
            expect(result.current.isSelected(1)).toBe(true)
            expect(result.current.isSelected(99)).toBe(false)
        },
    )

    it("selects all valid IDs and toggles them off", () => {
        const { result } = renderHook(() => useSelectEdit({
            ids: new Set([4, 8]),
            fields,
            handleSubmit: vi.fn(),
        }))

        act(() => result.current.toggleSelectAll())

        expect(result.current.selectedIds).toEqual(new Set([4, 8]))
        expect(result.current.isAllSelected).toBe(true)

        act(() => result.current.toggleSelectAll())

        expect(result.current.selectedIds).toEqual(new Set())
        expect(result.current.isAllSelected).toBe(false)
    })

    it("submits selected IDs with the current field values", () => {
        const handleSubmit = vi.fn()
        const { result } = renderHook(() => useSelectEdit({
            ids: new Set([2, 5]),
            fields,
            handleSubmit,
        }))

        act(() => {
            result.current.toggleSelect(2)
            result.current.bindings.category.set("potions")
            result.current.bindings.stock.set(12)
        })
        act(() => result.current.submit())

        expect(handleSubmit).toHaveBeenCalledWith(
            new Set([2]),
            {
                category: "potions",
                stock: 12,
            },
        )
    })

    it("does not select anything when the available ID set is empty", () => {
        const { result } = renderHook(() => useSelectEdit({
            ids: new Set(),
            fields,
            handleSubmit: vi.fn(),
        }))

        act(() => result.current.toggleSelectAll())

        expect(result.current.selectedIds).toEqual(new Set())
        expect(result.current.isAllSelected).toBe(false)
    })
})

describe("bindField intimacy: low", () => {
    it("functionality exposes a field key and reads its value", () => {
        const textField: TextFieldDef = {
            kind: kind.text,
            label: "Search",
        }
        type TextFields = { search: TextFieldDef }
        let fieldValues: FieldValues<TextFields> = { search: null }

        const setFieldValues: Dispatch<
            SetStateAction<FieldValues<TextFields>>
        > = next => {
            fieldValues = typeof next === "function"
                ? next(fieldValues)
                : next
        }

        const binding = bindField({
            fieldValues,
            setFieldValues,
            fieldKey: "search",
            field: textField,
        })

        expect(binding.fieldKey).toBe("search")
        expect(binding.get()).toBeNull()

        binding.set("orb")
        expect(fieldValues.search).toBe("orb")
    })
})
