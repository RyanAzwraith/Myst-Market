import { useNavigate } from "react-router-dom";
import { PageRoutes } from "@/PageRoutes"

import { CarouselComponent } from '@/shared/CarouselComponent'


import type { Product } from '../schema'
import {
    useFeaturedProductsQuery,
    usePopularProductsQuery,
    useNewestProductsQuery,
    useTopProductsQuery,
} from '../service'
import { PriceComponent } from "./PriceComponent";
import { ProductMediaCarouselComponent } from "./media";


export {
    FeaturedProductsSection,
    PopularProductsSection,
    NewestProductsSection,
    ProductCard,
    TopProductsSection,
}

function FeaturedProductsSection({ limit }:{
    limit: number
}) {
    const {data: products} = useFeaturedProductsQuery(limit)
    if (!products) return null
    return (
        <div>
            <h2>Featured Products</h2>
            <CarouselComponent 
            limit={limit}
            children={products.map((o) => 
                <ProductCard product={o} key={`${o.id}`} />
            )}/>
        </div>
    )
}

function PopularProductsSection({ limit }:{
    limit: number
}) {
    const {data: products} = usePopularProductsQuery(limit)
    if (!products) return null
    return (
        <div>
            <h2>Popular Products</h2>
            <CarouselComponent 
            limit={limit}
            children={products.map((o) => 
                <ProductCard product={o} key={`${o.id}`} />
            )}/>
        </div>
    )
}

function NewestProductsSection(
    {limit}:
    {limit: number} 
) {
    const {data: products} = useNewestProductsQuery(limit)
    if (!products) return null
    return (
        <div>
            <h2>Newest Products</h2>
            <CarouselComponent 
            limit={limit}
            children={products.map((o) => 
                <ProductCard product={o} key={`${o.id}`} />
            )}/>
        </div>
    )
}

function ProductCard(
    {product}:
    {product: Product} 
) {
    const navigate = useNavigate()
    return (
    <div 
    className="rounded border border-slate-200 bg-white p-3 shadow-sm"
    onClick={() => {navigate(`${PageRoutes.product}/${product.slug}`)}}
    >
        <ProductMediaCarouselComponent productId={product.id} limit={1} />

        <h2 className="mt-2 font-semibold">{product.name}</h2>
        
        <p className="text-sm text-slate-600">
            {product.categoryName} - {product.rarityName}
        </p>
        <PriceComponent product={product} />

    </div>
    )
}

function TopProductsSection() {
	const { data: products, isLoading, isError } = useTopProductsQuery();

	return (
		<section className="rounded border p-4 shadow-sm">
			<h2 className="mb-3 text-lg font-semibold">Top Products</h2>
			{isLoading ? <div>Loading...</div> : null}
			{isError ? <div>Error loading top products</div> : null}
			{!isLoading && !isError && products?.length === 0 ? (
				<div>No top products</div>
			) : null}
			{!isLoading && !isError ? (
				<div className="space-y-2">
					{products?.map(product => (
						<div
							className="flex items-center justify-between gap-3"
							key={product.id}
						>
							<span>{product.name}</span>
							<span>{product.unitsSold}</span>
						</div>
					))}
				</div>
			) : null}
		</section>
	);
}