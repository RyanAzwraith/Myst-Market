import { 
    Card, 
    Heading, 
    List, 
    Loading,
    ModalTrigger,
} from "@/shared"


import { ResolutionCard } from "../index"

import type { 
    OrderSummary 
} from "../schema"
import { 
    useOrderQuery, 
} from "../service"

import { 
    OrderSummaryInfo, 
    AdminSummaryInfo, 
    AdminInfo 
} from "./content"
import { 
    StatusForm 
} from "./interactive"


export { 
    OrderCard,
    OrderRow 
}


function OrderCard({ order, onClick }:  { 
    order: OrderSummary,
    onClick?: () => void
}) {
    return (
    <Card
    onClick={onClick}
    >
        <OrderSummaryInfo order={order} />
    </Card>
    )
}

function OrderRow({ order }: { 
    order: OrderSummary,
}) {
    return (
    <ModalTrigger
    className="block w-full rounded-lg text-left transition hover:bg-gray-50"
    modalClassName="max-h-[90vh] overflow-y-auto"
    dialogLabel={`Order ${order.id}`}
    button={
        <AdminSummaryInfo order={order} />
    }
    render={() => 
        <OrderModal orderId={order.id} />
    } />
    );
}

function OrderModal({ orderId }: { 
    orderId: number,
}) {
    
    const { data } = useOrderQuery(orderId)
    if (!data) return <Loading />
    
    const { order, user } = data
    return (
    <div className="space-y-5 text-gray-900">
        <Heading level={2} className="text-2xl">
            Order Details
        </Heading>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <AdminInfo order={order} user={user} />
        </div>

        <StatusForm
        order={order}
        className="space-y-3 rounded-lg border border-gray-200 p-4"
        />

        <Heading level={3} className="text-lg">Items</Heading>
        <div className="space-y-3">
            <List
            items={order.items}
            render={item => 
                <ResolutionCard 
                key={`${item.product.name}-${item.product.id}`} 
                item={item}
                />
            }
            />
        </div>
    </div>
    );
}
