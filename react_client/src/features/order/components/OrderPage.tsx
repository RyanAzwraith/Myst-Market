import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";

import { formatMoney } from '@/utils/formatMoney'

import { PageRoutes } from '@/PageRoutes'

import type { ItemResolution} from "../index";
import { ProductMediaCarouselComponent } from "../index";

import { useGetByIdQuery } from "../service"

function OrderPage() {
	const navigate = useNavigate()

    const { id } = useParams()
    useEffect(() => {
        if (!id) 
            navigate(PageRoutes.profile);
    }, [id, navigate])

    const {data} = useGetByIdQuery(Number(id))
    if (!data) return <div>Loading...</div>
    const order = data.order

    return (
        <div className="rounded border border-slate-200 bg-white p-4">
            <h1 className="text-lg font-semibold">
                Order 
            </h1>
            <h2 className="text-lg font-semibold">
                {order.addressString}
            </h2>
            <p className="text-sm text-slate-600">
                {order.createdAt.toString()}
            </p>
            
        <div>
            { order.itemResolutions.map(o => 
                <CardItemCard key={o.productSummary.name} itemResolution={o} />
            )}
        </div>

        <p>{formatMoney(order.costAudCent)}</p>
        </div>
    )

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
            onClick={() => {navigate(`${PageRoutes.product}/${productSummary.slug}`)}}
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