import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { ChevronDownIcon } from "@heroicons/react/24/solid";

import { AppRoutes } from "@/AppRoutes"

import { AddToCartButton } from "@/features/cart/AddToCartButton";
import { 
    BooleanFilterField, 
    QueryParamsContainer, 
    SelectMultipleFilterField, 
    SelectOneFilterField 
} from "@/shared/QueryParamsComponent";

import {
    useShopParams, 
    useProductsInfiniteQuery
} from "./shopService"
import type {ProductDetail} from './shopSchemas'
import { PriceComponent } from './PriceComponent'
import { MediaComponent } from "../media/mediaComponent";
import type { MediaDetail } from "../media/mediaSchema";
import { usePostProductsMediaMutation } from "../media/mediaService";

function ShopPage() {
    const {
        categories, rarities, sortBy, isAscending, search, getParams
    } = useShopParams()

    const limit = 20

    const {data, fetchNextPage, hasNextPage } = 
        useProductsInfiniteQuery(limit, getParams())
    const products = data?.pages.flatMap(page => page.products) ?? []

    const [mediaByProduct, setMediaByProduct] = useState<Record<number, MediaDetail>>({})
    const postProductsMedia = usePostProductsMediaMutation()

    useEffect(() => {
        const ids = Array.from(new Set(products.map(p => p.id)))
        if (ids.length === 0) return

        void postProductsMedia.mutateAsync({ productIds: ids })
            .then(res => setMediaByProduct(res.media))
            .catch(() => {})
    }, [products, postProductsMedia])

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
                productMedia={mediaByProduct[p.id]}/>
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
    { product: ProductDetail, productMedia?: MediaDetail }
) {
    const navigate = useNavigate()
    return (
    <div 
    className="rounded border border-slate-200 bg-white p-3 shadow-sm">
        <div
        onClick={() => {navigate(`${AppRoutes.product}/${product.slug}`)}}>
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
