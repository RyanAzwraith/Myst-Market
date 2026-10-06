import { faker } from "@faker-js/faker"

import type {
    Product,
    ProductAnalytics,
} from "@/features/product/schema"

export {
    product,
    products,
    productAnalytics,
    productAnalytic,
}

faker.seed(12345)

const productFactory = (id: number): Product => ({
    id,
    name: faker.commerce.productName(),
    categoryName: "artifacts",
    rarityName: "rare",
    priceAudCent: 1000 + id * 100,
    slug: `mock-product-${id}`,
    description: faker.commerce.productDescription(),
    stock: 10,
    discountedPrice: null,
    sale: null,
})

const product: Product = productFactory(1)
const products: Product[] = Array.from(
    { length: 25 },
    (_, index) => productFactory(index + 1),
)

const productAnalyticsFactory = (
    value: Product,
): ProductAnalytics => ({
    ...value,
    discontinuedAt: null,
    createdAt: "2026-01-01",
    unitsSold: 10,
    revenue: 10000,
    orderCount: 5,
    refunds: 0,
    revenueLost: 0,
    averageRating: 4,
    reviews: 3,
})

const productAnalytic: ProductAnalytics =
    productAnalyticsFactory(product)
const productAnalytics: ProductAnalytics[] =
    products.map(productAnalyticsFactory)
