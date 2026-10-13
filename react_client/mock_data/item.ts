import { faker } from "@faker-js/faker"

import type {
    ItemResolution,
    ItemSummary,
} from "@/features/item"
import type { ProductSummary } from "@/features/product/schema"

export {
    itemSummaryFactory,
    itemSummary,
    itemSummaryListFactory,
    itemSummaryList,
    itemResolutionFactory,
    itemResolution,
    itemResolutionListFactory,
    itemResolutionList,
}

faker.seed(12345)

const itemSummaryFactory = (
    overrides: Partial<ItemSummary> = {},
): ItemSummary => ({
    productId: 1,
    quantity: faker.number.int({ min: 1, max: 5 }),
    ...overrides,
})

const itemResolutionFactory = (
    overrides: Partial<ItemResolution> = {},
    product?: ProductSummary,
): ItemResolution => {
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
        ...overrides,
    }
}

const itemSummary: ItemSummary = itemSummaryFactory()

const itemSummaryListFactory = (
    length: number = 25,
): ItemSummary[] => Array.from(
    { length },
    () => itemSummaryFactory(),
)

const itemSummaryList: ItemSummary[] = itemSummaryListFactory()

const itemResolution: ItemResolution = itemResolutionFactory()

const itemResolutionListFactory = (
    length: number = 25,
): ItemResolution[] => Array.from(
    { length }
)

const itemResolutionList: ItemResolution[] =
    itemResolutionListFactory()
