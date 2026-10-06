
import { 
    SearchTitle,  
    MoneyFormat,
    Button,
    Span,
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
    ProductSearchTitle,
    AdminSearchTitle,
    PriceFormat 
}


function PriceFormat({ product, onClick }: {
    product: Product 
    onClick?: (sale: SaleSummary) => void
}) {

    if (!product.sale || !product.discountedPrice) return (
        <Span><MoneyFormat amount={product.priceAudCent} /></Span>
    )

    const sale = product.sale
    return (
        <Button
        onClick={e => {
            e.stopPropagation()
            onClick?.(sale)
        }}> 
            <Span>
                <MoneyFormat
                amount={product.priceAudCent}
                />
            </Span>
            <MoneyFormat amount={product.discountedPrice} />
            <Span>{sale!.name}</Span>
        </Button>
    )

}

function ProductSearchTitle({ searchParams }: { 
    searchParams: ReturnType<typeof useSearchParams> 
}) {
    const { bindings: { categories, search } } = searchParams
    return <SearchTitle possibleTitles={[
        search.get() && `Searching: ${search.get() as string}`,
        (categories.get() as string[]).join(', '),
        "All Products"
    ]} />
}

function AdminSearchTitle({ adminSearchParams }: { 
    adminSearchParams: ReturnType<typeof useAdminSearchParams> 
}) {
    const { bindings: { categories, rarities, search } } = adminSearchParams
    return <SearchTitle possibleTitles={[
        search.get() && `Searching: ${search.get() as string}`,
        (categories.get() as string[]).concat(rarities.get() as string[]).join(', '),
        "All Products"
    ]} />
}
