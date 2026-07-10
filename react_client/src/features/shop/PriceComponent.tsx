import { formatMoney } from "@/utils/formatMoney"
import { AppRoutes } from "@/AppRoutes"
import { useNavigate } from "react-router-dom";

import type { ProductDetail } from './shopSchemas'
import { useSalesQuery } from "./shopService"
function PriceComponent(
    { product }: 
    { product: ProductDetail }
) {
    const navigate = useNavigate()
    const {data} = useSalesQuery() 

    const sale = product.saleSlug ? data?.[product.saleSlug] : null
    if (!sale) 
        return <span>{formatMoney(product.priceAudCent)}</span>
    
    const discountedPriceCent= Math.round(
        product.priceAudCent * (100 - sale.discountPercent)/100
    )

    return (
        <span
        onClick={(e) => {
            e.stopPropagation()
            navigate(`${AppRoutes.sale}/${sale.slug}`)
        }}> 
            <span
            className="line-through text-gray-500">
                {formatMoney(product.priceAudCent)}
            </span>
            <span>{formatMoney(discountedPriceCent)}</span>
            <span>{sale.name}</span>
        </span>
    )
}

export { PriceComponent }