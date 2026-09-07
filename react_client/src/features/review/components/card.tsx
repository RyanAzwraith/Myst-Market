
import { Card } from "@/shared"

import type { Review } from "../schema"

import { RatingFormat } from "./format"


export { ReviewCard }


function ReviewCard({ review, onClick }:  { 
    review: Review,
    onClick?: () => void,
}) {
    return (
        <Card onClick={onClick}>
            <RatingFormat rating={review.rating}/>
            <p>{review.userName}</p>
            <p>{review.createdAt.toString()}</p>
            <p>{review.description}</p>
        </Card>
    )
}