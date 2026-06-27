
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"


export function validateEmail(email: string) {
  return email.includes("@")
}

describe("validateEmail", () => {
  it("returns true for valid email", () => {
    expect(validateEmail("test@mail.com")).toBe(true)
  })

  it("returns false for invalid email", () => {
    expect(validateEmail("bademail")).toBe(false)
  })
})


export function LoginForm({ onLogin }: { onLogin: (email: string) => void }) {
  const [email, setEmail] = useState("")

  return (
    <div>
      <input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button onClick={() => onLogin(email)}>
        Login
      </button>
    </div>
  )
}


describe("LoginForm", () => {
  it("calls onLogin with email", async () => {
    const user = userEvent.setup()
    const mockLogin = vi.fn()

    render(<LoginForm onLogin={mockLogin} />)

    const input = screen.getByPlaceholderText("email")
    const button = screen.getByRole("button", { name: /login/i })

    await user.type(input, "test@mail.com")
    await user.click(button)

    expect(mockLogin).toHaveBeenCalledWith("test@mail.com")
  })
})


vi.mock("@/api/userApi", () => ({
  login_route: vi.fn(),
}))

(login_route as any).mockResolvedValue({
  accessToken: "123",
})

