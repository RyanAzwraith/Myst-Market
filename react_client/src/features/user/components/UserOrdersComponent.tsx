import { useNavigate } from "react-router-dom";

import { formatMoney } from '@/utils/formatMoney'

import { PageRoutes } from '@/PageRoutes'

import { useGetOrdersQuery } from "../service"
import type { OrderSummary } from "../index";

function UserOrdersComponent() {
    const {data: orders} = useGetOrdersQuery()
    
    if (orders ) {
        return (
            <div className="rounded border border-slate-200 bg-white p-4">
                
                <h1 className="text-lg font-semibold">
                    Orders
                </h1>

                { orders.map(o => 
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
        onClick={() => {navigate(`${PageRoutes.order}/${orderSummary.orderId}`)}}
        >
            <p className="text-sm text-slate-600">
                {orderSummary.createdAt.toString()}
            </p>
            <p>{formatMoney(orderSummary.totalCent)} total </p>

        </div>
    )
}

export { UserOrdersComponent }