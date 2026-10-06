import { 
    ButtonWrapper, 
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
    products, images, onClick, limit=5
}: {
    products: Product[]
    images: Record<string, MediaDetail>
    onClick?: (product: Product) => void
    limit?: number
}) {
    return (
    <Carousel 
    limit={limit}
    content={products.map((product) => 
        <ProductCard 
        product={product} 
        key={`${product.id}`} 
        image={images[product.id]}
        onClick={() => onClick?.(product)}
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
        <Section>
            <Heading>Reviews</Heading>
            <Text>Average Rating:</Text>
            <RatingFormat rating={data.average} />

            {canReview &&  
            <CreateReviewForm productId={productId} />
            }

            <ExpandableContent content={data.reviews.map((r) => 
                <ReviewCard 
                key={`review-${r.id}`} 
                review={r} 
                />
            )}/>
        </Section>
        )    
    if (canReview) 
        return (
        <Section>
            <Heading level={2}>Reviews</Heading>
            <Text>Be the first to Review this Product:</Text>
            <CreateReviewForm productId={productId}/>
        </Section>
        )
    return null
}
