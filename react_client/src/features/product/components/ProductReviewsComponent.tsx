import { useState } from "react"
import { 
    StarIcon as SolidStarIcon, 
} from "@heroicons/react/24/solid"
import { StarIcon as OutlineStarIcon } from "@heroicons/react/24/outline"


import { InputLabelComponent } from "@/shared/InputLableComponent"
import { ToggleComponent } from "@/shared/ToggleComponent"
import { ExpandableContent } from "@/shared/ExpandableContent"

import { 
    useAuthState,
    RatingComponent, 
    useCreateReviewMutation,
    type Review,
} from "../index"

import {
    useReviewsQuery
} from "../service"


function ProductReviewsComponent({ productId }: {
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
                <RatingComponent rating={data.average} />

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

function ReviewCard(
    {review}:
    {review: Review}
) {
    return (
        <article>
            <RatingComponent rating={review.rating}/>
            <p>{review.userName}</p>
            <p>{review.createdAt.toString()}</p>
            <p>{review.description}</p>
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
            rating, description
        })
    }

    return (
        <form onSubmit={handleSubmit} aria-label="review-form">
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
            onChild={<SolidStarIcon 
                aria-label="solidstaricon" className="h-6 w-6" 
            />}
            offChild={<OutlineStarIcon 
                aria-label="outlinestaricon" className="h-6 w-6" 
            />}
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