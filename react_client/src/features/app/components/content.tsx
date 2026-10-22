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
import { ArrowUpIcon, ArrowDownIcon, Card, Loading, Text, List, StarSolidIcon, StarOutlineIcon, Inline } from "@/shared"
import { ExclamationTriangleIcon } from '@/shared';
import type { Performance } from '../schema';

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
    <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
        <Card className="flex min-h-28 flex-col justify-center text-center">
            <Text className="text-3xl font-bold text-blue-600">
                {stats.productCount}
            </Text>
            <Text variant="muted">Items discovered</Text>
        </Card>
        <Card className="flex min-h-28 flex-col justify-center text-center">
            <Text className="text-3xl font-bold text-blue-600">
                {stats.customerCount}
            </Text>
            <Text variant="muted">Adventurers served</Text>
        </Card>
        <Card className="flex min-h-28 flex-col items-center justify-center">
            <Text className="text-3xl font-bold text-blue-600">
                {stats.totalAverageRating.toFixed(1)}
            </Text>
            <Inline>
                <List
                items={Array.from({ length: 5 })}
                render={(_, n) => 
                    n + 1 <= stats.totalAverageRating ? 
                    <StarSolidIcon key={`rating-${n}`} /> 
                        : 
                    <StarOutlineIcon key={`rating-${n}`} />
                }/>
            </Inline>
            <Text variant="muted">Average rating</Text>
        </Card>
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
		<Text className="flex items-center gap-2 text-gray-700">
			<ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
			{data.pendingOrders} orders pending
		</Text>
		<Text className="flex items-center gap-2 text-gray-700">
			<ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
			{data.outOfStockProducts} out of stock products
		</Text>
		<Text className="flex items-center gap-2 text-gray-700">
			<ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
			{data.salesEnding} sales ending
		</Text>
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
    <Card className="space-y-2">
        <Text variant="muted">{label}</Text>
        <Text className="text-2xl font-bold text-gray-900">{value}</Text>
        <Text className={
            change >= 0 ? "text-sm text-green-600" : "text-sm text-red-600"
        }>
            {change >= 0 ? 
                <ArrowUpIcon className="mr-1 inline h-4 w-4" /> 
                    :   
                <ArrowDownIcon className="mr-1 inline h-4 w-4" />
            } 
            {change}%
        </Text>
    </Card>
	);
}