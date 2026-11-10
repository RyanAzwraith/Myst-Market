import { faker } from "@faker-js/faker"
import { productFactory } from "./product"
import type {
    ItemResolution,
    ItemSummary,
    Item,
} from "@/features/item/schema"
import type { Product, ProductSummary } from "@/features/product/schema"

export {
    itemFactory,
    item,
    itemListFactory,
    itemList,
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

const itemFactory = (
    overrides: Partial<Item> = {},
    product?: Product,
): Item => ({
    product: product ?? productFactory(),
    quantity: faker.number.int({ min: 1, max: 5 }),
    priceCent: faker.number.int({ min: 1000, max: 100000 }),
    onSale: faker.datatype.boolean(),
    ...overrides,
})

const item: Item = itemFactory()

const itemListFactory = (
    length: number = 25,
): Item[] => Array.from(
    { length },
    () => itemFactory(),
)

const itemList: Item[] = itemListFactory()


const itemSummaryFactory = (
    overrides: Partial<ItemSummary> = {},
): ItemSummary => ({
    productId: 1,
    quantity: faker.number.int({ min: 1, max: 5 }),
    ...overrides,
})

const itemSummary: ItemSummary = itemSummaryFactory()

const itemSummaryListFactory = (
    length: number = 25,
): ItemSummary[] => Array.from(
    { length },
    () => itemSummaryFactory(),
)

const itemSummaryList: ItemSummary[] = itemSummaryListFactory()

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

const itemResolution: ItemResolution = itemResolutionFactory()

const itemResolutionListFactory = (
    length: number = 25,
): ItemResolution[] => Array.from(
    { length }
)

const itemResolutionList: ItemResolution[] =
    itemResolutionListFactory()
