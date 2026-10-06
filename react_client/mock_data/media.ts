import type { MediaDetail } from "@/features/media/schema"

export {
    media,
    medias,
}

const media: MediaDetail = {
    id: 1,
    mediaType: "image",
    mediaUrl: "https://placehold.co/600x400",
    entityId: 1,
    entityType: "product",
    altText: "Mock product",
    sortOrder: 0,
}

const medias: MediaDetail[] = [media]
