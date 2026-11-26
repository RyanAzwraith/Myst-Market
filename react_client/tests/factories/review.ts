import { faker } from "@faker-js/faker"

import type { Review } from "@/features/review/schema"
import type { ProductSummary } from "@/features/product/schema"

export {
    reviewFactory,
    review,
    reviewListFactory,
    reviewList,
}

faker.seed(12345)

const reviewFactory = (
    overrides: Partial<Review> = {},
    product?: ProductSummary,
): Review => ({
    id: 1,
    userName: faker.person.fullName(),
    productId: product?.id ?? 1,
    productSlug: product?.slug ?? "mock-product-1",
    createdAt: faker.date
        .between({
            from: "2026-01-01",
            to: "2026-12-31",
        })
        .toISOString()
        .slice(0, 10),
    rating: faker.number.int({ min: 1, max: 5 }),
    description: faker.lorem.sentence(),
    ...overrides,
})

const review: Review = reviewFactory()

const reviewListFactory = (
    length: number = 25,
): Review[] => Array.from(
    { length },
    () => reviewFactory(),
)

const reviewList: Review[] = reviewListFactory()
