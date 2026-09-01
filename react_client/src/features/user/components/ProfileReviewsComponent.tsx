import { XMarkIcon } from "@heroicons/react/24/solid";

import { ExpandableContent } from "@/shared/ExpandableContent"
import { PopUpModalComponent } from "@/shared/PopUpModalComponent"

import {
    useDeleteReviewMutation,
    RatingComponent,
} from "../index"
import type {
    Review,
} from "../index"

import {
    useGetReviewsQuery,
} from '../service'

function ProfileReviewsComponent() {

    const { data: reviews } = useGetReviewsQuery()
    if (!reviews) return null

    return (
        <div>
            <h2>Reviews</h2>
            <ExpandableContent children={reviews.map((o, i) => 
                <ReviewCard review={o} key={`${o.userName}-${i}`} />
            )}/>
        </div>
    )
}

function ReviewCard(
    {review}:
    {review: Review}
) {
    const deleteReviewMutation = useDeleteReviewMutation()

    return (
        <article>
            <RatingComponent rating={review.rating}/>
            <p>{review.userName}</p>
            <p>{review.createdAt.toString()}</p>
            <p>{review.description}</p>
            
            <PopUpModalComponent
            content={onClose => 
                <>
                    <h2>Are you sure you'd like to delete your Review?</h2>
                    <button 
                    type="button"
                    onClick={() => {
                        deleteReviewMutation.mutate(review.id)
                        onClose()
                    }}>
                        Yes
                    </button>
                    <button type="button" onClick={onClose}>No</button>
                </>
            }>
                <XMarkIcon aria-label="xmarkicon" className="h-6 w-6" />
            </PopUpModalComponent>
            
        </article>
    )
}

export {
    ProfileReviewsComponent,
    ReviewCard
}