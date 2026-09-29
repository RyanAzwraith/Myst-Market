import { 
    MoneyFormat,  
    Loading, 
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
        />
    )
}

function ProductImage({ productId }: {
    productId: number
}) {
    const { data: media } = useImageQuery(productId)
    if (!media) return <Loading />
    return (
        <Image
        media={media}
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
        <h2>{product.name}</h2>
        <p>{product.categoryName} - {product.rarityName}</p>
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
        <ProductCarousel productId={product.id} limit={10} />
        <h1>{product.name}</h1>

        <p>{product.categoryName} - {product.rarityName}</p>
        <PriceFormat product={product} onClick={onSaleClick} />
        <p>Stock {product.stock}</p>
        <p>{product.description}</p>
    </>
    )
}

function AdminSummaryInfo({ product }: {
    product: Product, 
}) {
    return (
    <>
        <p>{product.name}</p>
        <p>{product.categoryName} - {product.rarityName}</p>
        <PriceFormat product={product} />
        <p>Stock: {product.stock}</p>
    </>
    )
}
            
function AnalyticsInfo({ product }: {
    product: ProductAnalytics, 
}) {
    return (
    <>
        <ProductCarousel productId={product.id} limit={20} />
        <h2>{product.name}</h2>
        <p>ID: {product.id}</p>
        <p>Slug: {product.slug}</p>
        <p>Category: {product.categoryName}</p>
        <p>Rarity: {product.rarityName}</p>
        <p>Price: <MoneyFormat amount={product.priceAudCent} /></p>
        <p>Discounted: <MoneyFormat amount={product.discountedPrice} /></p>
        <p>Created At: {product.createdAt}</p>
        <div>Stock: {product.stock}</div>
        <p>Units Sold: {product.unitsSold}</p>
        <p>Revenue: <MoneyFormat amount={product.revenue} /></p>
        <p>Orders: {product.orderCount}</p>
        <p>Refunds: {product.refunds}</p>
        <p>Revenue Lost: <MoneyFormat amount={product.revenueLost}/></p>
        <p>Average Rating: {product.averageRating}</p>
        <p>Reviews: {product.reviews}</p>
        <p>Description: {product.description}</p>
    </>
    )
}

function PerformanceInfo({ product }: {
    product: ProductAnalytics, 
}) {
    return (
    <>
        <p>{product.name}</p>
        <p>{product.orderCount}</p>
    </>
    )
}



