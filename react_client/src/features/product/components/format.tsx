
import { formatMoney } from "@/utils/formatMoney"

import type { Product } from '../schema'
import type { SaleSummary } from ".."


export { PriceFormat }


function PriceFormat({ product, onClick }: {
    product: Product 
    onClick?: (sale?: SaleSummary) => void
}) {

    if (!product.sale || !product.discountedPrice) return (
        <span>{formatMoney(product.priceAudCent)}</span>
    )

    const sale = product.sale
    return (
        <span
        onClick={(e) => {
            e.stopPropagation()
            onClick?.(sale)
        }}> 
            <span
            className="line-through text-gray-500">
                {formatMoney(product.priceAudCent)}
            </span>
            <span>{formatMoney(product.discountedPrice)}</span>
            <span>{sale!.name}</span>
        </span>
    )

}
