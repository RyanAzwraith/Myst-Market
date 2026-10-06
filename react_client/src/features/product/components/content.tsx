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
        <ProductCarousel productId={product.id} limit={10} />
        <Heading level={1}>{product.name}</Heading>

        <Text>{product.categoryName} - {product.rarityName}</Text>
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
        <Text>{product.name}</Text>
        <Text>{product.categoryName} - {product.rarityName}</Text>
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
        <Heading level={2}>{product.name}</Heading>
        <Text>ID: {product.id}</Text>
        <Text>Slug: {product.slug}</Text>
        <Text>Category: {product.categoryName}</Text>
        <Text>Rarity: {product.rarityName}</Text>
        <Text>Price: <MoneyFormat amount={product.priceAudCent} /></Text>
        <Text>Discounted: <MoneyFormat amount={product.discountedPrice} /></Text>
        <Text>Created At: {product.createdAt}</Text>
        <Text>Stock: {product.stock}</Text>
        <Text>Units Sold: {product.unitsSold}</Text>
        <Text>Revenue: <MoneyFormat amount={product.revenue} /></Text>
        <Text>Orders: {product.orderCount}</Text>
        <Text>Refunds: {product.refunds}</Text>
        <Text>Revenue Lost: <MoneyFormat amount={product.revenueLost}/></Text>
        <Text>Average Rating: {product.averageRating}</Text>
        <Text>Reviews: {product.reviews}</Text>
        <Text>Description: {product.description}</Text>
    </>
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



