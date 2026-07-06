///////////////////////////////////////////////////////////////////////////////
import { describe, it, expect, vi, beforeEach, test } from "vitest"
import { cleanup } from "@testing-library/react"
import { render } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom";
import { useAuthState, type AuthState } from '@/features/user/authState'
import { screen } from "@testing-library/react"

function renderWithRouter(component: React.ReactNode) {
    cleanup()
    return render(
        <MemoryRouter>
            {component}
        </MemoryRouter>
    )
}

function resetAuthState (state: Partial<AuthState> = {
    accessToken: null,
    userModel: null
}) {
    localStorage.removeItem("auth-storage")
    useAuthState.setState(state)
}

function getByRole(role:string, name:string):HTMLElement {
    const e = screen.queryByRole(role, { name })
    if (!e)
        throw new Error(`Expected element with role "${role}" and name "${name}", not found.`)
    return e!
}

function getByText(text:string):HTMLElement {
    const e = screen.queryByText(text)
    if (!e)
        throw new Error(`Expected text "${text}", not found.`)
    return e!
}

function expectIsNullByRole(role:string, name:string) {
    const e = screen.queryByRole(role, { name })
    expect(e).toBeNull()
}

function expectIsNullByText(text:string) {
    const e = screen.queryByText(text)
    expect(e).toBeNull()
}

export {
    renderWithRouter, 
    resetAuthState, 
    getByRole, 
    getByText,
    expectIsNullByRole, 
    expectIsNullByText,
}