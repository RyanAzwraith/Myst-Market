import type {
    ItemResolution,
    ItemSummary,
} from "@/features/item/schema"

export {
    itemSummaries,
    itemResolutions,
}

const itemSummaries: ItemSummary[] = [
    { productId: 1, quantity: 1 },
    { productId: 1, quantity: 2 },
]

const itemResolutions: ItemResolution[] = [
    {
        product: {
            id: 1,
            saleID: null,
            name: "Mock Product",
            slug: "mock-product",
        },
        quantity: 1,
        unitPriceCent: 1000,
        lineTotalCent: 1000,
        onSale: false,
    },
]
