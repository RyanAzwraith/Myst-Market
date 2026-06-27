import { test, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { App } from "@/App.tsx"

test("renders Myst Market", () => {
  render(<App />)

  expect(screen.getByText(/Myst Market/i)).toBeInTheDocument()
})