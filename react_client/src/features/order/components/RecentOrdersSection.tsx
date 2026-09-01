import { formatMoney } from '@/utils/formatMoney';

import { useGetRecentQuery } from '../service';

export {
    RecentOrdersSection,
}

function RecentOrdersSection() {
	const { data: orders, isLoading, isError } = useGetRecentQuery();

	return (
		<section className="rounded border p-4 shadow-sm">
			<h2 className="mb-3 text-lg font-semibold">Recent Orders</h2>
			{isLoading ? <div>Loading...</div> : null}
			{isError ? <div>Error loading recent orders</div> : null}
			{!isLoading && !isError && orders?.length === 0 ? (
				<div>No recent orders</div>
			) : null}
			{!isLoading && !isError ? (
				<div className="space-y-2">
					{orders?.map(order => (
						<div
							className="flex items-center justify-between gap-3"
						>
							<span>{formatMoney(order.costAudCent)}</span>
							<span>{order.status}</span>
						</div>
					))}
				</div>
			) : null}
		</section>
	);
}