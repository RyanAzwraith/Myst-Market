
import { Text } from "@/shared"

import type { Review } from "../schema"

import { RatingFormat } from "./presentation"


export { ReviewInfo }


function ReviewInfo({ review }:  { 
    review: Review,
}) {
    return (
    <>
        <RatingFormat rating={review.rating}/>
        <Text>{review.userName}</Text>
        <Text>{review.createdAt.toString()}</Text>
        <Text>{review.description}</Text>
    </>
    )
}