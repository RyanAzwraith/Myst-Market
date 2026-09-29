import { Loading } from "@/shared/elements/text"
import {
    MediaCarousel,
    Image
} from "../index"

import {
    useSaleMediasQuery,
    useSaleImageQuery,
} from '../service'


export {
    SaleCarousel,
    SaleImage
}


function SaleCarousel({saleId, limit = 1 }: {
    saleId: number
    limit?: number
}) {
    const { data: media } = useSaleMediasQuery(saleId)
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
    const { data: media } = useSaleImageQuery(saleId)
    if (!media) return <Loading />
    return (
        <Image
        media={media}
        />
    )
}