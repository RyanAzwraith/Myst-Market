
import { faker } from "@faker-js/faker"

import { recordValues } from "@/utils/funcs"

import type {
    Order,
    OrderSummary,
    Status,
} from "@/features/order/schema"
import { status } from "@/features/order/schema"

import {
    itemResolutionList,
    itemResolutionListFactory,
} from "./item"

export {
    orderFactory,
    order,
    orderListFactory,
    orderList,
    orderSummaryFactory,
    orderSummary,
    orderSummaryListFactory,
    orderSummaryList,
}

faker.seed(12345)

const statuses: Status[] = [
    ...recordValues(status),
]

const orderFactory = (
    overrides: Partial<Order> = {},
    items = itemResolutionList,
): Order => {
    const createdAt = faker.date
        .between({
            from: "2026-01-01",
            to: "2026-12-31",
        })
        .toISOString()
        .split("T")[0]

    return {
        id: 1,
        userId: 1,
        addressString: [
            faker.location.streetAddress(),
            faker.location.city(),
        ].join(", "),
        items,
        costAudCent: faker.number.int({
            min: 1000,
            max: 100000,
        }),
        createdAt,
        status: faker.helpers.arrayElement(statuses),
        ...overrides,
    }
}

const order: Order = orderFactory()

const orderListFactory = (
    length: number = 25,
): Order[] => Array.from(
    { length },
    () => orderFactory(),
)

const orderList: Order[] = orderListFactory()

const orderSummaryFactory = (
    overrides: Partial<OrderSummary> = {},
    order: Order = orderFactory(),
): OrderSummary => ({
    id: order.id,
    createdAt: order.createdAt,
    totalCent: order.costAudCent,
    status: order.status,
    ...overrides,
})

const orderSummary: OrderSummary = orderSummaryFactory({})

const orderSummaryListFactory = (
    length: number = 25,
): OrderSummary[] => Array.from(
    { length },
    () => orderSummaryFactory(),
)

const orderSummaryList: OrderSummary[] =
    orderSummaryListFactory()