import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";

import { 
    List,
    Page,
    Heading,
    Stack,
} from "@/shared";

import { PageRoutes } from '@/app/PageRoutes'

import { ResolutionCard } from "@/features/item";
import { OrderLoader } from "@/features/order/components/loader";
import { OrderInfo } from "@/features/order/components/content";

export { OrderPage }

function OrderPage() {
    const navigate = useNavigate()

    const { id } = useParams()
    useEffect(() => {
        if (!id) 
            navigate(PageRoutes.profile);
    }, [id, navigate])

    return (
    <Page className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <Heading className="text-center text-3xl sm:text-4xl">
            Order
        </Heading>  

        <OrderLoader
        orderId={Number(id)}
        render={({ order }) => (
        <>
            <OrderInfo order={order} />
            <Stack
            className="gap-3"
            children={
                <List
                items={order.items}
                render={(item) =>
                    <ResolutionCard 
                    key={item.product.name} 
                    item={item} 
                    onClick={() => navigate(PageRoutes.product(item.product.slug))}
                    />
                } />
            } />
        </>
        )}
        />
    </Page>
    )
}        