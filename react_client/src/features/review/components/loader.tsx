import { Loading } from "@/shared"

import type { Review } from "../schema"
import { useRetrieveTestimonialsQuery } from "../service"


export {
    TestimonialLoader
}

function TestimonialLoader({ limit, render }: { 
    limit: number
    render: (reviews: Review[]) => React.ReactNode 
}) {
    const {data: reviews} = useRetrieveTestimonialsQuery(limit)
    if (!reviews) return <Loading />
    return render(reviews)
}
