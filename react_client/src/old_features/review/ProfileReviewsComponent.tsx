import { XMarkIcon } from "@heroicons/react/24/solid";

import { ExpandableContent } from "@/shared/ExpandableContent"
import { PopUpModalComponent } from "@/shared/PopUpModalComponent"

import {
    useDeleteReviewMutation,
    useUserReviewsQuery
} from "./ReviewService"
import type {
    ReviewDetail,
} from "./ReviewSchemas"
import { RatingComponent } from "./ProductReviewsComponent"

function ProfileReviewsComponent() {

    const { data } = useUserReviewsQuery()
    if (!data) return null

    return (
        <div>
            <h2>Reviews</h2>
            <ExpandableContent children={data.reviewDetails.map((o, i) => 
                <ReviewCard reviewDetail={o} key={`${o.userName}-${i}`} />
            )}/>
        </div>
    )
}

function ReviewCard(
    {reviewDetail}:
    {reviewDetail: ReviewDetail} 
) {
    const deleteReviewMutation = useDeleteReviewMutation()

    return (
        <article>
            <RatingComponent rating={reviewDetail.rating}/>
            <p>{reviewDetail.userName}</p>
            <p>{reviewDetail.createdAt.toString()}</p>
            <p>{reviewDetail.description}</p>
            
            <PopUpModalComponent
            content={onClose => 
                <>
                    <h2>Are you sure you'd like to delete your Review?</h2>
                    <button 
                    type="button"
                    onClick={() => {
                        deleteReviewMutation.mutate(reviewDetail.reviewId)
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