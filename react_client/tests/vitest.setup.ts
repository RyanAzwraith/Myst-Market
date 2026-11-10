
import "@testing-library/jest-dom/vitest"

import { afterEach, beforeEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"

beforeEach(() => {
    vi.clearAllMocks()
})

afterEach(() => {
    cleanup()
    localStorage.clear()
    vi.restoreAllMocks()
})

vi.stubGlobal("fetch", vi.fn(() => {
    throw new Error(
        "Unexpected fetch request. Mock the request in this test."
    )
}))