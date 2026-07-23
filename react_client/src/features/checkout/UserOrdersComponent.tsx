import { useNavigate } from "react-router-dom";
import { AppRoutes } from '@/AppRoutes'
import { formatMoney } from '@/utils/formatMoney'


import {useOrdersQuery} from "./checkoutService"
import type { OrderSummary } from "./checkoutSchemas";
function UserOrdersComponent() {
    const {data: orderSummaries} = useOrdersQuery()
    
    if (orderSummaries ) {
        return (
            <div className="rounded border border-slate-200 bg-white p-4">
                
                <h1 className="text-lg font-semibold">
                    Orders
                </h1>

                { orderSummaries.map(o => 
                    <OrderCard key={o.orderId} orderSummary={o} />
                )}

            </div>
        )
    }
    else
        return <div></div>
}

function OrderCard(
    { orderSummary }: 
    { orderSummary: OrderSummary }
) {
    const navigate = useNavigate()
    return (
        <div 
        className="rounded border border-slate-200 bg-white p-3 shadow-sm"
        onClick={() => {navigate(`${AppRoutes.order}/${orderSummary.orderId}`)}}
        >
            <p className="text-sm text-slate-600">
                {orderSummary.createdAt.toString()}
            </p>
            <p>{formatMoney(orderSummary.totalCent)} total </p>

        </div>
    )
}

export { UserOrdersComponent }