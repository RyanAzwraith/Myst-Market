import { describe, expect, it } from "vitest"

import { kind } from "@/hooks/QueryParams/schema"

describe("kind", () => {
    it("contains the supported field kinds", () => {
        expect(kind).toEqual({
            boolean: "boolean",
            selectOne: "selectOne",
            selectMultiple: "selectMultiple",
            text: "text",
        })
    })

    it("uses distinct values for each field kind", () => {
        const values = Object.values(kind)

        expect(new Set(values).size).toBe(values.length)
    })
})
