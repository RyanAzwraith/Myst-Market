import { 
    Card, 
    Heading, 
    List, 
    Loading,
    ModalTrigger,
    Row
} from "@/shared"

import { 
    FormInputsForm 
} from "@/hooks/FormInputs"

import { ResolutionCard } from "../index"

import type { 
    OrderSummary 
} from "../schema"
import { 
    useOrderQuery, 
} from "../service"
import { 
    useStatusForm 
} from "../hook"

import { 
    OrderSummaryInfo, 
    AdminSummaryInfo, 
    AdminInfo 
} from "./content"


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
    <Row>
        <ModalTrigger
        button={
            <AdminSummaryInfo order={order} />
        }
        render={() => 
            <OrderModal orderId={order.id} />
        } />
    </Row>
    );
}

function OrderModal({ orderId }: { 
    orderId: number,
}) {
    
    const { data } = useOrderQuery(orderId)
    if (!data) return <Loading />
    
    const statusForm = useStatusForm({ order: data.order })

    const { order, user } = data
    return (
    <>
        <Heading level={2}>Order Details</Heading>
        <AdminInfo order={order} user={user} />
        <FormInputsForm formInputs={statusForm}/>

        <Heading level={3}>Items</Heading>
        <List
        items={order.items}
        render={item => 
            <ResolutionCard 
            key={`${item.product.name}-${item.product.id}`} 
            item={item}
            />
        }
        />
    </>
    );
}