import { describe, expect, it } from "vitest"

import { adminSort, status } from "@/features/order/schema"

describe("order schema intimacy: low", () => {
    it("functionality exposes supported statuses", () => {
        expect(status).toEqual({
            pending: "pending",
            processing: "processing",
            shipped: "shipped",
            delivered: "delivered",
            cancelled: "cancelled",
            error: "error",
        })
    })

    it("exposes supported admin sort fields", () => {
        expect(adminSort).toEqual({
            createdAt: "createdAt",
            cost: "cost",
            status: "status",
        })
    })
})
