import { listToRecord } from "@/utils/funcs"
import { List } from "@/shared"

import type { MediaDetail } from "../index"

import type { Sale } from "../schema"
import { useBiggestSalesQuery } from "../service"
import { SaleCard } from "./card"


export {
    BiggestSalesSection
}


function BiggestSalesSection({limit, onCardClick}:{
    limit: number,
    onCardClick?: (sale: Sale) => void
} ) {
    const {data} = useBiggestSalesQuery(limit)
    if (!data) return null
    const images = listToRecord(data.images, 
        (item: MediaDetail) => [item.entityId, item]
    )
    return (
        <div>
            <h2>Biggest Sales</h2>
            <List
            items={data.sales}
            renderItem={(o: Sale) => 
                <SaleCard 
                sale={o}
                key={`${o.id}`}
                image={images[o.id]}
                onClick={() => onCardClick?.(o)}
                />
            }/>
        </div>
    )
}