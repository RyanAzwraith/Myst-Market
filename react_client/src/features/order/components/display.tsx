import { formatMoney } from '@/utils/formatMoney'
import { listToRecord } from '@/utils/funcs';
import { ChevronDownIcon, Display, List } from '@/shared';
import { SelectEditComponent, SelectOneEditField } from '@/shared/SelectEditComponent';

import {
    ItemCard,
} from '../index'

import type { AdminSearchParams } from '../schema';
import { 
    useGetByIdQuery,
    useAdminSearchParams,
    useAdminSearchQuery,
} from "../service"
import { AdminQueryParms } from './component';  
import { 
    OrderRow
} from './card';
import { useAdminSelectEdit } from '../service';

export {
    OrderDisplay,
    AdminSearchDisplay
}

function OrderDisplay({ orderId, onCardClick }: { 
    orderId?: number,
    onCardClick?: (item: any) => void
}) {
    const {data} = useGetByIdQuery(orderId)
    if (!data) return <div>Loading...</div>
    const order = data.order

    return (
        <Display >
            <h1>Order </h1>
            <h2>{order.addressString}</h2>
            <p>{order.createdAt}</p>
            <p>{formatMoney(order.costAudCent)}</p>
            
            <List
            items={order.items}
            renderItem={(item) =>
                <ItemCard 
                key={item.productSummary.name} 
                item={item} 
                onClick={onCardClick}
                />
            } />

        </Display>
    )
}

function AdminSearchDisplay({ limit }: { 
    limit: number 
}) {
    const {
        status, searchName, getParams
    } = useAdminSearchParams()
    
    const {data, fetchNextPage, hasNextPage } = useAdminSearchQuery(limit,
        getParams() as AdminSearchParams
    )
    const orders = data?.pages.flatMap(page => page.orders) ?? []

    const selectEdit = useAdminSelectEdit({orders})
    
    const title = searchName.get() 
        ? `Searching: ${searchName.get()}` 
        : status.get().join(', ') || "All Orders"

    return (
        <Display>
            <AdminQueryParms /> 

            <h1>{title}</h1> 
            <SelectEditComponent
            fieldComponents={
                <SelectOneEditField field={selectEdit.status} />
            }
            itemComponents={listToRecord(orders, (order) => [String(order.id), 
                <OrderRow key={order.id} order={order} />])
            }
            useSelectEdit={selectEdit}
            />
                <ChevronDownIcon 
                onClick={() => fetchNextPage()} 
                hidden={!hasNextPage} 
                />
        </Display>
    )
}