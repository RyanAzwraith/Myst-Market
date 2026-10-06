import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

import { formatMoney } from '@/utils/formatMoney';
import { ArrowUpIcon, ArrowDownIcon, Loading, Text } from "@/shared"
import { ExclamationTriangleIcon } from '@/shared';
import type { Performance } from '../schema';

import {
    RatingFormat,
} from "../index"

import {
    useStatsQuery,
	useAttentionQuery,
	useGraphQuery,
} from '../service';


export {
    StatsInfo,
    Graph,
    AttentionInfo,
    PerformanceDisplay,
    Metric,
}

function StatsInfo() {
    const {data: stats} = useStatsQuery()
    if (!stats) return <Loading />
    return (
    <div>
        <Text>{stats.product_count} Items discovered</Text>
        <Text>{stats.customer_count} Adventurers served</Text>
        <RatingFormat rating={stats.total_average_rating} />
        <Text>Average Rating</Text>
    </div>
    )
}


function Graph() {
	const { data: graphPoints } = useGraphQuery();
	if (!graphPoints) return <Loading />
	return (
	<>
    <ResponsiveContainer width="100%" height="100%">
    <LineChart data={graphPoints}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis
        yAxisId="revenue"
        tickFormatter={value => formatMoney(Number(value))}
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
	</>
	);
}

function AttentionInfo() {
	const { data } = useAttentionQuery();
	if (!data) return <Loading />
	return (
	<>
		<Text><ExclamationTriangleIcon />{data.pendingOrders} orders pending</Text>
		<Text><ExclamationTriangleIcon /> {data.outOfStockProducts} out of stock products</Text>
		<Text><ExclamationTriangleIcon /> {data.salesEnding} sales ending</Text>
	</>
	);
}

function PerformanceDisplay({performance} : {
    performance: Performance
}) {
	return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
        label="Revenue"
        value={formatMoney(performance.revenue)}
        current={performance.revenue}
        previous={performance.previousRevenue}
        />
        <Metric
        label="Orders"
        value={performance.orders}
        current={performance.orders}
        previous={performance.previousOrders}
        />
        <Metric
        label="New Customers"
        value={performance.newCustomers}
        current={performance.newCustomers}
        previous={performance.previousNewCustomers}
        />
        <Metric
        label="Revenue Lost"
        value={formatMoney(performance.revenueLost)}
        current={performance.revenueLost}
        previous={performance.previousRevenueLost}
        />
    </div>
    )
}

function Metric({
	label, value, current, previous,
}: {
	label: string
	value: number | string
	current: number
	previous: number
}) {
    const change = Math.round(
        previous === 0 ? 
            current === 0 ? 0 : 100
                :
            ((current - previous) / previous) * 100
    )

	return (
    <>
        <Text>{label}</Text>
        <Text>{value}</Text>
        <Text>
            {change >= 0 ? 
                <ArrowUpIcon /> 
                    :   
                <ArrowDownIcon />
            } 
            {change}%
        </Text>
    </>
	);
}