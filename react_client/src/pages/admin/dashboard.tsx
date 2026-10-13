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
	<Page className="bg-slate-50 px-4 py-8">
		<Container className="space-y-8">
			<Heading className="text-center text-3xl sm:text-4xl">
				Admin Dashboard
			</Heading>

			<section className="space-y-4">
				<PerformanceLoader
				render={({ form, data }) => (
					<>
						<div className="flex flex-wrap items-end justify-between gap-4">
							<Heading level={2} className="text-2xl">
								Performance
							</Heading>
							<div className="w-48">
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

			<div className="grid gap-6 lg:grid-cols-3">
				<section className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-2">
					<Heading level={2} className="mb-4 text-xl">
						Revenue / Orders
					</Heading>
					<div className="h-80">
						<Graph />
					</div>
				</section>

				<section className="rounded-xl border bg-white p-5 shadow-sm">
					<Heading level={2} className="mb-4 text-xl">
						Requires Attention
					</Heading>
					<div className="space-y-3">
						<AttentionInfo />
					</div>
				</section>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<section className="rounded-xl border bg-white p-5 shadow-sm">
					<Heading level={2} className="mb-4 text-xl">
						Recent Orders
					</Heading>
					<div className="space-y-2">
						<RecentLoader 
						render={({ orders }) => 
							<List
							items={orders}
							render={(order) => (
								<div className={
									"grid grid-cols-2 rounded-lg bg-gray-50 " +
									"px-3 py-2 text-sm"
								}>
									<OrderAdminPerformanceInfo 
									order={order}
									/>
								</div>
							)}/>
						}/>
					</div>
				</section>

				<section className="rounded-xl border bg-white p-5 shadow-sm">
					<Heading level={2} className="mb-4 text-xl">
						Top Products
					</Heading>
					<div className="space-y-2">
						<TopLoader 
						limit={3}
						render={({ products }) => 
							<List
							items={products}
							render={(product) => (
								<div className={
									"grid grid-cols-2 rounded-lg bg-gray-50 " +
									"px-3 py-2 text-sm"
								}>
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