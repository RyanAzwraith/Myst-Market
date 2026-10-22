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
    className="order-card"
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
    wrapperClassName="order-row"
    className="order-row-button"
    modalClassName="order-modal-dialog"
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
    <div className="order-modal">
    <Heading level={2} className="order-modal-title">
            Order Details
        </Heading>
        <div className="order-modal-info">
            <AdminInfo order={order} user={user} />
        </div>

        <StatusForm
        order={order}
        className="order-status-form"
        />

        <Heading level={3} className="order-modal-items-title">Items</Heading>
        <div className="order-modal-items">
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
