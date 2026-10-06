import { faker } from "@faker-js/faker"

import type { Review } from "@/features/review/schema"

export {
    review,
    reviews,
}

faker.seed(12345)

const reviewFactory = (id: number): Review => ({
    id,
    userName: faker.person.fullName(),
    productId: 1,
    productSlug: "mock-product-1",
    createdAt: "2026-01-01",
    rating: 4,
    description: faker.lorem.sentence(),
})

const review: Review = reviewFactory(1)
const reviews: Review[] = Array.from(
    { length: 10 },
    (_, index) => reviewFactory(index + 1),
)
