
import { LoadContent, Page } from "@/shared"

import { QueryParamFields } from "@/hooks/QueryParams"
import { SelectEditDisplay, ItemRow } from "@/hooks/SelectEdit"

import { 
    AdminSearchLoader, 
    AdminSearchTitle 
} from "@/features/order"
import { OrderRow } from "@/features/order"


export { OrdersPage }


function OrdersPage() {
    return (
    <Page className="orders-page admin-page">
        <AdminSearchLoader 
        render={({searchQuery, searchParams, selectEdit, orders}) => (
        <>
            <QueryParamFields queryParams={searchParams} />
            <AdminSearchTitle adminSearchParams ={searchParams} />
            <SelectEditDisplay
            selectEdit={selectEdit}
            />

            <LoadContent
            className="admin-order-list"
            hasMore={searchQuery.hasNextPage}
            onClick={searchQuery.fetchNextPage}
            content={(orders ?? []).map(o => 
                <ItemRow
                key={o.id}
                id={o.id}
                selectEdit={selectEdit}
                >
                    <OrderRow order={o} />
                </ItemRow>
            )}/>
        </>
        )}/>
        
    </Page>
    )
}
