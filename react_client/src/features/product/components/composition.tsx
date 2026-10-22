import { 
    Card, 
    Carousel,
    Section,
    Heading,
    Text,
} from "@/shared";

import { 
    AddToCartButton,
    CreateReviewForm,
    RatingFormat,
    ReviewCard,
    useAuthState,
    type MediaDetail,
} from "../index";

import type { 
    Product,
} from '../schema'
import { 
    useReviewsQuery, 
} from "../service";

import { 
    SummaryInfo 
} from "./content";
import { ExpandableContent } from "@/shared/composition/ExpandableContent";


export { 
    ProductCard,
    ReviewsSection,
    CardCarousel
}

function ProductCard({ product, image, onClick }: {
    product: Product, 
    image: MediaDetail | undefined, 
    onClick?: (product: Product) => void
}) {
    return (
    <Card
    className="product-card"
    onClick={() => onClick?.(product)}
    >
        <SummaryInfo
        product={product}
        image={image}
        />
        <AddToCartButton product={product}/>
    </Card>
    )
}

function CardCarousel({
    products, images, onClick, limit=3
}: {
    products: Product[]
    images: Record<string, MediaDetail>
    onClick?: (product: Product) => void
    limit?: number
}) {
    return (
    <Carousel
    className="card-carousel"
    limit={limit}
    content={products.map((product) => 
        <ProductCard 
        product={product} 
        key={`${product.id}`} 
        image={images[product.id]}
        onClick={product => onClick?.(product)}
        />
    )}/>
    )
}

function ReviewsSection({ productId }: {
    productId: number
}) {
    const isLoggedIn = useAuthState(state => state.isLoggedIn)
    const { data } = useReviewsQuery(productId)
    if (!data) return null

    const hasReviews = data.reviews.length > 0;
    const canReview = Boolean(isLoggedIn() && !data.userHasReview);

    if (hasReviews)
        return (
        <Section className="reviews-section">
            <div className="reviews-header">
                <Heading className="reviews-title">Reviews</Heading>
                <Text variant="muted">Average rating</Text>
                <div className="reviews-rating">
                    <RatingFormat rating={data.average} />
                </div>
            </div>

            {canReview &&  
            <div className="review-form-panel">
                <Heading level={3} className="review-form-title">
                    Share your experience
                </Heading>
                <CreateReviewForm productId={productId} />
            </div>
            }

            <ExpandableContent content={data.reviews.map((r) => 
                <ReviewCard 
                key={`review-${r.id}`} 
                review={r} 
                />
            )} 
            className="review-list"
            />
        </Section>
        )    
    if (canReview) 
        return (
        <Section className="reviews-section">
            <div className="reviews-header">
                <Heading level={2} className="reviews-title">Reviews</Heading>
                <Text variant="muted">
                    Be the first to review this product.
                </Text>
            </div>
            <div className="review-form-panel">
                <CreateReviewForm productId={productId}/>
            </div>
        </Section>
        )
    return null
}
