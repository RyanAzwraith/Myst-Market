import { describe, expect, it } from "vitest"

import "./QueryParamsMock"

import * as queryParams from "@/hooks/QueryParams"

describe("QueryParams index exports", () => {
    it("exports the query params hook", () => {
        expect(queryParams.useQueryParams).toBeTypeOf("function")
    })

    it("exports every query params field component", () => {
        expect(queryParams.BooleanField).toBeTypeOf("function")
        expect(queryParams.SelectOneField).toBeTypeOf("function")
        expect(queryParams.SelectMultipleField).toBeTypeOf("function")
        expect(queryParams.TextField).toBeTypeOf("function")
        expect(queryParams.QueryParamsContainer).toBeTypeOf("function")
        expect(queryParams.QueryParamField).toBeTypeOf("function")
        expect(queryParams.QueryParamsFields).toBeTypeOf("function")
    })

})
