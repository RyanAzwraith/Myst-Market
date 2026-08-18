///////////////////////////////////////////////////////////////////////////////
import { expect } from "vitest"
import { cleanup } from "@testing-library/react"
import { render } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { useAuthState, type AuthState } from '@/features/user/authState'
import { screen } from "@testing-library/react"
import { useCartState } from "@/features/cart/cartService";
import type { ProductDetail } from "@/features/shop/shopSchemas"


function LocationDisplay() {
    const location = useLocation();
    return (
        <div data-testid="location">
            {location.pathname}{location.search}
        </div>
    )
}

function renderWithRouter(
    component: React.ReactNode,
        {
        path = "*",
        initialPath = "/",
    } = {}

) {
    cleanup()
    localStorage.clear()
    const queryClient = new QueryClient({
        defaultOptions: {queries: { retry: false}},
    })
    return render(
        <MemoryRouter initialEntries={[initialPath]} >
            <QueryClientProvider client={queryClient}>
                <Routes>
                    <Route 
                        path={path}
                        element={component}
                    />
                </Routes>
                <LocationDisplay />
            </QueryClientProvider>
        </MemoryRouter>
    );
}

function createWrapper(initialPath = "/") {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <MemoryRouter initialEntries={[initialPath]}>
                <QueryClientProvider client={client}>
                    {children}
                </QueryClientProvider>
            </MemoryRouter>
        )
    }

    return { client, wrapper: Wrapper }
}

function resetAuthState (state: Partial<AuthState> = {
    accessToken: null,
    userModel: null
}) {
    localStorage.removeItem("auth-storage")
    useAuthState.setState(state)
}

function resetCartState (products: ProductDetail[]) {
    localStorage.removeItem("cart-storage")
    useCartState.setState({ items: [] })
    const cartState = useCartState.getState()
    products.forEach(e => cartState.addItem(e, 2))
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

function getByPlaceholder(text:string):HTMLElement {
    const e = screen.queryByPlaceholderText(text)
    if (!e)
        throw new Error(
        `Expected input element with text "${text}", not found.`
    )
    return e!
}

function getByLabelText(text:string):HTMLElement {
    const e = screen.queryByLabelText(text)
    if (!e)
        throw new Error(
        `Expected element with label "${text}", not found.`
    )
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

function expectIsNullByPlaceHolder(text:string) {
    const e = screen.queryByPlaceholderText(text)
    expect(e).toBeNull()
}

function expectIsNullByLabelText(text:string) {
    const e = screen.queryByPlaceholderText(text)
    expect(e).toBeNull()
}

export {
    renderWithRouter, 
    createWrapper,
    resetAuthState, 
    resetCartState,
    getByRole, 
    getByText, 
    getByPlaceholder,
    getByLabelText,
    expectIsNullByRole, 
    expectIsNullByText, 
    expectIsNullByPlaceHolder,
    expectIsNullByLabelText
}