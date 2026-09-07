import { Page } from "@/shared/elements/page";

import { AdminSearchDisplay } from "@/features/product";


export { ProductsPage }


function ProductsPage() {
    return (
        <Page>
            <AdminSearchDisplay limit={20} />
        </Page>
    )
}