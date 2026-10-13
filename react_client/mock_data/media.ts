import { faker } from "@faker-js/faker"

import type { MediaDetail } from "@/features/media/schema"

export {
    mediaFactory,
    media,
    mediaListFactory,
    medias,
}

faker.seed(12345)

const mediaFactory = (
    id: number = 1, 
    entityId: number = 1, 
    entityType: string = "product"
): MediaDetail => ({
    id: id,
    mediaType: "image",
    mediaUrl: faker.image.url(),
    entityId: entityId,
    entityType: entityType,
    altText: faker.commerce.productName(),
    sortOrder: faker.number.int({ min: 0, max: 24 }),
})

const media: MediaDetail = mediaFactory()

const mediaListFactory = (
    productIds: number[] = []
): MediaDetail[] => 
    Array.from(
        { length: 25 },
        () => mediaFactory(productIds.shift()),
    )

const medias = mediaListFactory()