
import { 
    SearchTitle,  
    MoneyFormat,
    Span,
} from "@/shared";

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


function PriceFormat({ product }: {
    product: Product
}) {
    if (!product.sale || product.discountedPrice === null) return (
        <Span className="price-format">
            <MoneyFormat amount={product.priceAudCent} />
        </Span>
    )

    return (
    <Span className="price-format price-format-sale">
        <Span className="price-format-original">
            <MoneyFormat amount={product.priceAudCent} />
        </Span>
        <MoneyFormat amount={product.discountedPrice} />
    </Span>
    )

}

function ProductSearchTitle({ searchParams, className }: { 
    searchParams: ReturnType<typeof useSearchParams> 
    className?: string
}) {
    const { bindings: { categories, search } } = searchParams
    return <SearchTitle
    className={`product-search-title ${className ?? ""}`}
    possibleTitles={[
        search.get() && `Searching: ${search.get() as string}`,
        (categories.get() as string[]).join(', '),
        "All Products"
    ]} />
}

function AdminSearchTitle({ adminSearchParams }: { 
    adminSearchParams: ReturnType<typeof useAdminSearchParams> 
}) {
    const { bindings: { categories, rarities, search } } = adminSearchParams
    return <SearchTitle
    className="product-admin-search-title"
    possibleTitles={[
        search.get() && `Searching: ${search.get() as string}`,
        (categories.get() as string[]).concat(rarities.get() as string[]).join(', '),
        "All Products"
    ]} />
}
