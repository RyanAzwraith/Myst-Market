import "@testing-library/jest-dom"

import { cleanup } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, test, afterEach } from "vitest"

beforeEach(() => {
    vi.clearAllMocks()
})

afterEach(() => {
    vi.resetAllMocks()
    cleanup()
    localStorage.clear()
})