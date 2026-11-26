import type { DateStr } from "@/utils/DateStr"

export type {
    Review,
    ReviewInput,
}

type Review = {
    id: number,
    userName: string,
    productId: number,
    productSlug: string,
    createdAt: DateStr,
    rating: number,
    description?: string | null,
}

type ReviewInput = {
    rating: number,
    description?: string | null
}

