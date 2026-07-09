import { useNavigate } from "react-router-dom";

import { ChevronDownIcon } from "@heroicons/react/24/solid";

import { AppRoutes } from "@/AppRoutes"
import { ImageComponent } from "@/shared/ImageComponent"

import {type Product, useShopParams, useProductsInfiniteQuery } from "./shopService"
import { SearchParamComponents } from './SearchParamsComponent'
import {PriceComponent} from './priceComponent'

function ShopPage() {
    const {categories, search, shopParams} = useShopParams()

    const limit = 5

    const {data, fetchNextPage, hasNextPage } = 
        useProductsInfiniteQuery(limit, shopParams)
    const products = data?.pages.flatMap(page => page.products) ?? []

    const title = search.value 
        ? `Searching: ${search.value}` 
        : categories.value.join(', ') || "All Products"

    return (
        <div> 
            <SearchParamComponents />
            <h1 className="mb-2 text-lg font-semibold">{title}</h1> 
            <div className="flex flex-wrap gap-4">
            { products.map((p) => 
                <ProductCard 
                key={p.id} 
                product={p}/>
            )}
            { hasNextPage ? 
                <ChevronDownIcon 
                className="h-24 w-24" 
                onClick={() => fetchNextPage()} />
            : null}
            </div>
        </div>
    )
}

function ProductCard(
    { product }: 
    { product: Product }
) {
    const navigate = useNavigate()
    return (
    <div 
    className="rounded border border-slate-200 bg-white p-3 shadow-sm"
    onClick={() => {navigate(`${AppRoutes.product}/${product.slug}`)}}>
        <ImageComponent 
        altText={product.name} />
        <h2 className="mt-2 font-semibold">{product.name}</h2>
        <p className="text-sm text-slate-600">{product.categoryName} - {product.rarityName}</p>
        <PriceComponent product={product} />
    </div>
    )
}


export { ShopPage }
