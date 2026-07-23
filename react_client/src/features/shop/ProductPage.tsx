import { useNavigate, useParams } from "react-router-dom";
import { AppRoutes } from '@/AppRoutes'
import { useEffect } from "react"

import { ImageComponent } from "@/shared/ImageComponent"

import  { PriceComponent } from "./PriceComponent"
import { useProductQuery } from "./shopService"

import { AddToCartButton } from "@/features/cart/AddToCartButton"

function ProductPage() {
	const navigate = useNavigate()

    const { slug } = useParams()
    useEffect(() => {
        if (!slug) 
            navigate(AppRoutes.shop);
    }, [slug, navigate])

    const {data: product} = useProductQuery(slug)
    if (product ) {

        return (
            <div className="rounded border border-slate-200 bg-white p-4">
                <h1 className="text-lg font-semibold">
                    {product.name}
                </h1>
                <ImageComponent 
                altText={product.name} />
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
            </div>
        )
    }
    else
        return <div></div>
}

export { ProductPage }