import { useNavigate } from "react-router-dom"

import { Page } from "@/shared"

import { PageRoutes } from "@/app/PageRoutes"

import { CheckoutForm } from "@/features/order"
import type { ItemSummary } from "@/features/item"

export { CheckoutPage }

function CheckoutPage() {
    const navigate = useNavigate()
    return (
        <Page>
            <CheckoutForm 
            onItemCardClick={(item: ItemSummary) => 
                navigate(`${PageRoutes.product}/${item.productId}`)
            }/>
        </Page>
    )
}