import { useState, type ReactNode } from "react"

import { Loading } from "@/shared"

import type { ItemSummary, UserDetail } from "../index"

import type { 
    AdminSearchParams, 
    Order, 
    OrderSummary 
} from "../schema"
import { 
    useRecentQuery, 
    useOrderQuery, 
    useAdminSearchQuery 

} from "../service"
import { 
    useAdminSearchParams, 
    useAdminSelectEdit, 
    useCheckoutFormFields 
} from "../hook"


export {
    OrderLoader,
    RecentLoader,
    AdminSearchLoader,
    CheckoutLoader,
}


function OrderLoader({ orderId, render }: {
    orderId: number,
    render: ( props : {
        order: Order,
        user: UserDetail
    }) => ReactNode,
}) {
    const {data} = useOrderQuery(orderId)
    if (!data) return <Loading />
    return render({ order: data.order, user: data.user })
}

function AdminSearchLoader({ render, limit=20 }: {
    render: ( props : {
        searchQuery: ReturnType<typeof useAdminSearchQuery>
        searchParams: ReturnType<typeof useAdminSearchParams>
        selectEdit: ReturnType<typeof useAdminSelectEdit>
        orders: OrderSummary[]
    }) => ReactNode,
    limit?: number
}) {
    const searchParams = useAdminSearchParams()
    const searchQuery = useAdminSearchQuery( limit, searchParams.values() as AdminSearchParams)
    const orders = searchQuery.data?.orders ?? []
    const selectEdit = useAdminSelectEdit({orders})
    return render({ searchQuery, searchParams, selectEdit, orders })
}

function RecentLoader ({ render }: {
    render: ( props : {orders: Order[]}) => ReactNode,
}) {
    const {data: orders} = useRecentQuery()
    if (!orders) return <Loading />
    return render({ orders })
}

function CheckoutLoader({ render }: {
    render: ( props : {
        form: ReturnType<typeof useCheckoutFormFields>,
        items: ItemSummary[] | null,
        setItems: (prev: ItemSummary[]) => void
    }) => ReactNode,
}) {
    const [items, setItems] = useState<ItemSummary[] | null>(null)
    const form = useCheckoutFormFields({ items })
    return render({ form, items, setItems })
}