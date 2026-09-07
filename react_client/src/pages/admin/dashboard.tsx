import { Page } from "@/shared/elements/page"

import { TopProductsSection } from "@/features/product"
import { RecentOrdersSection } from "@/features/order"
import { 
    Performance, 
    Graph, 
    RequiresAttention 
} from "@/features/app"

export { DashboardPage }

function DashboardPage() {
    return (
        <Page>
			<h1 >Admin Dashboard</h1>
			<Performance />
			<div className="mb-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
				<Graph />
				<RequiresAttention />
			</div>
			<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
				<RecentOrdersSection />
				<TopProductsSection />
			</div>
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