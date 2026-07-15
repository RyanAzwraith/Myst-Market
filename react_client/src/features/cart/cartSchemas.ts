import type { ProductDetail } from '@/features/shop/shopSchemas';

type CartItem = {
    product: ProductDetail,
    quantity: number,
    priceCent: number,
    onSale: boolean
}

type CartState = {
    items: CartItem[],
    
    getTotal: () => number,
    addItem: (product: ProductDetail, quantity: number) => void,
    removeItem: (product: ProductDetail) => void,
    clearCart: () => void,
    isEmpty: () => boolean,

    getCartItem: (product: ProductDetail) => CartItem | null,
    updateQuantity: (product: ProductDetail, quantity: number) => void,
    addQuantity: (product: ProductDetail, quantity: number) => void


}

export type {
    CartState,
    CartItem
}