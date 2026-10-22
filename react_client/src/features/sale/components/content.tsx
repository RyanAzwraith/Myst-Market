import { 
    Loading, 
    Heading,
    Text
} from "@/shared"
import { Container } from "@/shared"

import {
    MediaCarousel,
    Image,
    type MediaDetail,
} from "../index"

import type {
    Sale,
    SaleAnalytics,
} from "../schema"
import {
    useMediasQuery,
    useImageQuery,
} from '../service'


export {
    SaleCarousel,
    SaleImage,
    SaleInfo,
    DetailedInfo,
    AdminSummaryInfo,
    AnalyticsInfo
}


function SaleCarousel({saleId, limit = 1 }: {
    saleId: number
    limit?: number
}) {
    const { data: media } = useMediasQuery(saleId)
    return (
        <MediaCarousel
        media={media ?? []}
        limit={limit}
        className="sale-carousel"
        imageClassName="sale-carousel-image"
        />
    )
}

function SaleImage({ saleId }: {
    saleId: number
}) {
    const { data: media } = useImageQuery(saleId)
    if (!media) return <Loading />
    return (
        <Image
        media={media}
        className="sale-image"
        />
    )
}

function SaleInfo({ 
    sale, image 
}: {
    sale: Sale, 
    image: MediaDetail | undefined,
}) {
    return (
    <>
        <Image media={image} />
        <Heading>{sale.name}</Heading>
        <Heading level={2}> {sale.discountPerc}% off!</Heading>
        <Text>{sale.startAt} to {sale.endAt}</Text>
    </>
    )
}

function DetailedInfo({ sale  }: {
    sale: Sale, 
}) {
    return (
    <Container className="sale-detailed-info">
            <Heading level={1} className="sale-title">
                {sale.name}
            </Heading>
            <Heading
            level={2}
            className="sale-discount"
            >
                {sale.discountPerc}% off!
            </Heading>
            <Text variant="muted">
                {sale.startAt} to {sale.endAt}
            </Text>
            <Text className="sale-description">
                {sale.description}
            </Text>
    </Container>
    )
}

function AdminSummaryInfo({ sale }: { 
    sale: SaleAnalytics 
}) {
	return (
    <div className="sale-admin-summary-info">
        <Text className="sale-summary-name">{sale.name}</Text>
        <Text className="sale-summary-discount">
            {sale.discountPerc}% off
        </Text>
        <Text className="sale-summary-orders">
            {sale.orderCount} orders
        </Text>
        <Text className="sale-summary-dates">
            {sale.startAt} to {sale.endAt}
        </Text>
        <Text className="sale-summary-revenue">
            Revenue: {sale.revenue}
        </Text>
    </div>
	);
}

function AnalyticsInfo({ sale }: {
    sale: SaleAnalytics
}) {
    return (
    <div className="sale-analytics-info">
        <SaleCarousel saleId={sale.id} limit={1} />
        <Heading level={2} className="sale-analytics-title">
            {sale.name}
        </Heading>
        <div className="sale-analytics-grid">
            <Text>ID: {sale.id}</Text>
            <Text className="sale-analytics-discount">
                Discount: {sale.discountPerc}% off
            </Text>
            <Text>Start at: {sale.startAt}</Text>
            <Text>End at: {sale.endAt}</Text>
            <Text>Revenue: {sale.revenue}</Text>
            <Text>Lost revenue: {sale.revenueLost}</Text>
            <Text>Order count: {sale.orderCount}</Text>
        </div>
    </div>
    )
}