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
        <Card className="space-y-2 bg-gray-50">
            <Text className="font-medium text-gray-900">
                Delivery address: {order.addressString}
            </Text>
            <Text variant="muted">Placed {order.createdAt}</Text>
            <Text className="text-lg font-bold text-gray-900">
                Total: <MoneyFormat amount={order.costAudCent} />
            </Text>
        </Card>
    )
    }

function AdminSummaryInfo({ order }: { 
    order: OrderSummary 
}) {
    return (
    <div className="grid w-full gap-2 px-3 py-2 sm:grid-cols-3 sm:items-center">
        <Text className="font-semibold text-gray-900">
            Order #{order.id}
        </Text>
        <Text className="text-sm text-gray-600">
            <span className="font-medium text-gray-700">Status:</span>{" "}
            {order.status}
        </Text>
        <Text className="font-semibold text-gray-900 sm:text-right">
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
    <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="space-y-1">
            <Text className="font-medium text-gray-900">
                Total: <MoneyFormat amount={order.costAudCent} />
            </Text>
            <Text className="text-gray-600">
                Items: {order.items.length}
            </Text>
            <Text className="text-gray-600">
                Address: {order.addressString}
            </Text>
        </div>
        <div className="space-y-1">
            <Text className="text-gray-600">User ID: {order.userId}</Text>
            <Text className="text-gray-600">User: {user.name}</Text>
            <Text className="text-gray-600">Email: {user.email}</Text>
            <Text className="text-gray-600">
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
