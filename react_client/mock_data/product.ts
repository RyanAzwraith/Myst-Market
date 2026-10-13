import { faker } from "@faker-js/faker"

import type {
    Product,
    ProductAnalytics,
} from "@/features/product/schema"

export {
    productFactory,
    productListFactory,
    productAnalyticsFactory,
    productAnalysticsListFactory,
    
    product,
    products,
    productAnalytic,
    productAnalytics,
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

const  productListFactory = (
    length: number = 25
): Product[] => 
    Array.from(
        { length },
        (_, index) => productFactory(index + 1),
    )

const products: Product[] = productListFactory()

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
    
const productAnalysticsListFactory = (
    length: number = 3, products: Product[] = productListFactory()
): ProductAnalytics[] =>
    products.slice(0, length).map(productAnalyticsFactory)

const productAnalytics: ProductAnalytics[] =
    productAnalysticsListFactory()
