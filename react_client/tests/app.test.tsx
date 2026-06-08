import { test, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import App from "../src/App"
import "@testing-library/jest-dom"

test("renders Myst Market", () => {
  render(<App />)

  expect(screen.getByText(/Myst Market/i)).toBeInTheDocument()
})