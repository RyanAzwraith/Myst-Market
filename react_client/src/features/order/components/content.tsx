import { 
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
    <>
        <Text>{order.addressString}</Text>
        <Text>{order.createdAt}</Text>
        <Text>Total: <MoneyFormat amount={order.costAudCent} /></Text>
    </>
    )
}

function AdminSummaryInfo({ order }: { 
    order: OrderSummary 
}) {
    return (
    <>
        <Text>Order #{order.id} </Text>
        <Text>Status: {order.status}</Text>
        <Text>Total: <MoneyFormat amount={order.totalCent} /></Text>
    </>
    )
}

function AdminInfo({ 
    order, user 
}: { 
    order: Order,
    user: UserDetail
}) {
    return (
    <>
        <div>
            <Text>Total: $<MoneyFormat amount={order.costAudCent} /></Text>
            <Text>Num Items: {order.items.length}</Text>
            <Text>Address: {order.addressString}</Text>
        </div>
        <div>
            <Text>User ID: {order.userId}</Text>
            <Text>User Name: {user.name}</Text>
            <Text>User Email: {user.email}</Text>
            <Text>Is Registered: {user.isRegistered ? 'Yes' : 'No'}</Text>
        </div>
    </>
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

