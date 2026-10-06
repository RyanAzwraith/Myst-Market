import { faker } from "@faker-js/faker"

import type {
    Sale,
    SaleAnalytics,
} from "@/features/sale/schema"

export {
    sale,
    sales,
    saleAnalytics,
    saleAnalytic,
}

faker.seed(12345)

const saleFactory = (id: number): Sale => ({
    id,
    name: faker.commerce.productAdjective(),
    slug: `mock-sale-${id}`,
    discountPerc: 20,
    description: faker.commerce.productDescription(),
    startAt: "2026-01-01",
    endAt: "2026-12-31",
})

const sale: Sale = saleFactory(1)
const sales: Sale[] = Array.from(
    { length: 10 },
    (_, index) => saleFactory(index + 1),
)

const saleAnalyticsFactory = (value: Sale): SaleAnalytics => ({
    ...value,
    revenue: 10000,
    orderCount: 5,
    revenueLost: 1000,
})

const saleAnalytic: SaleAnalytics = saleAnalyticsFactory(sale)
const saleAnalytics: SaleAnalytics[] = sales.map(saleAnalyticsFactory)
