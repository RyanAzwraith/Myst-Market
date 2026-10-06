
import type { 
    Order,
    OrderSummary,
} from "@/features/order/schema"

import { itemResolutions } from "./item"

export {
    order,
    orders,
    orderSummaries,
}

const order: Order = {
    id: 1,
    userId: 1,
    addressString: "1 Mock Street, Mock City",
    items: itemResolutions,
    costAudCent: 0,
    createdAt: "2026-01-01",
    status: "pending",
}

const orders: Order[] = [order]

const orderSummaries: OrderSummary[] = [{
    id: order.id,
    createdAt: order.createdAt,
    totalCent: order.costAudCent,
    status: order.status,
}]