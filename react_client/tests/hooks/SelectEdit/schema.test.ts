import { describe, expect, it } from "vitest"

import { kind } from "@/hooks/SelectEdit/schema"

describe("kind intimacy: low", () => {
    it("functionality exposes every supported edit field kind", () => {
        expect(kind).toEqual({
            boolean: "boolean",
            text: "text",
            number: "number",
            selectOne: "selectOne",
            selectMultiple: "selectMultiple",
        })
    })
})
