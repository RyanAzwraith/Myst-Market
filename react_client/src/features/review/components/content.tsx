
import { Text } from "@/shared"

import type { Review } from "../schema"

import { RatingFormat } from "./presentation"


export { ReviewInfo }


function ReviewInfo({ review }:  { 
    review: Review,
}) {
    return (
    <div className="review-info">
        <RatingFormat rating={review.rating}/>
        <Text className="review-user-name">
            {review.userName}
        </Text>
        <Text variant="small" className="review-date">
            {review.createdAt.toString()}
        </Text>
        <Text className="review-description">
            {review.description}
        </Text>
    </div>
    )
}