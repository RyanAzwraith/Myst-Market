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
    <div className="stats-info">
        <Card className="stats-card stats-product-card">
            <Text className="stats-value">
                {stats.productCount}
            </Text>
            <Text variant="muted">Items discovered</Text>
        </Card>
        <Card className="stats-card stats-customer-card">
            <Text className="stats-value">
                {stats.customerCount}
            </Text>
            <Text variant="muted">Adventurers served</Text>
        </Card>
        <Card className="stats-card stats-rating-card">
            <Text className="stats-value">
                {stats.totalAverageRating.toFixed(1)}
            </Text>
            <Inline className="stats-rating-stars">
                <List
                items={Array.from({ length: 5 })}
                render={(_, n) => 
                    n + 1 <= stats.totalAverageRating ? 
                    <StarSolidIcon
                    key={`rating-${n}`}
                    className="stats-rating-icon"
                    />
                        : 
                    <StarOutlineIcon
                    key={`rating-${n}`}
                    className="stats-rating-icon"
                    />
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
    <ResponsiveContainer
    className="graph"
    width="100%"
    height="100%"
    >
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
		<Text className="attention-item">
			<ExclamationTriangleIcon className="attention-icon" />
			{data.pendingOrders} orders pending
		</Text>
		<Text className="attention-item">
			<ExclamationTriangleIcon className="attention-icon" />
			{data.outOfStockProducts} out of stock products
		</Text>
		<Text className="attention-item">
			<ExclamationTriangleIcon className="attention-icon" />
			{data.salesEnding} sales ending
		</Text>
	</>
	);
}

function PerformanceDisplay({performance} : {
    performance: Performance
}) {
	return (
    <div className="performance-display">
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
    <Card className="metric">
        <Text variant="muted">{label}</Text>
        <Text className="metric-value">{value}</Text>
        <Text className={
            change >= 0 ? "metric-change metric-change-positive"
                : "metric-change metric-change-negative"
        }>
            {change >= 0 ? 
                <ArrowUpIcon className="metric-change-icon" />
                    :   
                <ArrowDownIcon className="metric-change-icon" />
            } 
            {change}%
        </Text>
    </Card>
	);
}