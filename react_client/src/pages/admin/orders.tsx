import { AdminSearchDisplay } from "@/features/order"
import { Page } from "@/shared/elements/page"

export { OrdersPage }

function OrdersPage() {
    return (
        <Page>
            <AdminSearchDisplay limit={20} />
        </Page>
    )
}