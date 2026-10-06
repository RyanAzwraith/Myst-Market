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
	<Page>
		<Heading>Admin Dashboard</Heading>

		<Heading level={2}>Performance</Heading>
		<Container>
			<PerformanceLoader
			render={({ form, data }) => (
			<>
				<SelectOneField binding={form.bindings.period}/>
				<PerformanceDisplay performance={data} />
			</>
			)} />

		</Container>
		
		<Container>
			<Heading level={2}>Revenue / Orders</Heading>
			<Container>
				<Graph />
			</Container>

			<Heading level={2}>Requires Attention</Heading>
			<Container>
				<AttentionInfo />
			</Container>
		</Container>
		
		<Container>
			<Heading level={2}>Recent Orders</Heading>
			<Container>
				<RecentLoader 
				render={({ orders }) => 
					<List
					items={orders}
					render={(order) => (
						<OrderAdminPerformanceInfo 
						order={order}
						/>
					)}/>
				}/>
			</Container>

			<Heading level={2}>Top Products</Heading>
			<Container>
				<TopLoader 
				limit={3}
				render={({ products }) => 
					<List
					items={products}
					render={(product) => (
						<ProductPerformanceInfo 
						product={product as ProductAnalytics} 
						/>
					)}/>
				}/>
			</Container>
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