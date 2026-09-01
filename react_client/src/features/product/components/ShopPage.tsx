import { useNavigate } from "react-router-dom";
import { ChevronDownIcon } from "@heroicons/react/24/solid"

import { PageRoutes } from "@/PageRoutes"


import { 
    BooleanFilterField, 
    QueryParamsContainer, 
    SelectMultipleFilterField, 
    SelectOneFilterField 
} from "@/shared/QueryParamsComponent";

import { 
    AddToCartButton,
    MediaComponent,
    type MediaDetail,
} from "../index";

import type { Product } from '../schema'
import {    
    useSearchParams, 
    useSearchInfiniteQuery
} from "../service";
import { PriceComponent } from './PriceComponent'

function ShopPage() {
    const {
        categories, rarities, sortBy, isAscending, search, getParams
    } = useSearchParams()

    const limit = 20

    const {data, fetchNextPage, hasNextPage } = 
        useSearchInfiniteQuery(limit, getParams())
    const products = data?.pages.flatMap(page => page.products) ?? []
    const images = data?.pages.flatMap(page => page.medias) ?? []

    const title = search.get() 
        ? `Searching: ${search.get()}` 
        : categories.get().join(', ') || "All Products"


    return (
        <div> 
            <QueryParamsContainer> 
                <SelectMultipleFilterField accessor={categories}/>
                <SelectMultipleFilterField accessor={rarities}/>
                <SelectOneFilterField accessor={sortBy}/>
                <BooleanFilterField accessor={isAscending}/>
            </QueryParamsContainer>

            <h1 className="mb-2 text-lg font-semibold">{title}</h1> 
            <div className="flex flex-wrap gap-4">
            { products.map((p) => 
                <ProductCard 
                key={p.id} 
                product={p}
                productMedia={images.find(img => img.productId === p.id)}/>
            )}
            { hasNextPage ? 
                <ChevronDownIcon 
                aria-label="ChevronDownIcon"
                className="h-24 w-24" 
                onClick={() => fetchNextPage()} />
            : null}
            </div>
        </div>
    )
}

function ProductCard(
    { product, productMedia }: 
    { product: Product, productMedia?: MediaDetail }
) {
    const navigate = useNavigate()
    return (
    <div 
    className="rounded border border-slate-200 bg-white p-3 shadow-sm">
        <div
        onClick={() => {navigate(`${PageRoutes.product}/${product.slug}`)}}>
            {productMedia ? <MediaComponent media={productMedia} /> : null}
            <h2 className="mt-2 font-semibold">{product.name}</h2>
        </div>
        
        <p className="text-sm text-slate-600">
            {product.categoryName} - {product.rarityName}
        </p>
        <PriceComponent product={product} />
        <AddToCartButton product={product}/>
    </div>
    )
}


export { ShopPage }
