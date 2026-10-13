
import { faker } from "@faker-js/faker"

import type {
    Order,
    OrderSummary,
    Status,
} from "@/features/order/schema"

import { itemResolutions } from "@/features/item"

export {
    order,
    orders,
    orderSummaries,
}

faker.seed(12345)

const statuses: Status[] = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "error",
]

const orderFactory = (id: number = 1): Order => {
    const createdAt = faker.date
        .between({
            from: "2026-01-01",
            to: "2026-12-31",
        })
        .toISOString()
        .split("T")[0]

    return {
        id,
        userId: id,
        addressString: [
            faker.location.streetAddress(),
            faker.location.city(),
        ].join(", "),
        items: itemResolutions,
        costAudCent: faker.number.int({
            min: 1000,
            max: 100000,
        }),
        createdAt,
        status: faker.helpers.arrayElement(statuses),
    }
}

const orderSummaryFactory = (value: Order): OrderSummary => ({
    id: 1,
    createdAt: value.createdAt,
    totalCent: value.costAudCent,
    status: value.status,
})

const order: Order = orderFactory()
const orders: Order[] = Array.from(
    { length: 25 },
    () => orderFactory(),
)

const orderSummaries: OrderSummary[] = orders.map(orderSummaryFactory)