import { 
    ButtonWrapper ,
} from "@/shared";

import { 
    AddToCartButton,
    CreateReviewComponent,
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
    Card,
    ReviewsSection,
}

function Card({ product, image, onClick }: {
    product: Product, 
    image: MediaDetail | undefined, 
    onClick?: (product: Product) => void
}) {
    return (
    <ButtonWrapper
    onClick={() => onClick?.(product)}
    >
        <SummaryInfo
        product={product}
        image={image}
        />
        <AddToCartButton product={product}/>
    </ButtonWrapper>
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
        <div>
            <h1>Reviews</h1>
            <p>Average Rating:</p>
            <RatingFormat rating={data.average} />

            {canReview &&  
            <CreateReviewComponent productId={productId} />
            }

            <ExpandableContent children={data.reviews.map((r) => 
                <ReviewCard 
                key={`review-${r.id}`} 
                review={r} 
                />
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
