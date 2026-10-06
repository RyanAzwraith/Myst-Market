import { listToRecord } from "@/utils/funcs"
import { ChevronDownIcon, Page } from "@/shared"

import { QueryParamFields } from "@/hooks/QueryParams"
import { SelectEditDisplay } from "@/hooks/SelectEdit"

import { 
    AdminSearchLoader, 
    AdminSearchTitle 
} from "@/features/order"
import { OrderRow } from "@/features/order"


export { OrdersPage }


function OrdersPage() {
    return (
    <Page>
        <AdminSearchLoader 
        render={({searchQuery, searchParams, selectEdit, orders}) => (
        <>
            <QueryParamFields queryParams={searchParams} />
            <AdminSearchTitle adminSearchParams ={searchParams} />
            <SelectEditDisplay
            selectEdit={selectEdit}
            elements={listToRecord(orders, (o) => [o.id, 
                <OrderRow order={o} key={o.id} />
            ])}/>
            <ChevronDownIcon 
            onClick={searchQuery.fetchNextPage} 
            hidden={!searchQuery.hasNextPage} 
            />
        </>
        )} />
    </Page>
    )
}
