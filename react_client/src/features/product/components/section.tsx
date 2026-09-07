
import {
    ExpandableContent 
} from "@/shared/ExpandableContent"
import { CarouselComponent } from "@/shared/CarouselComponent"
import { listToRecord } from "@/utils/funcs"
import { 
    useAuthState,
    RatingFormat,
    CreateReviewComponent,
    ReviewCard,
    type MediaDetail,
    type Product,
} from "../index"

import {
    useFeaturedProductsQuery,
    usePopularProductsQuery,
    useNewestProductsQuery,
    useTopProductsQuery,
} from '../service'

import { ProductCard } from "./card"

import {
    useReviewsQuery
} from "../service"
import { Loading } from "@/shared/elements/text"
import { List } from "@/shared/elements/list"


export {
    ReviewsSection,
    FeaturedProductsSection,
    PopularProductsSection,
    NewestProductsSection,
    TopProductsSection,
}


function ReviewsSection({ productId }: {
    productId:number
}) {
    const isLoggedIn = useAuthState(state => state.isLoggedIn)
    const { data } = useReviewsQuery(productId)
    if (!data) return null

    const hasReviews = data.reviews.length > 0;
    const canReview = Boolean(isLoggedIn() && !data.userHasReview);

    if (hasReviews)
        return (
            <div>
                <h1>Reviews</h1>
                <p>Average Rating:</p>
                <RatingFormat rating={data.average} />

            {canReview &&  
                <CreateReviewComponent productId={productId} />
            }
                <ExpandableContent children={data.reviews.map((o, i) => 
                    <ReviewCard review={o} key={`${o.userName}-${i}`} />
                )}/>
            </div>
        )    
    if (canReview) 
        return (
            <div>
                <h2>Reviews</h2>
                <p>Be the first to Review this Product:</p>
                <CreateReviewComponent productId={productId}/>
            </div>
        )
    return null
    
}


function FeaturedProductsSection({limit, onCardClick}:{
    limit: number, 
    onCardClick?: (product: Product) => void
}) {
    const {data} = useFeaturedProductsQuery(limit)
    if (!data) return <Loading />
    const products = data.products
    const images = listToRecord(data.images, 
        (item: MediaDetail) => [item.entityId, item]
    ) 
    return (
        <div>
            <h2>Featured Products</h2>
            <CarouselComponent 
            limit={limit}
            children={products.map((p) => 
                <ProductCard 
                product={p} 
                key={`${p.id}`} 
                image={images[p.id]}
                onClick={() => onCardClick?.(p)}
                />
            )}/>
        </div>
    )
}

function PopularProductsSection({limit, onCardClick}:{
    limit: number, 
    onCardClick?: (product: Product) => void
}) {
    const {data} = usePopularProductsQuery(limit)
    if (!data) return <Loading />
    const products = data.products
    const images = listToRecord(data.images, 
        (item: MediaDetail) => [item.entityId, item]
    ) 
    return (
        <div>
            <h2>Popular Products</h2>
            <CarouselComponent 
            limit={limit}
            children={products.map((p) => 
                <ProductCard 
                product={p} 
                key={`${p.id}`} 
                image={images[p.id]} 
                onClick={() => onCardClick?.(p)}
                />
            )}/>
        </div>
    )
}

function NewestProductsSection({limit, onCardClick}:{
    limit: number, 
    onCardClick?: (product: Product) => void
}) {
    const {data} = useNewestProductsQuery(limit)
    if (!data) return <Loading />
    const products = data.products
    const images = listToRecord(data.images, 
        (item: MediaDetail) => [item.entityId, item]
    ) 
    return (
        <div>
            <h2>Newest Products</h2>
            <CarouselComponent 
            limit={limit}
            children={products.map((p) => 
                <ProductCard 
                product={p} 
                key={`${p.id}`} 
                image={images[p.id]} 
                onClick={() => onCardClick?.(p)}
                />
            )}/>
        </div>
    )
}

function TopProductsSection() {
    const {data} = useTopProductsQuery()
    if (!data) return <Loading />
    const products = data.products
    return (
        <div>
            <h2>Top Products</h2>
            <List
            items={products} 
            renderItem={(p) => (
                <div key={p.id} >
                    <span>{p.name}</span>
                    <span>{p.unitsSold}</span>
                </div>
            )}/>
        </div>
    )
}