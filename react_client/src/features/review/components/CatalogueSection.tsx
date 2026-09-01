

import { useRetrieveTestimonialsQuery } from "../service"
import type { Review } from "../schema"
import { RatingComponent } from "./RatingComponent"

export {
    TestimonialsSection,
}

function TestimonialsSection(
    {limit}:
    {limit: number} 
) {
    const {data: reviews} = useRetrieveTestimonialsQuery(limit)
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

function ReviewCard(
    {reviewDetail}:
    {reviewDetail: Review} 
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
