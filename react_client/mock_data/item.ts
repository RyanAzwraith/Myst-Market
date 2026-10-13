import { faker } from "@faker-js/faker"

import type {
    ItemResolution,
    ItemSummary,
} from "@/features/item"
import type { ProductSummary } from "@/features/product/schema"

export {
    itemSummaryFactory,
    itemResolutionFactory,
    itemSummaryListFactory,
    itemResolutionsListFactory,
}

faker.seed(12345)

const itemSummaryFactory = (productId: number = 1): ItemSummary => ({
    productId: productId,
    quantity: faker.number.int({ min: 1, max: 5 }),
})

const itemResolutionFactory = (
    product?: ProductSummary, 
) : ItemResolution => {
    const unitPriceCent = faker.number.int({
        min: 1000,
        max: 100000,
    })
    const quantity = faker.number.int({ min: 1, max: 5 })
    const name = faker.commerce.productName()

    return {
        product: product ?? {
            id: 1,
            saleID: null,
            name,
            slug: faker.helpers.slugify(name),
        },
        quantity,
        unitPriceCent,
        lineTotalCent: unitPriceCent * quantity,
        onSale: faker.datatype.boolean(),
    }
}

const itemSummaryListFactory = (
    length: number = 8, productIds: number[] = []
): ItemSummary[] => 
    Array.from(
        { length },
        () => itemSummaryFactory(productIds.shift()),
    )



const itemResolutionsListFactory = (
    length: number = 8, products: ProductSummary[] = []
): ItemResolution[] => 
    Array.from(
        { length },
        () => itemResolutionFactory(products.shift()),
    )
