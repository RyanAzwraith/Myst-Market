import {type Product, useSalesQuery } from "@/features/shop/shopService"
import { formatMoney } from "@/utils/formatMoney"
import { AppRoutes } from "@/AppRoutes"
import { useNavigate } from "react-router-dom";

function PriceComponent(
    { product }: 
    { product: Product }
) {
    const navigate = useNavigate()
    const {data} = useSalesQuery() 

    const sale = product.saleSlug ? data?.[product.saleSlug] : null
    if (!sale) 
        return <span>{formatMoney(product.priceAUDCent)}</span>

    const discountedPriceCent= Math.round(
        product.priceAUDCent * (100 - sale.discountPercent)
    )
    return (
        <span
        onClick={(e) => {
            e.stopPropagation()
            navigate(`${AppRoutes.sale}/${sale.slug}`)
        }}> 
            <span
            className="line-through text-gray-500">
                {formatMoney(product.priceAUDCent)}
            </span>
            <span>{formatMoney(discountedPriceCent)}</span>
            <span>{sale.name}</span>
        </span>
    )
}

export { PriceComponent }