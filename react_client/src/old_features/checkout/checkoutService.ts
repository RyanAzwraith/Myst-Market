import { useQuery, useMutation} from "@tanstack/react-query"
import { request, authRequest } from "@/api";

import type {
    OrderDetail,
    OrderSummary,
    ResolveItemsRequest,
    ResolveItemsResponse,   
    CheckoutUserRequest,        
    CheckoutGuestRequest,
    CheckoutResponse,
    GetOrderResponse,
    GetUserOrdersResponse,
}  from "./checkoutSchemas"
import {
    ItemSummary,
} from "./checkoutSchemas"
import { useCartState } from "../cart/cartService";

// Queries
function useResolveItemsQuery() {
    const items = useCartState(state => state.items)
    return useQuery({
        queryKey: ["ItemResolution"],
        queryFn() { 
            return request<ResolveItemsResponse>('/cart-resolution', {             
                method: "POST",
                body: JSON.stringify({ 
                    itemSummaries: items.map(ItemSummary.from.Item)
                } as ResolveItemsRequest),
            })
        },
    })
}

function useCheckouGuesttMutation()  {
    return useMutation({
        mutationFn (req: CheckoutGuestRequest) {
            return request<CheckoutResponse>("/checkout/guest", {
                method: "POST",
                body: JSON.stringify(req),
            })
        },
        onSuccess (data) { 
            window.location.href = data.stripeSessionUrl
        }
    })
}

function useCheckoutUserMutation()  {
    return useMutation({
        mutationFn (req: CheckoutUserRequest) {
            return authRequest<CheckoutResponse>("/checkout/user", {
                method: "POST",
                body: JSON.stringify(req),
            })
        },
        onSuccess (data) { 
            window.location.href = data.stripeSessionUrl
        }
    })
}

function useOrderQuery(orderId?: number)  {
    return useQuery({
        queryKey: ["order", orderId],
        queryFn: () => authRequest<GetOrderResponse>(`/user/order/${orderId}`),
        select: data => data.orderDetail satisfies OrderDetail
    })
}


function useOrdersQuery() {
    return useQuery({
        queryKey: ["orders"],
        queryFn: () => authRequest<GetUserOrdersResponse>('/user/orders'),
        select: data => data.orderSummaries satisfies OrderSummary[]
    })
}


export {
    useResolveItemsQuery,
    useCheckouGuesttMutation,
    useCheckoutUserMutation,
    useOrderQuery,
    useOrdersQuery,
}
