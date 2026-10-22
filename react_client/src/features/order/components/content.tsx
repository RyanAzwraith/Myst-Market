import { 
    Card,
    MoneyFormat, 
    Text 
} from "@/shared"

import type { UserDetail } from "../index"

import type { Order, OrderSummary } from "../schema"


export { 
    OrderSummaryInfo,
    OrderInfo,
    AdminSummaryInfo,
    AdminInfo,
    AdminPerformanceInfo
}

function OrderSummaryInfo({ order }: { 
    order: OrderSummary 
}) {
    return (
    <>
        <Text>{order.createdAt} </Text>
        <Text> <MoneyFormat amount={order.totalCent} /> total </Text>
    </>
    )
}

function OrderInfo({ order }: { 
    order: Order 
}) {
    return (
        <Card className="order-info">
            <Text className="order-info-address">
                Delivery address: {order.addressString}
            </Text>
            <Text variant="muted">Placed {order.createdAt}</Text>
            <Text className="order-info-total">
                Total: <MoneyFormat amount={order.costAudCent} />
            </Text>
        </Card>
    )
    }

function AdminSummaryInfo({ order }: { 
    order: OrderSummary 
}) {
    return (
    <div className="order-admin-summary-info">
        <Text className="order-summary-id">
            Order #{order.id}
        </Text>
        <Text className="order-summary-status">
            <span className="order-summary-status-label">Status:</span>{" "}
            {order.status}
        </Text>
        <Text className="order-summary-total">
            <MoneyFormat amount={order.totalCent} />
        </Text>
    </div>
    )
}

function AdminInfo({ 
    order, user 
}: { 
    order: Order,
    user: UserDetail
}) {
    return (
    <div className="order-admin-info">
        <div className="order-admin-info-column">
            <Text className="order-admin-info-total">
                Total: <MoneyFormat amount={order.costAudCent} />
            </Text>
            <Text className="order-admin-info-muted">
                Items: {order.items.length}
            </Text>
            <Text className="order-admin-info-muted">
                Address: {order.addressString}
            </Text>
        </div>
        <div className="order-admin-info-column">
            <Text className="order-admin-info-muted">
                User ID: {order.userId}
            </Text>
            <Text className="order-admin-info-muted">
                User: {user.name}
            </Text>
            <Text className="order-admin-info-muted">
                Email: {user.email}
            </Text>
            <Text className="order-admin-info-muted">
                Account: {user.isRegistered ? 'Registered' : 'Guest'}
            </Text>
        </div>
    </div>
    )
}

function AdminPerformanceInfo({ order }: { 
    order: Order 
}) {
    return (
    <>
        <Text><MoneyFormat amount={order.costAudCent} /></Text>
        <Text>{order.status}</Text>
    </>
    )
}
