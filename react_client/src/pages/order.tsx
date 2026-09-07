import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";

import { Page } from "@/shared"

import { PageRoutes } from '@/app/PageRoutes'

import { OrderDisplay } from "@/features/order"

export { OrderPage }

function OrderPage() {
    const navigate = useNavigate()

    const { id } = useParams()
    useEffect(() => {
        if (!id) 
            navigate(PageRoutes.profile);
    }, [id, navigate])
    return (
        <Page>
            <OrderDisplay 
            orderId={Number(id)} 
            onCardClick={(item) => 
                navigate(`${PageRoutes.product}/${item.productSummary.slug}`)
            }/>
        </Page>
    )
}