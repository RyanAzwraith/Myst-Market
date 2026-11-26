import { create,} from 'zustand'
import { persist } from "zustand/middleware";

import type { 
    Product,
} from './index';

import type {
    Item
} from './schema';


export type {
    CartState
}
export {
    useCartState
}


type CartState = {
    items: Item[],
    
    getTotal: () => number,
    addItem: (product: Product, quantity: number) => void,
    removeItem: (product: Product) => void,
    clearCart: () => void,
    isEmpty: () => boolean,

    getCartItem: (product: Product) => Item | null,
    updateQuantity: (product: Product, quantity: number) => void,
    addQuantity: (product: Product, quantity: number) => void
}

const useCartState = create<CartState>()(
    persist( 
        (set, get) => ({
            items: [],

            getTotal: () => get().items.reduce(
                (t, v) => t + v.quantity * v.priceCent, 0
            ),

            addItem: (  product: Product, quantity: number) => {
                if (!get().getCartItem(product))
                    set((state: CartState) => ({
                        items: [...state.items, 
                            {
                                product,
                                quantity,
                                priceCent: product.discountedPrice ?? product.priceAudCent,
                                onSale: product.sale != null
                            } 
                        ],
                    }))
                },

            removeItem: (product: Product) => set((state: CartState) => ({
                items: state.items.filter(c => c.product.id !== product.id),
            })),

            getCartItem: (product: Product) => 
                get().items.find(
                    (e) => e.product.id == product.id
                ) ?? null,

            updateQuantity: ( product: Product, quantity: number) => {
                if (get().getCartItem(product))
                    set((state: CartState) => ({
                        items: state.items.map(
                            item => item.product.id == product.id
                                ? { ...item, quantity } : item
                        ).filter(item => item.quantity > 0),
                    }))
                else get().addItem(product, quantity)
            },

            addQuantity: ( product: Product, quantity: number) =>{
                const current = get().getCartItem(product)?.quantity ?? 0
                get().updateQuantity(product, current + quantity)
            },

            clearCart: () => set(() => ({items: []})),

            isEmpty: () => get().items.length == 0,
        }),
        {
            name: "cart-storage",
        }
    )
)
