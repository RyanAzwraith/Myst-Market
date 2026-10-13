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
    className="flex min-h-96 min-w-0 flex-1 flex-col justify-between"
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
        <Section className="mx-auto max-w-3xl space-y-5">
            <div className="space-y-2 text-center">
                <Heading className="text-2xl">Reviews</Heading>
                <Text variant="muted">Average rating</Text>
                <div className="flex justify-center">
                    <RatingFormat rating={data.average} />
                </div>
            </div>

            {canReview &&  
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <Heading level={3} className="mb-3 text-lg">
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
            className="mx-auto flex max-w-2xl flex-col gap-3"
            />
        </Section>
        )    
    if (canReview) 
        return (
        <Section className="mx-auto max-w-3xl space-y-5">
            <div className="space-y-2 text-center">
                <Heading level={2} className="text-2xl">Reviews</Heading>
                <Text variant="muted">
                    Be the first to review this product.
                </Text>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <CreateReviewForm productId={productId}/>
            </div>
        </Section>
        )
    return null
}
