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
        className="w-full"
        imageClassName="h-auto max-h-[36rem] max-w-full rounded-xl object-contain"
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
    <Container className="space-y-6  bg-white rounded-xl p-6
        mx-auto max-w-3xl space-y-4 text-center">
            <Heading level={1} className="text-3xl sm:text-4xl">
                {sale.name}
            </Heading>
            <Heading
            level={2}
            className="text-2xl font-bold text-red-600 sm:text-3xl"
            >
                {sale.discountPerc}% off!
            </Heading>
            <Text variant="muted">
                {sale.startAt} to {sale.endAt}
            </Text>
            <Text className="leading-7 text-gray-700">
                {sale.description}
            </Text>
    </Container>
    )
}

function AdminSummaryInfo({ sale }: { 
    sale: SaleAnalytics 
}) {
	return (
    <div className="grid w-full gap-2 px-3 py-2 sm:grid-cols-3 sm:items-center">
        <Text className="font-semibold text-gray-900">{sale.name}</Text>
        <Text className="font-medium text-red-600">
            {sale.discountPerc}% off
        </Text>
        <Text className="text-sm text-gray-600 sm:text-right">
            {sale.orderCount} orders
        </Text>
        <Text className="text-sm text-gray-500 sm:col-span-2">
            {sale.startAt} to {sale.endAt}
        </Text>
        <Text className="text-sm text-gray-600 sm:text-right">
            Revenue: {sale.revenue}
        </Text>
    </div>
	);
}

function AnalyticsInfo({ sale }: {
    sale: SaleAnalytics
}) {
    return (
    <div className="space-y-4">
        <SaleCarousel saleId={sale.id} limit={1} />
        <Heading level={2} className="text-2xl">{sale.name}</Heading>
        <div className="grid gap-2 rounded-lg bg-gray-50 p-4 sm:grid-cols-2">
            <Text>ID: {sale.id}</Text>
            <Text className="font-medium text-red-600">
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