import { faker } from "@faker-js/faker"

import type {
    Product,
    ProductAnalytics,
} from "@/features/product/schema"
import type { SaleSummary } from "@/features/sale/schema"

export {
    productFactory,
    product,
    productListFactory,
    productList,
    productAnalyticsFactory,
    productAnalytic,
    productAnalyticsListFactory,
    productAnalyticsList,
}

faker.seed(12345)

const productFactory = (
    overrides: Partial<Product> = {},
    sale?: SaleSummary,
): Product => {
    const priceAudCent = faker.number.int({
        min: 1000,
        max: 100000,
    })

    return {
        id: 1,
        name: faker.commerce.productName(),
        categoryName: "artifacts",
        rarityName: "rare",
        priceAudCent,
        slug: "mock-product-1",
        description: faker.commerce.productDescription(),
        stock: faker.number.int({ min: 0, max: 100 }),
        discountedPrice: sale
            ? Math.round(priceAudCent * (1 - sale.discountPerc / 100))
            : null,
        sale: sale ?? null,
        ...overrides,
    }
}

const product: Product = productFactory()

const productListFactory = (
    length: number = 25,
    sales: SaleSummary[] = [],
): Product[] => Array.from(
    { length },
    (_, index) => productFactory({}, sales[index]),
)

const productList: Product[] = productListFactory()

const productAnalyticsFactory = (
    overrides: Partial<ProductAnalytics> = {},
    product?: Product,
): ProductAnalytics => ({
    ...(product ?? productFactory()),
    discontinuedAt: null,
    createdAt: "2026-01-01",
    unitsSold: faker.number.int({ min: 0, max: 100 }),
    revenue: faker.number.int({ min: 0, max: 100000 }),
    orderCount: faker.number.int({ min: 0, max: 100 }),
    refunds: faker.number.int({ min: 0, max: 10 }),
    revenueLost: faker.number.int({ min: 0, max: 10000 }),
    averageRating: faker.number.float({
        min: 1,
        max: 5,
        fractionDigits: 1,
    }),
    reviews: faker.number.int({ min: 0, max: 100 }),
    ...overrides,
})

const productAnalytic: ProductAnalytics =
    productAnalyticsFactory({})

const productAnalyticsListFactory = (
    length: number = 25,
): ProductAnalytics[] => 
    Array.from(
        { length },
        () => productAnalyticsFactory(),
    )

const productAnalyticsList: ProductAnalytics[] =
    productAnalyticsListFactory()

