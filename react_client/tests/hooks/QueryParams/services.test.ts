import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { createWrapper } from "../../utils"
import {
    bindField,
    matchCodecs,
    useQueryParams,
} from "@/hooks/QueryParams/services"
import {
    kind,
    type BooleanFieldDef,
    type FieldDefs,
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

const booleanField: BooleanFieldDef = {
    kind: kind.boolean,
    label: "Enabled",
}

const sortField: SelectOneFieldDef<typeof sortOptions> = {
    kind: kind.selectOne,
    label: "Sort",
    defaultValue: sortOptions.newest,
    options: sortOptions,
    labels: {
        newest: "Newest",
        price: "Price",
    },
}

const categoryField: SelectMultipleFieldDef<
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

const textField: TextFieldDef = {
    kind: kind.text,
    label: "Search",
}

const fields = {
    enabled: booleanField,
    sort: sortField,
    categories: categoryField,
    search: textField,
} satisfies FieldDefs

describe("matchCodecs intimacy: low", () => {
    it("functionality parses and serializes every field kind", () => {
        const booleanCodec = matchCodecs(booleanField)
        const sortCodec = matchCodecs(sortField)
        const categoryCodec = matchCodecs(categoryField)
        const textCodec = matchCodecs(textField)

        expect(booleanCodec.parse("true")).toBe(true)
        expect(booleanCodec.parse("false")).toBe(false)
        expect(booleanCodec.serialize(true)).toBe("true")
        expect(booleanCodec.serialize(false)).toBe("")

        expect(sortCodec.parse("price")).toBe("price")
        expect(sortCodec.parse("unknown")).toBe("newest")
        expect(sortCodec.parse(null)).toBe("newest")
        expect(sortCodec.serialize("price")).toBe("price")

        expect(categoryCodec.parse("artifacts,invalid,potions"))
            .toEqual(["artifacts", "potions"])
        expect(categoryCodec.parse(null)).toEqual([])
        expect(categoryCodec.serialize(["potions", "artifacts"]))
            .toBe("potions,artifacts")

        expect(textCodec.parse(null)).toBe("")
        expect(textCodec.parse("amulet")).toBe("amulet")
        expect(textCodec.serialize("amulet")).toBe("amulet")
    })
})

describe("bindField intimacy: low", () => {
    it("functionality exposes the field and reads its URL value", () => {
        const navigate = vi.fn()
        const binding = bindField({
            urlParams: new URLSearchParams("search=amulet"),
            navigate,
            fieldKey: "search",
            field: textField,
        })

        expect(binding.fieldKey).toBe("search")
        expect(binding.label).toBe("Search")
        expect(binding.get()).toBe("amulet")
        expect(navigate).not.toHaveBeenCalled()
    })

    it("serializes a new value while preserving other parameters", () => {
        const navigate = vi.fn()
        const binding = bindField({
            urlParams: new URLSearchParams(
                "search=amulet&sort=price",
            ),
            navigate,
            fieldKey: "search",
            field: textField,
        })

        binding.set("orb")

        const nextParams = navigate.mock.calls[0][0] as URLSearchParams
        expect(nextParams.get("search")).toBe("orb")
        expect(nextParams.get("sort")).toBe("price")
    })

    it("supports updater functions and removes empty serialized values",
        () => {
            const navigate = vi.fn()
            const binding = bindField({
                urlParams: new URLSearchParams("enabled=true"),
                navigate,
                fieldKey: "enabled",
                field: booleanField,
            })

            binding.set(previous => !previous)
            let nextParams = navigate.mock.calls[0][0] as URLSearchParams
            expect(nextParams.has("enabled")).toBe(false)

            binding.set(true)
            nextParams = navigate.mock.calls[1][0] as URLSearchParams
            expect(nextParams.get("enabled")).toBe("true")
        },
    )
})

describe("useQueryParams intimacy: medium", () => {
    it("functionality maps URL parameters into typed values", () => {
        const { wrapper } = createWrapper(
            "/shop?enabled=true&sort=price"
            + "&categories=artifacts,invalid&search=amulet",
        )
        const { result } = renderHook(
            () => useQueryParams(fields, "/shop"),
            { wrapper },
        )

        expect(result.current.values()).toEqual({
            enabled: true,
            sort: "price",
            categories: ["artifacts"],
            search: "amulet",
        })
    })

    it("uses codec defaults when parameters are absent or invalid", () => {
        const { wrapper } = createWrapper(
            "/shop?sort=invalid&categories=invalid",
        )
        const { result } = renderHook(
            () => useQueryParams(fields, "/shop"),
            { wrapper },
        )

        expect(result.current.values()).toEqual({
            enabled: false,
            sort: "newest",
            categories: [],
            search: "",
        })
    })

    it("updates URL-backed values and preserves the other fields", async () => {
        const { wrapper } = createWrapper(
            "/shop?enabled=true&sort=newest&search=amulet",
        )
        const { result } = renderHook(
            () => useQueryParams(fields, "/shop"),
            { wrapper },
        )

        act(() => {
            result.current.bindings.search.set("orb")
        })

        await waitFor(() => {
            expect(result.current.values()).toEqual({
                enabled: true,
                sort: "newest",
                categories: [],
                search: "orb",
            })
        })
    })

    it("removes a parameter when its serialized value is empty",
        async () => {
            const { wrapper } = createWrapper(
                "/shop?enabled=true&search=amulet",
            )
            const { result } = renderHook(
                () => useQueryParams(fields, "/shop"),
                { wrapper },
            )

            act(() => {
                result.current.bindings.enabled.set(false)
            })

            await waitFor(() => {
                expect(result.current.values().enabled).toBe(false)
                expect(result.current.values().search).toBe("amulet")
            })
        },
    )
})