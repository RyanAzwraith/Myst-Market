

import { 
    PerformanceSection,
    RequiresAttentionSection,
    RecentOrdersSection,
    TopProductsSection,
    Graph,
} from "@/old_features/admin";

export { DashboardPage };

function DashboardPage() {
    return (
        <main>
            <h1 className="mb-4 text-xl font-semibold">Admin Dashboard</h1>
            <PerformanceSection />
            <div className="mb-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <Graph />
                <RequiresAttentionSection />
            </div>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <RecentOrdersSection />
                <TopProductsSection />
            </div>
        </main>
    );
}
/*
import { useState } from "react"
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

import { formatMoney } from "@/utils/formatMoney"
import {
    useAttentionQuery,
    useGraphQuery,
    usePerformanceQuery,
} from "@/features/app"
import { useTopProductsQuery } from "@/features/product"
import { useGetRecentQuery } from "@/features/order"

function Graph() {
    const { data, isLoading, isError } = useGraphQuery()

    return (
        <section className="rounded border p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Revenue / Orders</h2>
            {isLoading ? <div>Loading...</div> : null}
            {isError ? <div>Error loading graph</div> : null}
            {!isLoading && !isError && data ? (
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis
                                yAxisId="revenue"
                                tickFormatter={value =>
                                    formatMoney(Number(value))
                                }
                            />
                            <YAxis
                                yAxisId="orders"
                                orientation="right"
                            />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                name="Revenue"
                                stroke="#2563eb"
                                yAxisId="revenue"
                            />
                            <Line
                                type="monotone"
                                dataKey="orders"
                                name="Orders"
                                stroke="#16a34a"
                                yAxisId="orders"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : null}
        </section>
    )
}

function RequiresAttentionSection() {
    const { data, isLoading, isError } = useAttentionQuery()

    return (
        <section className="rounded border p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">
                Requires Attention
            </h2>
            {isLoading ? <div>Loading...</div> : null}
            {isError ? <div>Error loading attention items</div> : null}
            {!isLoading && !isError && data ? (
                <div className="space-y-2">
                    <div>⚠ {data.pendingOrders} orders pending</div>
                    <div>
                        ⚠ {data.outOfStockProducts} out of stock products
                    </div>
                    <div>⚠ {data.salesEnding} sales ending</div>
                </div>
            ) : null}
        </section>
    )
}

const performancePeriods = [7, 30, 90] as const

function percentageChange(current: number, previous: number) {
    if (previous === 0) return current === 0 ? 0 : 100
    return ((current - previous) / previous) * 100
}

function PerformanceSection() {
    const [periodDays, setPeriodDays] = useState(30)
    const { data, isLoading, isError } = usePerformanceQuery(periodDays)

    return (
        <section className="mb-4 rounded border p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Performance</h2>
                <label>
                    <span className="sr-only">Performance period</span>
                    <select
                        aria-label="Performance period"
                        className="rounded border px-2 py-1"
                        value={periodDays}
                        onChange={event =>
                            setPeriodDays(Number(event.target.value))
                        }
                    >
                        {performancePeriods.map(days => (
                            <option key={days} value={days}>
                                Last {days} days
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            {isLoading ? <div>Loading...</div> : null}
            {isError ? <div>Error loading performance</div> : null}
            {!isLoading && !isError && data ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <PerformanceMetric
                        label="Revenue"
                        value={formatMoney(data.revenue)}
                        change={percentageChange(
                            data.revenue,
                            data.previousRevenue,
                        )}
                    />
                    <PerformanceMetric
                        label="Orders"
                        value={data.orders}
                        change={percentageChange(
                            data.orders,
                            data.previousOrders,
                        )}
                    />
                    <PerformanceMetric
                        label="New Customers"
                        value={data.newCustomers}
                        change={percentageChange(
                            data.newCustomers,
                            data.previousNewCustomers,
                        )}
                    />
                    <PerformanceMetric
                        label="Revenue Lost"
                        value={formatMoney(data.revenueLost)}
                        change={percentageChange(
                            data.revenueLost,
                            data.previousRevenueLost,
                        )}
                    />
                </div>
            ) : null}
        </section>
    )
}

function PerformanceMetric({
    label,
    value,
    change,
}: {
    label: string
    value: number | string
    change: number
}) {
    const direction = change >= 0 ? "↑" : "↓"

    return (
        <div className="border-t pt-3">
            <div className="text-sm">{label}</div>
            <div className="text-xl font-semibold">{value}</div>
            <div className="text-sm">
                {direction} {Math.abs(change).toFixed(1)}%
            </div>
        </div>
    )
}

function RecentOrdersSection() {
    const { data, isLoading, isError } = useGetRecentQuery()

    return (
        <section className="rounded border p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Recent Orders</h2>
            {isLoading ? <div>Loading...</div> : null}
            {isError ? <div>Error loading recent orders</div> : null}
            {!isLoading && !isError && data?.orders.length === 0 ? (
                <div>No recent orders</div>
            ) : null}
            {!isLoading && !isError ? (
                <div className="space-y-2">
                    {data?.orders.map(order => (
                        <div
                            className="flex items-center justify-between gap-3"
                            key={order.orderId}
                        >
                            <span>#{order.orderId}</span>
                            <span>{formatMoney(order.totalCent)}</span>
                            <span>{order.status}</span>
                        </div>
                    ))}
                </div>
            ) : null}
        </section>
    )
}

function TopProductsSection() {
    const { data, isLoading, isError } = useTopProductsQuery()

    return (
        <section className="rounded border p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Top Products</h2>
            {isLoading ? <div>Loading...</div> : null}
            {isError ? <div>Error loading top products</div> : null}
            {!isLoading && !isError && data?.length === 0 ? (
                <div>No top products</div>
            ) : null}
            {!isLoading && !isError ? (
                <div className="space-y-2">
                    {data?.map(product => (
                        <div
                            className="flex items-center justify-between gap-3"
                            key={product.id}
                        >
                            <span>{product.name}</span>
                            <span>{product.unitsSold}</span>
                        </div>
                    ))}
                </div>
            ) : null}
        </section>
    )
}

Page Layout:

│ Dashboard Page │

┌────────────────────────────────────────────────────────────┐
│ Performance                             Last 30 days ▼     │
├────────────┬────────────┬────────────┬─────────────────────┤
│ Revenue    │ Orders     │ Customers  │ Revenue Lost        │
│ $12,450    │ 183        │ 1,240      │ $1,240              │
│ ↑ 14.2%    │ ↑ 8.3%     │ ↑ 5.1%     │ ↓ 12.4%             │
└────────────┴────────────┴────────────┴─────────────────────┘

┌─────────────────────────────────────┐ ┌────────────────────┐
│ Revenue / Orders                    │ │ Requires Attention │
│                                     │ │                    │
│          ╭────╮                     │ │ ⚠ 8 orders pending │
│     ╭────╯    ╰────╮                │ │ ⚠ 4 out of stock   │
│ ────╯              ╰────            │ │ ⚠ 3 sales ending   │
│                                     │ │                    │
└─────────────────────────────────────┘ └────────────────────┘

┌─────────────────────────────────────┐ ┌────────────────────┐
│ Recent Orders                       │ │ Top Products       │
│                                     │ │                    │
│ #1042  Alex       $124  Processing│ │ Moon Orb      43   │
│ #1041  Sarah       $89  Shipped   │ │ Dragon Scale  37   │
│ #1040  Ryan       $245  Pending   │ │ Shadow Dagger 31   │
│                                     │ │                    │
└─────────────────────────────────────┘ └────────────────────┘

*/