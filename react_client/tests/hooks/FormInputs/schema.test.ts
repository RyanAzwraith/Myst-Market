import { describe, expect, it } from "vitest"

import { kind } from "@/hooks/FormInputs/schema"

describe("kind intimacy: low", () => {
    it("functionality exposes every supported input field kind", () => {
        expect(kind).toEqual({
            boolean: "boolean",
            text: "text",
            number: "number",
            email: "email",
            password: "password",
            selectOne: "selectOne",
            selectMultiple: "selectMultiple",
        })
    })
})
