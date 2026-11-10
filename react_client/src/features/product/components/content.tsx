import { 
    MoneyFormat,  
    Loading,
    Heading, 
    SaleBadge,
    Span,
    Text,
} from "@/shared"

import {
    Media,
    type MediaDetail,
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
    if (media.length === 1) {
        return (
            <Media
            media={media[0]}
            className="product-carousel-image"
            />
        )
    }
    return (
        <MediaCarousel
        media={media ?? []}
        limit={limit}
        className="product-carousel"
        imageClassName="product-carousel-image"
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
        className={`product-image ${className ?? ""}`}
        />
    )
}

function SummaryInfo({ product, image }: {
    product: Product, 
    image: MediaDetail | undefined, 
}) {
    return (
    <div className="product-card-summary">
        <SaleBadge
        sale={product.sale}
        className="product-card-sale-badge"
        size="medium"
        />
        <Media media={image} />
        <Heading level={2}>{product.name}</Heading>
        <div className="product-card-tags">
            <Span className="product-card-category">
                {product.categoryName}
            </Span>
            <Span
            className={`product-card-rarity product-card-rarity-${product.rarityName}`}
            >
                {product.rarityName}
            </Span>
        </div>
        <PriceFormat product={product} />
    </div>
    )
}

function DetailedInfo({ product }: {
    product: Product
}) {
    return (
    <>
        <Heading level={1} className="product-detail-title">
            {product.name}
        </Heading>
        <div className="product-detail-tags">
            <Span className="product-card-category">
                {product.categoryName}
            </Span>
            <Span
            className={`product-card-rarity product-card-rarity-${product.rarityName}`}
            >
                {product.rarityName}
            </Span>
        </div>
        <PriceFormat product={product} />
        <Text className="product-description">
            {product.description}
        </Text>
    </>
    )
}

function AdminSummaryInfo({ product }: {
    product: Product, 
}) {
    return (
    <div className="product-admin-summary-info">
        <Text className="product-summary-name">
            {product.name}
        </Text>
        <Text className="product-summary-category">
            {product.categoryName} - {product.rarityName}
        </Text>
        <Text className="product-summary-price">
            <PriceFormat product={product} />
        </Text>
        <Text className="product-summary-stock">
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
    <div className="product-analytics-info">
        <ProductCarousel productId={product.id} limit={1} />
        <Heading level={2} className="product-analytics-title">
            {product.name}
        </Heading>
        <div className="product-analytics-grid">
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
        <Text className="analytics-description">
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
        <Text>x{product.orderCount}</Text>
    </>
    )
}
