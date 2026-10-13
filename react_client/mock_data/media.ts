import { faker } from "@faker-js/faker"

import type { EntityType, MediaDetail } from "@/features/media/schema"

export {
    mediaFactory,
    media,
    mediaListFactory,
    mediaList,
}

faker.seed(12345)

const mediaFactory = (
    overrides: Partial<MediaDetail> = {},
    entity?: { id: number; type: EntityType },
): MediaDetail => ({
    id: 1,
    mediaType: "image",
    mediaUrl: faker.image.url(),
    entityId: entity?.id ?? 1,
    entityType: entity?.type ?? "product",
    altText: faker.commerce.productName(),
    sortOrder: faker.number.int({ min: 0, max: 24 }),
    ...overrides,
})

const media: MediaDetail = mediaFactory()

const mediaListFactory = (
    length: number = 25,
): MediaDetail[] => Array.from(
    { length },
    () => mediaFactory(),
)


const mediaList: MediaDetail[] = mediaListFactory()