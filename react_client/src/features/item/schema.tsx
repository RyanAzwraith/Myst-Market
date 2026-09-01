import type { 
    Product,
    ProductSummary 
} from './index';


export type {
    Item,
    ItemSummary,
    ItemResolution,
    CartState,
}
export {
    itemSummary
}

// Domain
type Item = {
    product: Product,
    quantity: number,
    priceCent: number,
    onSale: boolean
}

type ItemSummary = {
    productId: number
    quantity: number
}

const itemSummary = {
    from : {
        item: (t: Item) => ({
            productId: t.product.id,
            quantity: t.quantity,
        }),    
        itemResolution: (t: ItemResolution) => ({
            productId: t.productSummary.id,
            quantity: t.quantity,
        }),
    }
}

type ItemResolution = {
    productSummary: ProductSummary
    quantity: number
    unitPriceCent: number
    lineTotalCent: number
    onSale: boolean
    warning?: string
}

// State
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

