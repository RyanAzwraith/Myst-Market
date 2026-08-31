import { formatMoney } from "@/utils/formatMoney"
import { AppRoutes } from "@/AppRoutes"
import { useNavigate } from "react-router-dom";

import type { ProductDetail } from './shopSchemas'

function PriceComponent(
    { product }: 
    { product: ProductDetail }
) {
    const navigate = useNavigate()

    const sale = product.sale
    if (product.sale && product.discountedPrice) 
        return (
            <span
            onClick={(e) => {
                e.stopPropagation()
                navigate(`${AppRoutes.sale}/${sale!.slug}`)
            }}> 
                <span
                className="line-through text-gray-500">
                    {formatMoney(product.priceAudCent)}
                </span>
                <span>{formatMoney(product.discountedPrice)}</span>
                <span>{sale!.name}</span>
            </span>
        )
        else
            return <span>{formatMoney(product.priceAudCent)}</span>
}

export { PriceComponent }