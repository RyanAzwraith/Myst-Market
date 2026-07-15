import { create,} from 'zustand'
import { persist } from "zustand/middleware";

import type { ProductDetail } from '@/features/shop/shopSchemas';

import type { CartState } from "./cartSchemas"

const useCartState = create<CartState>()(
    persist( 
        (set, get) => ({
            items: [],

            getTotal: () => get().items.reduce(
                (t, v) => t + v.quantity * v.priceCent, 0
            ),

            addItem: (  product: ProductDetail, quantity: number) => {
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

            removeItem: (product: ProductDetail) => set((state: CartState) => ({
                items: state.items.filter(c => c.product.id !== product.id),
            })),

            getCartItem: (product: ProductDetail) => 
                get().items.find(
                    (e) => e.product.id == product.id
                ) ?? null,

            updateQuantity: ( product: ProductDetail, quantity: number) => {
                if (get().getCartItem(product))
                    set((state: CartState) => ({
                        items: state.items.map(
                            item => item.product.id == product.id
                                ? { ...item, quantity } : item
                        ).filter(item => item.quantity > 0),
                    }))
                else get().addItem(product, quantity)
            },

            addQuantity: ( product: ProductDetail, quantity: number) =>{
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

export {
    useCartState
}