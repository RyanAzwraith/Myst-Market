import { useNavigate } from "react-router-dom";

import { ChevronDownIcon } from "@heroicons/react/24/solid";

import { AppRoutes } from "@/AppRoutes"
import { ImageComponent } from "@/shared/ImageComponent"

import {
    useShopParams, 
    useProductsInfiniteQuery
} from "./shopService"
import type {ProductDetail} from './shopSchemas'
import { SearchParamsComponent } from './SearchParamsComponent'
import { PriceComponent } from './PriceComponent'

import { AddToCartButton } from "@/features/cart/AddToCartButton";

function ShopPage() {
    const {categories, search, shopParams} = useShopParams()

    const limit = 20

    const {data, fetchNextPage, hasNextPage } = 
        useProductsInfiniteQuery(limit, shopParams)
    const products = data?.pages.flatMap(page => page.products) ?? []

    const title = search.value 
        ? `Searching: ${search.value}` 
        : categories.value.join(', ') || "All Products"

    return (
        <div> 
            <SearchParamsComponent />
            <h1 className="mb-2 text-lg font-semibold">{title}</h1> 
            <div className="flex flex-wrap gap-4">
            { products.map((p) => 
                <ProductCard 
                key={p.id} 
                product={p}/>
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
    { product }: 
    { product: ProductDetail }
) {
    const navigate = useNavigate()
    return (
    <div 
    className="rounded border border-slate-200 bg-white p-3 shadow-sm">
        <div
        onClick={() => {navigate(`${AppRoutes.product}/${product.slug}`)}}>
            <ImageComponent 
            altText={product.name} />
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
