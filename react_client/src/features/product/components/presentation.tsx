
import { 
    Title,  
    MoneyFormat,
} from "@/shared";

import type {
    SaleSummary 
} from '../index'

import type { 
    Product, 
} from '../schema'

import { 
    useAdminSearchParams,
    useSearchParams,
} from "../hook";


export { 
    SearchTitle,
    AdminSearchTitle,
    PriceFormat 
}


function PriceFormat({ product, onClick }: {
    product: Product 
    onClick?: (sale: SaleSummary) => void
}) {

    if (!product.sale || !product.discountedPrice) return (
        <span><MoneyFormat amount={product.priceAudCent} /></span>
    )

    const sale = product.sale
    return (
        <button
        onClick={(e) => {
            e.stopPropagation()
            onClick?.(sale)
        }}> 
            <span
            className="line-through text-gray-500">
                <MoneyFormat
                amount={product.priceAudCent}
                />
            </span>
            <MoneyFormat amount={product.discountedPrice} />
            <span>{sale!.name}</span>
        </button>
    )

}

function SearchTitle({ searchParams }: { 
    searchParams: ReturnType<typeof useSearchParams> 
}) {
    const { bindings: { categories, search } } = searchParams
    return <Title possibleTitles={[
        search.get() && `Searching: ${search.get() as string}`,
        (categories.get() as string[]).join(', '),
        "All Products"
    ]} />
}

function AdminSearchTitle({ adminSearchParams }: { 
    adminSearchParams: ReturnType<typeof useAdminSearchParams> 
}) {
    const { bindings: { categories, rarities, search } } = adminSearchParams
    return <Title possibleTitles={[
        search.get() && `Searching: ${search.get() as string}`,
        (categories.get() as string[]).concat(rarities.get() as string[]).join(', '),
        "All Products"
    ]} />
}
