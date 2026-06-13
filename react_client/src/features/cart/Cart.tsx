
export interface Cart {
    items: CartItem[],
    total_price_aud_cent: number
}

export type CartItem = {
    product_id: number,
    quantity: number,
    unit_price_aud_cent: number
}