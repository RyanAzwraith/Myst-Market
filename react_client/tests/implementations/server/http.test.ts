import { beforeEach, describe, expect, it, vi } from "vitest"

import { config } from "@/core"
import { useAuthState } from "@/features/auth"
import { httpImplementation } from "@/implementations/server/http"
import { serverRoutes } from "@/implementations/server/http/serverRoutes"
import { userFactory } from "../../../mock_data/user"

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json",
        },
    })
}

describe("http order creation intimacy: medium", () => {
    beforeEach(() => {
        useAuthState.getState().login("current-token", userFactory())
    })

    it("sends the complete authenticated checkout request", async () => {
        const request = {
            items: [{ productId: 3, quantity: 1 }],
            address: {
                countryCode: "AU",
                postcode: "3000",
                state: "Victoria",
                city: "Melbourne",
                street: "1 Main Street",
            },
            deliveryNote: "",
            user: {
                name: "Registered Adventurer",
                email: "registered@example.com",
            },
            isCreatingAccount: false,
        }
        vi.mocked(fetch).mockResolvedValue(
            jsonResponse({ stripeSessionUrl: "session-url" }, 201),
        )

        await httpImplementation.order.create(request)

        expect(fetch).toHaveBeenCalledWith(
            `${config.VITE_SERVER_URL}${serverRoutes.order.create}`,
            expect.any(Object),
        )
        const [, options] = vi.mocked(fetch).mock.calls[0]
        expect(JSON.parse(String(options?.body))).toEqual(request)
    })
})
