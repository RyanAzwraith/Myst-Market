import { 
    MoneyFormat,  
    Loading,
    Heading, 
    Text,
} from "@/shared"

import {
    Media,
    type MediaDetail,
    type SaleSummary,
    MediaCarousel,
    Image,
} from "../index"

import type { 
    Product,
    ProductAnalytics,
} from '../schema'
import { 
    useMediasQuery,
    useImageQuery,
    useAnalyticsQuery,
} from "../service"

import { 
    PriceFormat ,
} from './presentation'

export { 
    ProductCarousel,
    ProductImage,
    SummaryInfo,
    DetailedInfo,
    AdminSummaryInfo,
    AnalyticsInfo,
    PerformanceInfo,
}


function ProductCarousel({
    productId,
    limit = 1,
}: {
    productId: number
    limit?: number
}) {
    const { data: media } = useMediasQuery(productId)
    if (!media) return <Loading />
    return (
        <MediaCarousel
        media={media ?? []}
        limit={limit}
        className="w-full"
        imageClassName="h-auto max-h-[36rem] max-w-full rounded-xl object-contain"
        />
    )
}

function ProductImage({ productId, className }: {
    productId: number
    className?: string
}) {
    const { data: media } = useImageQuery(productId)
    if (!media) return <Loading />
    return (
        <Image
        media={media}
        className={className}
        />
    )
}

function SummaryInfo({ product, image }: {
    product: Product, 
    image: MediaDetail | undefined, 
}) {
    return (
    <>
        <Media media={image} />
        <Heading level={2}>{product.name}</Heading>
        <Text>{product.categoryName} - {product.rarityName}</Text>
        <PriceFormat product={product} />
    </>
    )
}

function DetailedInfo({ product, onSaleClick }: {
    product: Product, 
    onSaleClick?: (sale: SaleSummary) => void
}) {
    return (
    <>
        <Heading level={1} className="text-3xl sm:text-4xl">
            {product.name}
        </Heading>
        <Text variant="muted">
            {product.categoryName} - {product.rarityName}
        </Text>
        <PriceFormat product={product} onClick={onSaleClick} />
        <Text>Stock {product.stock}</Text>
        <Text className="leading-7 text-gray-700">
            {product.description}
        </Text>
    </>
    )
}

function AdminSummaryInfo({ product }: {
    product: Product, 
}) {
    return (
    <div className="grid w-full gap-2 px-3 py-2 sm:grid-cols-4 sm:items-center">
        <Text className="font-semibold text-gray-900">
            {product.name}
        </Text>
        <Text className="text-sm text-gray-600">
            {product.categoryName} - {product.rarityName}
        </Text>
        <Text className="font-medium text-gray-900">
            <PriceFormat product={product} />
        </Text>
        <Text className="text-sm text-gray-600 sm:text-right">
            Stock: {product.stock}
        </Text>
    </div>
    )
}
            
function AnalyticsInfo({ productId }: {
    productId: number, 
}) {
    const { data: product} = useAnalyticsQuery(productId)
    if (!product) return <Loading />
    return (
    <div className="space-y-4">
        <ProductCarousel productId={product.id} limit={1} />
        <Heading level={2} className="text-2xl">{product.name}</Heading>
        <div className="grid gap-2 rounded-lg bg-gray-50 p-4 sm:grid-cols-2">
            <Text>ID: {product.id}</Text>
            <Text>Slug: {product.slug}</Text>
            <Text>Category: {product.categoryName}</Text>
            <Text>Rarity: {product.rarityName}</Text>
            <Text>Price: <MoneyFormat amount={product.priceAudCent} /></Text>
            <Text>
                Discounted: <MoneyFormat amount={product.discountedPrice} />
            </Text>
            <Text>Created At: {product.createdAt}</Text>
            <Text>Stock: {product.stock}</Text>
            <Text>Units Sold: {product.unitsSold}</Text>
            <Text>Revenue: <MoneyFormat amount={product.revenue} /></Text>
            <Text>Orders: {product.orderCount}</Text>
            <Text>Refunds: {product.refunds}</Text>
            <Text>
                Revenue Lost: <MoneyFormat amount={product.revenueLost}/>
            </Text>
            <Text>Average Rating: {product.averageRating}</Text>
            <Text>Reviews: {product.reviews}</Text>
        </div>
        <Text className="leading-6 text-gray-700">
            {product.description}
        </Text>
    </div>
    )
}

function PerformanceInfo({ product }: {
    product: ProductAnalytics, 
}) {
    return (
    <>
        <Text>{product.name}</Text>
        <Text>{product.orderCount}</Text>
    </>
    )
}
