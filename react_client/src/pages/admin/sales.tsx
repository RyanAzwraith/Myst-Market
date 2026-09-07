import { AdminSearchDisplay } from "@/features/sale"
import { Page } from "@/shared/elements/page"

export { SalesPage }

function SalesPage() {
    return (
        <Page>
            <AdminSearchDisplay limit={20} />
        </Page>
    )
}