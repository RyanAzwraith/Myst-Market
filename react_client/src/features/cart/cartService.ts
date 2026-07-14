import { create,} from 'zustand'
import { persist } from "zustand/middleware";

import type { ProductDetail } from '@/features/shop/shopSchemas';
import { useDiscountedPrice } from '@/features/shop/shopService';

import type { CartState } from "./cartSchemas"

const useCartState = create<CartState>()(
    persist( 
        (set, get) => ({
            items: [],

            getTotal: () => get().items.reduce(
                (t, v) => t + v.quantity * v.product.priceAudCent, 0
            ),

            addItem: (  product: ProductDetail, quantity: number) => 
                set((state: CartState) => ({
                    items: [...state.items, 
                        {
                            product,
                            quantity,
                            priceCent: useDiscountedPrice(product),
                            onSale: product.saleSlug != null
                        } 
                    ],
                })),

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
                        ).filter(item => item.quantity <= 1),
                    }))
                else get().addItem(product, quantity)
            },

            addQuantity: ( product: ProductDetail, quantity: number) =>
                get().updateQuantity(
                    product, get().getCartItem(product)?.quantity ?? quantity
                ),

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