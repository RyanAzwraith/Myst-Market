
import { Text } from "@/shared"

import type { Review } from "../schema"

import { RatingFormat } from "./presentation"


export { ReviewInfo }


function ReviewInfo({ review }:  { 
    review: Review,
}) {
    return (
    <div className="flex h-full flex-col gap-2">
        <RatingFormat rating={review.rating}/>
        <Text className="font-semibold text-gray-900">
            {review.userName}
        </Text>
        <Text variant="small" className="text-gray-500">
            {review.createdAt.toString()}
        </Text>
        <Text className="line-clamp-4 text-gray-700">
            {review.description}
        </Text>
    </div>
    )
}