import { faker } from "@faker-js/faker"

import type {
    Sale,
    SaleAnalytics,
} from "@/features/sale/schema"

export {
    saleFactory,
    sale,
    saleListFactory,
    saleList,
    saleAnalyticsFactory,
    saleAnalyticsListFactory,
    saleAnalytics,
    sales,
    saleAnalytic,
    saleAnalyticsList,
}

faker.seed(12345)

const saleFactory = (
    overrides: Partial<Sale> = {},
): Sale => ({
    id: 1,
    name: faker.commerce.productAdjective(),
    slug: "mock-sale-1",
    discountPerc: faker.number.int({ min: 5, max: 50 }),
    description: faker.commerce.productDescription(),
    startAt: "2026-01-01",
    endAt: "2026-12-31",
    ...overrides,
})

const sale: Sale = saleFactory()

const saleListFactory = (
    length: number = 25,
): Sale[] => Array.from(
    { length },
    () => saleFactory(),
)

const saleList: Sale[] = saleListFactory()

const saleAnalyticsFactory = (
    overrides: Partial<SaleAnalytics> = {},
): SaleAnalytics => ({
    ...saleFactory(),
    revenue: faker.number.int({ min: 0, max: 100000 }),
    orderCount: faker.number.int({ min: 0, max: 100 }),
    revenueLost: faker.number.int({ min: 0, max: 10000 }),
    ...overrides,
})

const saleAnalytics: SaleAnalytics = saleAnalyticsFactory({
    ...sale,
})

const saleAnalyticsListFactory = (
    length: number = 25,
): SaleAnalytics[] => 
    Array.from(
        { length },
        () => saleAnalyticsFactory(),
    )

const saleAnalyticsList: SaleAnalytics[] =
    saleAnalyticsListFactory()

const sales = saleList
const saleAnalytic = saleAnalytics
