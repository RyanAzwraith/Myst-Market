import { render } from "@testing-library/react"
import { 
    QueryClient, 
    QueryClientProvider 
} from "@tanstack/react-query";
import { 
    MemoryRouter, 
    Routes, 
    Route, 
    useLocation 
} from "react-router-dom";

import { useAuthState } from '@/features/auth/state'
import type { AuthState } from '@/features/auth/state'
import { useCartState } from "@/features/item/state";
import type { Product } from "@/features/product/schema"


export {
    renderWithRouter, 
    createWrapper,
    resetAuthState, 
    resetCartState,
}


function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: Infinity,
            },
            mutations: {
                retry: false,
            },
        },
    })
}

function LocationDisplay() {
    const location = useLocation();
    return (
        <div data-testid="location">
            {location.pathname}{location.search}
        </div>
    )
}

function renderWithRouter(
    component: React.ReactElement | null,
        {
        path = "*",
        initialPath = "/",
    } = {}

) {
    const queryClient = createTestQueryClient()
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
    const client = createTestQueryClient()

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
    user: null
}) {
    localStorage.removeItem("auth-storage")
    useAuthState.setState(state)
}

function resetCartState (products: Product[]) {
    localStorage.removeItem("cart-storage")
    useCartState.setState({ items: [] })
    const cartState = useCartState.getState()
    products.forEach(e => cartState.addItem(e, 2))
}
