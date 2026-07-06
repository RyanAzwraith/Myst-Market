import { create } from 'zustand'

type Product = {
    id: number
    name: string
    categoryName: number
    rarityName: number
    priceAUDCent: number
    slug: string
    description: string

}

type ShopState = {
    products: Array<Product>
    setProducts: (products: Array<Product>) => void

}

const useShopState = create<ShopState>(
    (set) => ({
        products : [],
        setProducts : (products) => set(() => ({products})),
    })
)

export { useShopState}