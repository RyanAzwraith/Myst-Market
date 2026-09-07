import { useState } from 'react';
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
import { Loading } from "@/shared/elements/text"

import {
    RatingFormat,
} from "../index"

import {
    useStatsQuery,
	useAttentionQuery,
	useGraphQuery,
	usePerformanceQuery,
} from '../service';


export {
	Graph,
	Performance,
	RequiresAttention,
    StatsSection,
}


function StatsSection() {
    const {data: stats} = useStatsQuery()
    if (!stats) return <Loading />
    return (
        <div>
            <p>{stats.product_count} Items discovered</p>
            <p>{stats.customer_count} Adventurers served</p>
            <RatingFormat rating={stats.total_average_rating} />
            <p>Average Rating</p>
        </div>
    )
}

function Graph() {
	const { data: graphPoints, isLoading, isError } = useGraphQuery();

	return (
		<section className="rounded border p-4 shadow-sm">
			<h2 className="mb-3 text-lg font-semibold">Revenue / Orders</h2>
			{isLoading ? <div>Loading...</div> : null}
			{isError ? <div>Error loading graph</div> : null}
			{!isLoading && !isError && graphPoints ? (
				<div className="h-72 w-full">
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
				</div>
			) : null}
		</section>
	);
}

function RequiresAttention() {
	const { data, isLoading, isError } = useAttentionQuery();

	return (
		<section className="rounded border p-4 shadow-sm">
			<h2 className="mb-3 text-lg font-semibold">Requires Attention</h2>
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
	);
}

const performancePeriods = [7, 30, 90] as const;

function percentageChange(current: number, previous: number) {
	if (previous === 0) {
		return current === 0 ? 0 : 100;
	}
	return ((current - previous) / previous) * 100;
}

function Performance() {
	const [periodDays, setPeriodDays] = useState(30);
	const { data, isLoading, isError } = usePerformanceQuery();

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
						onChange={event => setPeriodDays(Number(event.target.value))}
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
	);
}

function PerformanceMetric({
	label,
	value,
	change,
}: {
	label: string;
	value: number | string;
	change: number;
}) {
	const direction = change >= 0 ? '↑' : '↓';

	return (
		<div className="border-t pt-3">
			<div className="text-sm">{label}</div>
			<div className="text-xl font-semibold">{value}</div>
			<div className="text-sm">
				{direction} {Math.abs(change).toFixed(1)}%
			</div>
		</div>
	);
}