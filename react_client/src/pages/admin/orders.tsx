
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
    <Page className="min-h-screen bg-slate-50 px-4 py-8">
        <AdminSearchLoader 
        render={({searchQuery, searchParams, selectEdit, orders}) => (
        <>
            <QueryParamFields queryParams={searchParams} />
            <AdminSearchTitle adminSearchParams ={searchParams} />
            <SelectEditDisplay
            selectEdit={selectEdit}
            />

            <LoadContent
            className="space-y-3"
            hasMore={!searchQuery.hasNextPage}
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
