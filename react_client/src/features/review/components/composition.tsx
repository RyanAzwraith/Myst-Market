

import type { Review } from "../schema"
import { Card } from "@/shared"

import { ReviewInfo } from "./content"


export { ReviewCard }



function ReviewCard({ review, onClick, children }:  { 
    review: Review,
    onClick?: () => void,
    children?: React.ReactNode,
}) {
    return (
    <Card className="review-card" onClick={onClick}>
        <ReviewInfo review={review}/>
        {children}
    </Card>
    )
}