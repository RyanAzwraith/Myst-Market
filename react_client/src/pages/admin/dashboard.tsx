import { 
	Page, 
	List,
	Heading,
	Container
} from "@/shared"
import { SelectOneField } from "@/hooks/FormInputs/components"

import { 
    Graph, 
	AttentionInfo,
	PerformanceLoader,
	PerformanceDisplay,
} from "@/features/app"
import { 
	PerformanceInfo as ProductPerformanceInfo ,
	type ProductAnalytics,
	TopLoader
} from "@/features/product"
import { 
	RecentLoader,
    AdminPerformanceInfo as OrderAdminPerformanceInfo,
} from "@/features/order"


export { DashboardPage }


function DashboardPage() {
    return (
	<Page className="dashboard-page admin-page">
		<Container className="dashboard-content">
			<Heading className="dashboard-title">
				Admin Dashboard
			</Heading>

			<section className="dashboard-performance">
				<PerformanceLoader
				render={({ form, data }) => (
					<>
						<div className="dashboard-performance-header">
							<Heading level={2} className="dashboard-section-title">
								Performance
							</Heading>
							<div className="dashboard-period">
								<SelectOneField
								binding={form.bindings.period}
								/>
							</div>
						</div>
						<PerformanceDisplay performance={data} />
					</>
				)}
				/>
			</section>

			<div className="dashboard-overview-grid">
				<section className="dashboard-panel dashboard-revenue-panel">
					<Heading level={2} className="dashboard-panel-title">
						Revenue / Orders
					</Heading>
					<div className="dashboard-chart">
						<Graph />
					</div>
				</section>

				<section className="dashboard-panel">
					<Heading level={2} className="dashboard-panel-title">
						Requires Attention
					</Heading>
					<div className="dashboard-attention-list">
						<AttentionInfo />
					</div>
				</section>
			</div>

			<div className="dashboard-lists-grid">
				<section className="dashboard-panel">
					<Heading level={2} className="dashboard-panel-title">
						Recent Orders
					</Heading>
					<div className="dashboard-list">
						<RecentLoader 
						render={({ orders }) => 
							<List
							items={orders}
							render={(order) => (
								<div className="dashboard-list-row">
									<OrderAdminPerformanceInfo 
									order={order}
									/>
								</div>
							)}/>
						}/>
					</div>
				</section>

				<section className="dashboard-panel">
					<Heading level={2} className="dashboard-panel-title">
						Top Products
					</Heading>
					<div className="dashboard-list">
						<TopLoader 
						limit={3}
						render={({ products }) => 
							<List
							items={products}
							render={(product) => (
								<div className="dashboard-list-row">
									<ProductPerformanceInfo 
									product={product as ProductAnalytics} 
									/>
								</div>
							)}/>
						}/>
					</div>
				</section>
			</div>
		</Container>
	</Page>
    )
}


/*

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