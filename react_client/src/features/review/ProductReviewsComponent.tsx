import { useState } from "react"
import { 
    StarIcon as SolidStarIcon, 
} from "@heroicons/react/24/solid"
import { StarIcon as OutlineStarIcon } from "@heroicons/react/24/outline"

import { useAuthState } from "@/features/user/authState"

import { InputLabelComponent } from "@/shared/InputLableComponent"
import { ToggleComponent } from "@/shared/ToggleComponent"
import { ExpandableContent } from "@/shared/ExpandableContent"


import { RatingComponent } from "./ratingComponent"
import type {
    PostReviewRequest,
    ReviewDetail,
    ReviewSummary,
} from "./ReviewSchemas"

import {
    useCreateReviewMutation,
    useProductReviewsQuery
} from "./ReviewService"


function ProductReviewsComponent(
    {productId}:
    {productId:number}
) {
    const userModel = useAuthState(state => state.userModel)
    const { data } = useProductReviewsQuery(productId)
    
    if (!data) return null

    const hasReviews = data.reviewDetails.length > 0;
    const canReview = Boolean(userModel && !data.userHasReview);

    if (hasReviews)
        return (
            <div>
                <h1>Reviews</h1>
                <p>Average Rating:</p>
                <RatingComponent rating={data.average} />

            {canReview &&  
                <CreateReviewComponent productId={productId} />
            }
                <ExpandableContent children={data.reviewDetails.map((o, i) => 
                    <ReviewCard reviewDetail={o} key={`${o.userName}-${i}`} />
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

function CreateReviewComponent(
    {productId}:
    {productId: number}
) {
    const createReviewMutation = useCreateReviewMutation(productId)
    const [ rating, setRating ] = useState(0)
    const [ description, setDescription ] = useState('')

    function handleSubmit (e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!rating) return
        createReviewMutation.mutate({
            reviewSummary: {
                rating, description
            } as ReviewSummary
        } as PostReviewRequest)
    }

    return (
        <form onSubmit={handleSubmit}>
            <CreateReviewStarIcon value={1} rating={rating} setRating={setRating}/>
            <CreateReviewStarIcon value={2} rating={rating} setRating={setRating}/>
            <CreateReviewStarIcon value={3} rating={rating} setRating={setRating}/>
            <CreateReviewStarIcon value={4} rating={rating} setRating={setRating}/>
            <CreateReviewStarIcon value={5} rating={rating} setRating={setRating}/>

            <InputLabelComponent name="description">
                <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="description"
                />
            </InputLabelComponent>

            <button type="submit">Submit</button>
        </form>
    )
}

function CreateReviewStarIcon(
    {value, rating, setRating}:
    {   
        value: number,
        rating: number,
        setRating: (rating: number) => void,
    } 
) {
    return (
        <button
        type="button"
        onClick={() => setRating(value)}
        >
            <ToggleComponent 
            state={value <= rating}
            onChild={<SolidStarIcon aria-label="solidstaricon" />}
            offChild={<OutlineStarIcon aria-label="outlinestaricon" />}
            />
        </button>
    )
    
}

export {
    ProductReviewsComponent,
    ReviewCard,
    RatingComponent,
    CreateReviewComponent,
    CreateReviewStarIcon,
}