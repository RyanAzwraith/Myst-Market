import { 
    Loading, 
    Heading,
    Text
} from "@/shared"

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


function SaleCarousel({saleId, limit = 20 }: {
    saleId: number
    limit?: number
}) {
    const { data: media } = useMediasQuery(saleId)
    return (
        <MediaCarousel
        media={media ?? []}
        limit={limit}
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
    <>
        <SaleCarousel saleId={sale.id} />
        <Heading>{sale.name}</Heading>
        <Heading level={2}> {sale.discountPerc}% off!</Heading>
        <Text>{sale.startAt} to {sale.endAt}</Text>
        <Text>{sale.description}</Text>
    </>
    )
}

// REVIEW - takes sale summary???
function AdminSummaryInfo({ sale }: { 
    sale: SaleAnalytics 
}) {
	return (
    <>
        <Text>{sale.name}</Text>
        <Text>{sale.discountPerc}% off</Text>
        <Text>start: {sale.startAt}</Text>
        <Text>end: {sale.endAt}</Text>
        <Text>Revenue: {sale.revenue}</Text>
        <Text>Orders: {sale.orderCount}</Text>
    </>
	);
}

function AnalyticsInfo({ sale }: {
    sale: SaleAnalytics
}) {
    return (
    <>
        <SaleCarousel saleId={sale.id} />
        <Text>{sale.name}</Text>
        <Text>ID: {sale.id}</Text>
        <Text>discount Percent: {sale.discountPerc}% off</Text>
        <Text>Start at: {sale.startAt}</Text>
        <Text>End at: {sale.endAt}</Text>
        <Text>Revenue: {sale.revenue}</Text>
        <Text>Lost revenue: {sale.revenueLost}</Text>
        <Text>Order count: {sale.orderCount}</Text>
    </>
    )
}