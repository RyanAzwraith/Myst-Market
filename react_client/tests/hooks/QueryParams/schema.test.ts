import { describe, expect, it } from "vitest"

import { kind } from "@/hooks/QueryParams/schema"

describe("kind intimacy: low", () => {
    it("functionality exposes every supported query field kind", () => {
        expect(kind).toEqual({
            boolean: "boolean",
            selectOne: "selectOne",
            selectMultiple: "selectMultiple",
            text: "text",
        })
    })
})