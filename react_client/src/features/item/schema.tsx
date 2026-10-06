import type { 
    Product,
    ProductSummary 
} from './index';


export type {
    Item,
    ItemSummary,
    ItemResolution,
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
            productId: t.product.id,
            quantity: t.quantity,
        }),
    }
}

type ItemResolution = {
    product: ProductSummary
    quantity: number
    unitPriceCent: number
    lineTotalCent: number
    onSale: boolean
    warning?: string
}
