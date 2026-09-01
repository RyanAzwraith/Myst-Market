
export type {
    MediaDetail,
    MediaType,
    EntityType,
}
export {
    mediaType,
    entityType,
}

const mediaType = {
    image: "image",
    video: "video",
} as const

type MediaType = typeof mediaType[keyof typeof mediaType]

const entityType = {
    product: "product",
    sale: "sale",
} as const

type EntityType = typeof entityType[keyof typeof entityType]


type MediaDetail = {
    id: number
    mediaType: MediaType
    mediaUrl: string
    entityId: number
    entityType: EntityType
    altText: string | null
    sortOrder: number | null
}