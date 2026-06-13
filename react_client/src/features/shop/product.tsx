
export interface Product {
    id: string,
    name: string,
    description: string,
    price_aud_cent: number,
    slug: string,
    category_id: number,
    rarity_id: number,
    created_at: Date,
    stock: number,
}