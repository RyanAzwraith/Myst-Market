
import { 
    Loading, 
    Section 
} from "@/shared";

import type { 
    OrderSummary, 
    Review 
} from "../index";

import { 
    useGetOrdersQuery, 
    useGetReviewsQuery 
} from "../service";
import { ExpandableContent } from "@/shared/ExpandableContent";


export {
    UserOrdersSection,
    UserReviewsSection
}


function UserOrdersSection({renderItems} : {
    renderItems: (order: OrderSummary) => React.ReactNode
}) {
    const {data: orders} = useGetOrdersQuery()
    if (!orders) return <Loading isError={false}/>
    
    return (
        <Section>
            <h1> Orders </h1>
            <ExpandableContent
            children={orders.map((r) => renderItems(r))}
            />
        </Section>
    )
}

function UserReviewsSection({renderItems} : {
    renderItems: (review: Review) => React.ReactNode
}) {
    const {data: reviews} = useGetReviewsQuery()
    if (!reviews) return <Loading isError={false}/>
    
    return (
        <Section>
            <h1> Reviews </h1>
            <ExpandableContent
            children={reviews.map((r) => renderItems(r))}
            />
        </Section>
    )
}

