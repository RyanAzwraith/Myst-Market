import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";

import { AppRoutes } from '@/AppRoutes'
import { formatMoney } from '@/utils/formatMoney'

import {useOrderQuery} from "./checkoutService"
import type { ItemResolution} from "./checkoutSchemas"
import { ProductMediaCarouselComponent } from "../media/mediaComponent";

function OrderPage() {
	const navigate = useNavigate()

    const { id } = useParams()
    useEffect(() => {
        if (!id) 
            navigate(AppRoutes.profile);
    }, [id, navigate])

    const {data: orderDetail} = useOrderQuery(Number(id))
    if (orderDetail ) {
        return (
            <div className="rounded border border-slate-200 bg-white p-4">
                <h1 className="text-lg font-semibold">
                    Order 
                </h1>
                <h2 className="text-lg font-semibold">
                    {orderDetail.addressString}
                </h2>
                <p className="text-sm text-slate-600">
                    {orderDetail.createdAt.toString()}
                </p>
                
            <div>
                { orderDetail.itemResolutions.map(o => 
                    <CardItemCard key={o.productSummary.name} itemResolution={o} />
                )}
            </div>

            <p>{formatMoney(orderDetail.costAudCent)}</p>
            </div>
        )
    }
    else
        return <div></div>
}

function CardItemCard(
    { itemResolution }: 
    { itemResolution: ItemResolution }
) {
    const navigate = useNavigate()
    const productSummary = itemResolution.productSummary
    return (
        <div 
        className="rounded border border-slate-200 bg-white p-3 shadow-sm"
        >
            
            <div
            onClick={() => {navigate(`${AppRoutes.product}/${productSummary.slug}`)}}
            >
                <ProductMediaCarouselComponent productId={productSummary.id} limit={1} />
                <h2 className="mt-2 font-semibold">{productSummary.name}</h2>
            </div>
            
            <div className={itemResolution.onSale ? "bg-red-200" : ""} >
                <p>{formatMoney(itemResolution.unitPriceCent)} each </p>
                <p>{itemResolution.quantity}x </p>
                <p>{formatMoney(itemResolution.lineTotalCent)} total </p>
            </div>

        </div>
    )
}


export { OrderPage }