const MediaType = {
    IMAGE: "image",
    VIDEO: "video",
} as const

type MediaType = typeof MediaType[keyof typeof MediaType]

const EntityType = {
    PRODUCT: "product",
    SALE: "sale",
} as const

type EntityType = typeof EntityType[keyof typeof EntityType]

type MediaDetail = {
    id: number
    mediaType: MediaType
    mediaUrl: string
    entityId: number
    entityType: EntityType
    altText: string | null
    sortOrder: number | null
}

/*
ROUTES
GET /products/:id/media
POST /products/media
GET /sales/:id/media
POST /sales/media

GET /products/export
GET /sales/export
POST /products/import
POST /sales/import
*/

// Products
type GetProductMediaResponse = {
    media: MediaDetail[]
}

type RetrieveProductsMediaRequest = {
    productIds: number[]
}

type RetrieveProductsMediaResponse = {
    media: Record<number, MediaDetail>
}

// Sales
type GetSaleMediaResponse = {
    media: MediaDetail[]
}

type RetrieveSalesMediaRequest = {
    saleIds: number[]
}

type RetrieveSalesMediaResponse = {
    media: Record<number, MediaDetail>
}

// CSV Import Export
type CsvImportRequest = {
    file: File
}

type CsvImportResponse = {
    imported: number
    updated: number
    failed: number
    errors: {
        row: number
        field: string | null
        message: string
    }[]
}

export type {
    MediaDetail,
    GetProductMediaResponse,
    RetrieveProductsMediaRequest,
    RetrieveProductsMediaResponse,
    GetSaleMediaResponse,
    RetrieveSalesMediaRequest,
    RetrieveSalesMediaResponse,
    CsvImportRequest,
    CsvImportResponse,
}

export { 
    MediaType, 
    EntityType 
}