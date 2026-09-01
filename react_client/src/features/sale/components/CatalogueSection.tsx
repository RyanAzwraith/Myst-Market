
import { CarouselComponent } from "@/shared/CarouselComponent"

import { 
    useBiggestSalesQuery 

} from "../service"
import type { 
    Sale 

} from "../schema"
import {
    SaleMediaCarouselComponent
} from './media'

export {
    BiggestSalesSection
}

function BiggestSalesSection(
    {limit}:
    {limit: number} 
) {
    const {data: sales} = useBiggestSalesQuery(limit)
    if (!sales) return null
    return (
        <div>
            <h2>Biggest Sales</h2>
            <CarouselComponent 
            limit={limit}
            children={sales.map((o) => 
                <SaleCard sale={o} key={`${o.id}`} />
            )}/>
        </div>
    )
}

function SaleCard(
    {sale}:
    {sale: Sale} 
) {
    return (
        <article>
            <h1 className="text-lg font-semibold">
                {sale.name}
            </h1>
            <SaleMediaCarouselComponent saleId={sale.id} limit={1} />
            <h2 className="text-lg font-semibold">
                {sale.discountPerc}% off!
            </h2>
            <p className="text-sm text-slate-600">
                {sale.startAt.toString()} to {sale.endAt.toString()}
            </p>
        </article>
    )
}