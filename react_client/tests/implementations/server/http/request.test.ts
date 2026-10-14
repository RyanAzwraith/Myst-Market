import { beforeEach, describe, expect, it, vi } from "vitest"

import {
    AppException,
    config,
    ServerException,
} from "@/core"
import {
    actionRequest,
    authRequest,
    getHealth,
    request,
} from "@/implementations/server/http/request"

const authMocks = vi.hoisted(() => ({
    state: {
        accessToken: null as string | null,
    },
    refresh: vi.fn(),
}))

vi.mock("@/features/auth", () => ({
    useAuthState: (
        selector: (state: typeof authMocks.state) => string | null,
    ) => selector(authMocks.state),
    useRefreshMutation: () => ({
        mutateAsync: authMocks.refresh,
    }),
}))

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json",
        },
    })
}

function requestOptions() {
    const calls = vi.mocked(fetch).mock.calls
    const [, options] = calls[calls.length - 1] ?? []
    return options as RequestInit
}

describe("request intimacy: low", () => {
    beforeEach(() => {
        authMocks.state.accessToken = null
        authMocks.refresh.mockReset()
    })

    it("functionality returns a JSON response and configures fetch", async () => {
        vi.mocked(fetch).mockResolvedValue(jsonResponse({
            status: "ok",
        }))

        const result = await request<{ status: string }>("/health")

        expect(result).toEqual({ status: "ok" })
        expect(fetch).toHaveBeenCalledWith(
            `${config.VITE_SERVER_URL}/health`,
            expect.objectContaining({
                credentials: "include",
            }),
        )
        expect(requestOptions().headers).toBeInstanceOf(Headers)
        expect(
            (requestOptions().headers as Headers).get("Content-Type"),
        ).toBe("application/json")
    })

    it("preserves request options and adds an access-token header", async () => {
        vi.mocked(fetch).mockResolvedValue(jsonResponse({ saved: true }))
        const body = JSON.stringify({ name: "Moon Orb" })

        await request("/products", {
            method: "POST",
            headers: {
                "X-Request-ID": "request-1",
            },
            body,
        }, "access-token")

        const options = requestOptions()
        expect(options.method).toBe("POST")
        expect(options.body).toBe(body)
        expect((options.headers as Headers).get("X-Request-ID"))
            .toBe("request-1")
        expect((options.headers as Headers).get("Authorization"))
            .toBe("Bearer access-token")
    })

    it("does not override an explicit content type", async () => {
        vi.mocked(fetch).mockResolvedValue(jsonResponse({ saved: true }))

        await request("/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/custom",
            },
            body: "custom body",
        })

        expect((requestOptions().headers as Headers).get("Content-Type"))
            .toBe("application/custom")
    })

    it("leaves multipart content type to the browser", async () => {
        vi.mocked(fetch).mockResolvedValue(jsonResponse({ uploaded: true }))
        const body = new FormData()
        body.append("file", new Blob(["content"]), "file.txt")

        await request("/upload", {
            method: "POST",
            body,
        })

        expect((requestOptions().headers as Headers).has("Content-Type"))
            .toBe(false)
    })

    it("returns a blob when requested", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(
            "report contents",
            { status: 200 },
        ))

        const result = await request<Blob>("/report", {
            responseType: "blob",
        })

        expect(await result.text()).toBe("report contents")
        expect(requestOptions()).not.toHaveProperty("responseType")
    })

    it("throws a ServerException with the server error details", async () => {
        vi.mocked(fetch).mockResolvedValue(jsonResponse({
            message: "Invalid request",
            details: { field: "name" },
        }, 400))

        const result = request("/products", { method: "POST" })

        await expect(result).rejects.toBeInstanceOf(ServerException)
        await expect(result).rejects.toMatchObject({
            message: "Invalid request",
            statusCode: 400,
            details: { field: "name" },
        })
    })

    it("uses the default server error when the response is not JSON", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response(
            "not json",
            { status: 502 },
        ))

        await expect(request("/health")).rejects.toMatchObject({
            message: "Server error",
            statusCode: 502,
        })
    })
})

describe("getHealth intimacy: low", () => {
    it("functionality requests the health endpoint", async () => {
        vi.mocked(fetch).mockResolvedValue(jsonResponse("healthy"))

        await expect(getHealth()).resolves.toBe("healthy")
        expect(fetch).toHaveBeenCalledWith(
            `${config.VITE_SERVER_URL}/health`,
            expect.any(Object),
        )
    })
})

describe("authRequest intimacy: medium", () => {
    beforeEach(() => {
        authMocks.state.accessToken = "current-token"
        authMocks.refresh.mockReset()
    })

    it("functionality sends the current authentication token", async () => {
        vi.mocked(fetch).mockResolvedValue(jsonResponse({ user: 1 }))

        const result = await authRequest<{ user: number }>("/user/me")

        expect(result).toEqual({ user: 1 })
        expect((requestOptions().headers as Headers).get("Authorization"))
            .toBe("Bearer current-token")
        expect(authMocks.refresh).not.toHaveBeenCalled()
    })

    it("refreshes the token and retries after an expired-token response",
        async () => {
            vi.mocked(fetch)
                .mockResolvedValueOnce(jsonResponse({
                    message: "Token expired",
                }, 451))
                .mockResolvedValueOnce(jsonResponse({ user: 1 }))
            authMocks.refresh.mockResolvedValue("new-token")

            const result = await authRequest<{ user: number }>("/user/me")

            expect(result).toEqual({ user: 1 })
            expect(authMocks.refresh).toHaveBeenCalledOnce()
            expect(fetch).toHaveBeenCalledTimes(2)

            const firstOptions = vi.mocked(fetch).mock.calls[0][1]
            const secondOptions = vi.mocked(fetch).mock.calls[1][1]
            expect(
                (firstOptions?.headers as Headers).get("Authorization"),
            ).toBe("Bearer current-token")
            expect(
                (secondOptions?.headers as Headers).get("Authorization"),
            ).toBe("Bearer new-token")
        },
    )

    it("rethrows the expired-token error when refresh returns no token",
        async () => {
            vi.mocked(fetch).mockResolvedValue(jsonResponse({
                message: "Token expired",
            }, 451))
            authMocks.refresh.mockResolvedValue(null)

            await expect(authRequest("/user/me"))
                .rejects.toMatchObject({
                    message: "Token expired",
                    statusCode: 451,
                })
            expect(fetch).toHaveBeenCalledOnce()
        },
    )

    it("does not refresh for other server errors", async () => {
        vi.mocked(fetch).mockResolvedValue(jsonResponse({
            message: "Forbidden",
        }, 403))

        await expect(authRequest("/admin"))
            .rejects.toMatchObject({ statusCode: 403 })
        expect(authMocks.refresh).not.toHaveBeenCalled()
    })
})

describe("actionRequest intimacy: low", () => {
    beforeEach(() => {
        window.history.replaceState({}, "", "/")
    })

    it("functionality sends the action token from the URL", async () => {
        window.history.replaceState(
            {},
            "",
            "/set-password?token=action-token",
        )
        vi.mocked(fetch).mockResolvedValue(jsonResponse({ updated: true }))

        const result = await actionRequest<{ updated: boolean }>(
            "/user/me/password",
        )

        expect(result).toEqual({ updated: true })
        expect((requestOptions().headers as Headers).get("Authorization"))
            .toBe("Bearer action-token")
    })

    it("throws an AppException when the action token is missing", async () => {
        const result = actionRequest("/user/me/password")

        await expect(result).rejects.toBeInstanceOf(AppException)
        await expect(result).rejects.toMatchObject({
            message: "Missing action token",
        })
        expect(fetch).not.toHaveBeenCalled()
    })
})