import { formatMoney } from '@/utils/formatMoney';

import { useGetRecentQuery } from '../service';
import { List, Loading } from '@/shared';

export {
    RecentOrdersSection,
}

function RecentOrdersSection() {
	const { data: orders } = useGetRecentQuery();
	if (!orders) return <Loading />;

	return (
		<section>
			<h2 >Recent Orders</h2>
			<List
			items={orders}
			renderItem={(order) => 
				<div>
					<span>{formatMoney(order.costAudCent)}</span>
					<span>{order.status}</span>
				</div>
			} />
		</section>
	);
}