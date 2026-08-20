import { useNavigate } from "react-router-dom";

import { AppRoutes } from "@/AppRoutes"
import { CarouselComponent } from "@/shared/CarouselComponent"
import { PriceComponent } from "../shop/PriceComponent";
import { RatingComponent } from "../review/RatingComponent"
import type { ProductDetail } from "@/features/shop/shopSchemas"
import type { ReviewDetail } from "@/features/review/ReviewSchemas"
import type { SaleDetail } from "@/features/shop/shopSchemas";

import { 
    useFeaturedProductQuery, 
    useNewestProductsQuery, 
    usePopularProductsQuery, 
    useStatsQuery,
    useTestimonialsQuery,
    useBiggestSalesQuery
} from "./catalogueService"
import { ProductMediaCarouselComponent, SaleMediaCarouselComponent } from "../media/mediaComponent";


function CataloguePage() {
    return (
        <div>
            <h2>Catalogue</h2>
            <AboutSection/>
            <StatsSection />
            <FeaturedProductSection />
            <PopularProductsSection limit={6} />
            <NewestProductsSection limit={6} />
            <BiggestSalesSection limit={3} />
            <TestimonialsSection limit={3} />
        </div>
    )
}

function AboutSection() {
    return (
        <div>
            <p> Wow Such Wow About Us Wow </p>
        </div>
    )
}
function StatsSection() {
    const {data: stats} = useStatsQuery()
    if (!stats) return null
    return (
        <div>
            <p>{stats.product_count} Items discovered</p>
            <p>{stats.customer_count} Adventurers served</p>
            <RatingComponent rating={stats.total_average_rating} />
            <p>Average Rating</p>

        </div>
    )
}

function FeaturedProductSection() {
    const {data: product} = useFeaturedProductQuery()
    if (!product) return null
    return (
        <div>
            <h2>Featured Product</h2>
            <ProductCard product={product} />
        </div>
    )
}

function PopularProductsSection(
    {limit}:
    {limit: number} 
) {
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

function BiggestSalesSection(
    {limit}:
    {limit: number} 
) {
    const {data: sales} = useBiggestSalesQuery(limit)
    if (!sales) return null
    return (
        <div>
            <h2>Biggest Sales</h2>
            <CarouselComponent 
            limit={limit}
            children={sales.map((o) => 
                <SaleCard sale={o} key={`${o.id}`} />
            )}/>
        </div>
    )
}

function TestimonialsSection(
    {limit}:
    {limit: number} 
) {
    const {data: reviews} = useTestimonialsQuery(limit)
    if (!reviews) return null
    return (
        <div>
            <h2>Testimonials</h2>
            {reviews.map((o) => 
                <ReviewCard reviewDetail={o} key={`${o.userName}`} />
            )}
        </div>
    )
}

function ProductCard(
    {product}:
    {product: ProductDetail} 
) {
    const navigate = useNavigate()
    return (
    <div 
    className="rounded border border-slate-200 bg-white p-3 shadow-sm"
    onClick={() => {navigate(`${AppRoutes.product}/${product.slug}`)}}
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

function ReviewCard(
    {reviewDetail}:
    {reviewDetail: ReviewDetail} 
) {
    return (
        <article>
            <RatingComponent rating={reviewDetail.rating}/>
            <p>{reviewDetail.userName}</p>
            <p>{reviewDetail.createdAt.toString()}</p>
            <p>{reviewDetail.description}</p>
        </article>
    )
}

function SaleCard(
    {sale}:
    {sale: SaleDetail} 
) {
    return (
        <article>
            <h1 className="text-lg font-semibold">
                {sale.name}
            </h1>
            <SaleMediaCarouselComponent saleId={sale.id} limit={1} />
            <h2 className="text-lg font-semibold">
                {sale.discountPercent}% off!
            </h2>
            <p className="text-sm text-slate-600">
                {sale.startAt.toString()} to {sale.endAt.toString()}
            </p>
        </article>
    )
}

export { 
    CataloguePage,
    AboutSection,
    StatsSection,
    FeaturedProductSection,
    PopularProductsSection,
    NewestProductsSection,
    BiggestSalesSection,
    TestimonialsSection,
    ProductCard,
    ReviewCard,
    SaleCard,
}