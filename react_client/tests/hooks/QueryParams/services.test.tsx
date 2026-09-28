import { describe, expect, it, vi } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { useNavigate } from "react-router-dom"

import { renderWithRouter } from "../../utils"

import {
    bindField,
    matchCodecs,
    useQueryParams,
} from "@/hooks/QueryParams/services"
import { kind } from "@/hooks/QueryParams/schema"
import { queryFields } from "./QueryParamsMock"

describe("matchCodecs", () => {
    it("parses and serializes boolean values", () => {
        const codec = matchCodecs(queryFields.enabled)

        expect(codec.parse("true")).toBe(true)
        expect(codec.parse("false")).toBe(false)
        expect(codec.parse(null)).toBe(false)
        expect(codec.serialize(true)).toBe("true")
        expect(codec.serialize(false)).toBe("")
    })

    it("parses valid select-one values and falls back to the default", () => {
        const codec = matchCodecs(queryFields.sort)

        expect(codec.parse("price")).toBe("price")
        expect(codec.parse("unknown")).toBe("name")
        expect(codec.parse(null)).toBe("name")
        expect(codec.serialize("price")).toBe("price")
    })

    it("keeps only valid select-multiple values", () => {
        const codec = matchCodecs(queryFields.categories)

        expect(codec.parse("magic,unknown,weapon")).toEqual([
            "magic",
            "weapon",
        ])
        expect(codec.parse(null)).toEqual([])
        expect(codec.serialize(["weapon", "magic"])).toBe("weapon,magic")
    })

    it("maps missing text values to an empty string", () => {
        const codec = matchCodecs(queryFields.search)

        expect(codec.parse(null)).toBe("")
        expect(codec.parse("moon")).toBe("moon")
        expect(codec.serialize("sword")).toBe("sword")
    })

    it("returns the codec for each supported field kind", () => {
        const fieldByKind = [
            queryFields.enabled,
            queryFields.sort,
            queryFields.categories,
            queryFields.search,
        ]

        expect(fieldByKind.map((field) => field.kind)).toEqual([
            kind.boolean,
            kind.selectOne,
            kind.selectMultiple,
            kind.text,
        ])
        fieldByKind.forEach((field) => {
            expect(matchCodecs(field)).toHaveProperty("parse")
            expect(matchCodecs(field)).toHaveProperty("serialize")
        })
    })
})

describe("bindField", () => {
    it("gets a value from its URL parameter", () => {
        const field = queryFields.search
        const binding = bindField({
            field,
            fieldKey: "search",
            navigate: vi.fn(),
            urlParams: new URLSearchParams("search=moon"),
        })

        expect(binding.get()).toBe("moon")
        expect(binding.fieldKey).toBe("search")
        expect(binding.label).toBe("Search")
    })

    it("navigates with a serialized value", () => {
        const navigate = vi.fn()
        const binding = bindField({
            field: queryFields.enabled,
            fieldKey: "enabled",
            navigate,
            urlParams: new URLSearchParams(),
        })

        binding.set(true)

        expect(navigate).toHaveBeenCalledTimes(1)
        expect(navigate.mock.calls[0][0]?.toString()).toBe("enabled=true")
    })

    it("supports updater functions", () => {
        const navigate = vi.fn()
        const binding = bindField({
            field: queryFields.search,
            fieldKey: "search",
            navigate,
            urlParams: new URLSearchParams("search=moon"),
        })

        binding.set((previous) => `${previous}light`)

        expect(navigate.mock.calls[0][0]?.toString()).toBe("search=moonlight")
    })

    it("removes a parameter when its serialized value is empty", () => {
        const navigate = vi.fn()
        const binding = bindField({
            field: queryFields.search,
            fieldKey: "search",
            navigate,
            urlParams: new URLSearchParams("search=moon&enabled=true"),
        })

        binding.set("")

        expect(navigate.mock.calls[0][0]?.toString()).toBe("enabled=true")
    })
})

function QueryParamsHarness() {
    const navigate = useNavigate()
    const { bindings, values } = useQueryParams(queryFields, "/results")

    return (
        <>
            <output data-testid="values">{JSON.stringify(values())}</output>
            <button
                onClick={() => bindings.search.set("arcane")}
                type="button"
            >
                Set search
            </button>
            <button
                onClick={() => bindings.search.set("")}
                type="button"
            >
                Clear search
            </button>
            <button onClick={() => navigate(-1)} type="button">
                Back
            </button>
            <button onClick={() => navigate(1)} type="button">
                Forward
            </button>
        </>
    )
}

describe("useQueryParams", () => {
    it("reads every field from the current URL", () => {
        renderWithRouter(<QueryParamsHarness />, {
            initialPath:
                "/results?enabled=true&sort=price&" +
                "categories=magic,unknown&search=moon",
        })

        expect(screen.getByTestId("values")).toHaveTextContent(
            JSON.stringify({
                enabled: true,
                sort: "price",
                categories: ["magic"],
                search: "moon",
            }),
        )
    })

    it("updates the URL and values when a binding changes", async () => {
        const user = userEvent.setup()

        renderWithRouter(<QueryParamsHarness />, {
            initialPath: "/results?enabled=true&search=moon",
        })
        await user.click(screen.getByRole("button", { name: "Set search" }))

        expect(screen.getByTestId("location")).toHaveTextContent(
            "/results?enabled=true&search=arcane",
        )
        expect(screen.getByTestId("values")).toHaveTextContent(
            JSON.stringify({
                enabled: true,
                sort: "name",
                categories: [],
                search: "arcane",
            }),
        )
    })

    it("removes empty values while preserving other URL parameters", async () => {
        const user = userEvent.setup()

        renderWithRouter(<QueryParamsHarness />, {
            initialPath: "/results?enabled=true&search=moon",
        })
        await user.click(
            screen.getByRole("button", { name: "Clear search" }),
        )

        expect(screen.getByTestId("location")).toHaveTextContent(
            "/results?enabled=true",
        )
    })

    it("tracks back and forward navigation with the current bindings", async () => {
        const user = userEvent.setup()

        renderWithRouter(<QueryParamsHarness />, {
            initialPath: "/results?search=first",
        })
        await user.click(screen.getByRole("button", { name: "Set search" }))
        expect(screen.getByTestId("location")).toHaveTextContent(
            "/results?search=arcane",
        )

        await user.click(screen.getByRole("button", { name: "Back" }))
        await waitFor(() => {
            expect(screen.getByTestId("location")).toHaveTextContent(
                "/results?search=first",
            )
        })
        expect(screen.getByTestId("values")).toHaveTextContent(
            JSON.stringify({
                enabled: false,
                sort: "name",
                categories: [],
                search: "first",
            }),
        )

        await user.click(screen.getByRole("button", { name: "Forward" }))
        await waitFor(() => {
            expect(screen.getByTestId("location")).toHaveTextContent(
                "/results?search=arcane",
            )
        })
    })
})
