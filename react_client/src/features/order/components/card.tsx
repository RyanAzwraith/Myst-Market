
import { formatMoney } from "@/utils/formatMoney"
import { ButtonWrapper, Card, Row } from "@/shared"

import type { OrderSummary } from "../schema"
import { PopUpModalComponent } from "@/shared/PopUpModalComponent"
import { OrderModal } from "./modal"

export { 
    OrderCard,
    OrderRow 
}


function OrderCard({ order, onClick }:  { 
    order: OrderSummary,
    onClick?: () => void
}) {
    return (
        <Card >
            <ButtonWrapper
            onClick={onClick}
            >
                <p>{order.createdAt} </p>
                <p>{formatMoney(order.totalCent)} total </p>

            </ButtonWrapper>
        </Card>
    )
}

function OrderRow({ order }: { 
    order: OrderSummary,
}) {
    return (
        <Row>
            <PopUpModalComponent
            content={() => 
                <OrderModal orderId={order.id} />
            } >
                <div>
                    <div>Order #{order.id}</div>
                    <div>Status: {order.status}</div>
                    <div>
                        Total: ${(order.totalCent / 100).toFixed(2)}
                    </div>
                </div>
            </PopUpModalComponent>
        </Row>
    );
}