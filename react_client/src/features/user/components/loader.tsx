import type { ReactNode } from "react";

import { Loading } from "@/shared";



import { 
    type Review, 
    type OrderSummary, 
} from "../index";

import type { UserAnalytics } from "../schema";
import {
    useAdminSearchQuery,
    useReviewsQuery,
    useOrdersQuery,
} from "../service";
import { 
    useAdminSearchParams, 
} from "../hook";


export {
    AdminSearchLoader,
    ReviewsLoader,
    OrdersLoader,
}


function AdminSearchLoader({ render, limit=20 }: {
    render: ( props : {
        searchQuery: ReturnType<typeof useAdminSearchQuery>
        searchParams: ReturnType<typeof useAdminSearchParams>
        users: UserAnalytics[]
    }) => ReactNode,
    limit?: number
}) {
    const searchParams = useAdminSearchParams()
    const searchQuery = useAdminSearchQuery( limit, searchParams.values() )
    const users = searchQuery.data?.users ?? []
    return render({ searchQuery, searchParams, users })
}

function ReviewsLoader({render} : {
    render: ( props : {
        reviews: Review[]
    }) => ReactNode,
}) {
    const {data: reviews} = useReviewsQuery()
    if (!reviews) return <Loading isError={false}/>
    return render({ reviews })
    
}

function OrdersLoader({render} : {
    render: ( props : {
        orders: OrderSummary[]
    }) => ReactNode,
}) {
    const {data: orders} = useOrdersQuery()
    if (!orders) return <Loading isError={false}/>
    return render({ orders })
    
}