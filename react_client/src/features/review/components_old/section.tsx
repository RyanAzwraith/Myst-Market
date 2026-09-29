import { useRetrieveTestimonialsQuery } from "../service"
import { ReviewCard } from "./card"
import { List, Loading } from "@/shared"


export {
    TestimonialsSection,
}


function TestimonialsSection({limit}: {
    limit: number
}) {
    const {data: reviews} = useRetrieveTestimonialsQuery(limit)
    if (!reviews) return <Loading />
    return (
        <div>
            <h2>Testimonials</h2>
            <List
            items={reviews}
            renderItem={(r) => 
                <ReviewCard 
                review={r} 
                key={`${r.userName}`} 
                />
            }/>
        </div>
    )
}