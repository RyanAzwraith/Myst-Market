import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react"

import { PageRoutes } from '@/PageRoutes'

import  { PriceComponent } from "./PriceComponent"

import { useProductQuery } from "../service"

import { AddToCartButton } from "../index"

import { ProductReviewsComponent } from "./ProductReviewsComponent"
import { ProductMediaCarouselComponent } from "./ProductMediaCarouselComponent";

function ProductPage() {
	const navigate = useNavigate()

    const { slug } = useParams()
    useEffect(() => {
        if (!slug) 
            navigate(PageRoutes.shop);
    }, [slug, navigate])

    const {data: product} = useProductQuery(slug)
    if (!slug || !product) return (
        <div>Loading...</div>
    )
    
    return (
        <div className="rounded border border-slate-200 bg-white p-4">
            <h1 className="text-lg font-semibold">
                {product.name}
            </h1>
            <ProductMediaCarouselComponent productId={product.id} limit={10} />

            <p className="text-sm text-slate-600">
                {product.categoryName} - {product.rarityName}
            </p>
            <PriceComponent product={product} />
            <p className="text-sm text-slate-600">
                Stock {product.stock}
            </p>
            <AddToCartButton product={product}/>
            <p className="text-sm text-slate-600">
                {product.description}
            </p>
            <ProductReviewsComponent productId={product.id} />
        </div>
    )

}

export { ProductPage }