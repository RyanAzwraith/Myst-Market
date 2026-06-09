import { createContext, useContext, useState } from "react"
import type { Cart, CartItem } from "@/models/cart"

interface CartContextType {
    cart: Cart,
    addItem: (item: CartItem) => void,
    removeItem: (product_id: number) => void,
    clearCart: () => void
}   

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<Cart>({ items: [], total_price_aud_cent: 0 })

    function addItem(CartItem: CartItem) {
        42
    }

    function removeItem(product_id: number) {
        42
    }

    function clearCart() {
        42
    }
    
    return (
        <CartContext.Provider value={{ cart, addItem, removeItem, clearCart }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error("useCart must be used within CartProvider")
    }
    return context
}