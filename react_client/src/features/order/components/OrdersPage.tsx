import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

import { formatMoney } from '@/utils/formatMoney'
import {
    PopUpModalComponent
} from '@/shared/PopUpModalComponent';
import {
    SelectOneFilterField,
    SelectMultipleFilterField,
    TextFilterField,
    QueryParamsContainer
} from '@/shared/QueryParamsComponent';
import {
    SelectEditComponent,
    SelectOneEditField,
} from '@/shared/SelectEditComponent';
import {
    selectOneField,
    useSelectEdit,
} from '@/utils/useSelectEdit';

import { PageRoutes } from '@/PageRoutes';

import { 
    ProductMediaCarouselComponent,
    type ItemResolution,
} from '../index'


import type {
    AdminSearchParams,
    OrderSummary,
    Status
} from '../schema';
import {
    status
} from '../schema';
import { 
    useAdminSearchParams,
    useAdminSearchQuery,
    useGetByIdQuery,
    usePatchStatusMutation,
    usePatchAllStatusMutation,
} from '../service';

function OrdersPage () {
// search and filter orders, view and edit order details
    const { mutate: patchOrderBulk } = usePatchAllStatusMutation()

    const {
        sortBy, status, searchName, getParams
    } = useAdminSearchParams()
    
    const limit = 20

    const {data, fetchNextPage, hasNextPage } = 
        useAdminSearchQuery(
            limit,
            getParams() as AdminSearchParams
        )
    const orders = data?.pages.flatMap(page => page.orders) ?? []

    const editFields = {
        status: selectOneField<Status>({
            label: 'Selected status',
            options: status,
        }),
    }

    const selectEdit = useSelectEdit({
        ids: new Set(orders.map(order => String(order.id))),
        FieldFactories: editFields,
        handleSubmit: (selectedIds, fieldValues) => {
            if (fieldValues.status === null) return

            patchOrderBulk({
                orderIds: Array.from(selectedIds).map(Number),
                status: fieldValues.status,
            })
        },
    })

    const itemComponents = Object.fromEntries(
        orders.map(order => [
            String(order.id),
            <OrderCard key={order.id} order={order} />,
        ])
    )

    const title = searchName.get() 
        ? `Searching: ${searchName.get()}` 
        : status.get().join(', ') || "All Orders"

    return (
        <div>

            <QueryParamsContainer> 
                <TextFilterField accessor={searchName}/>
                <SelectMultipleFilterField accessor={status}/>
                <SelectOneFilterField accessor={sortBy}/>
            </QueryParamsContainer>

            <h1 className="mb-2 text-lg font-semibold">{title}</h1> 
            <SelectEditComponent
                fieldComponents={
                    <SelectOneEditField field={selectEdit.status} />
                }
                itemComponents={itemComponents}
                useSelectEdit={selectEdit}
            />
            { hasNextPage ? 
                <ChevronDownIcon 
                aria-label="ChevronDownIcon"
                className="h-24 w-24" 
                onClick={() => fetchNextPage()} />
            : null}
        </div>

    )
}

function OrderCard ({
    order,
}: {
    order: OrderSummary
}) {
// view order summary
// On click, open modal with order details and edit options

    return (
        <div>
            <PopUpModalComponent
                content={() => <OrderModal orderId={order.id} />}
            >
                <div className="rounded border p-3 shadow-sm">
                    <div>Order #{order.id}</div>
                    <div>Status: {order.status}</div>
                    <div>
                        Total: ${(order.totalCent / 100).toFixed(2)}
                    </div>
                </div>
            </PopUpModalComponent>
        </div>
    );
}

function OrderModal ({ 
    orderId 
}: { 
    orderId: number
}) {
// view and edit order details

    const { mutate: patchOrderStatus, isPending } = usePatchStatusMutation(orderId)
   
    const {
        data, isLoading, isError,
    } = useGetByIdQuery(orderId)

    if (isLoading) return <div>Loading...</div>
    if (isError || !data) return <div>Error loading order details</div>

    const { order, user } = data

    return (
        <div>
            <h2 className="mb-3 text-lg font-semibold">Order Details</h2>
            <div className="space-y-1 text-sm">
                <div>Total: ${ (order.costAudCent / 100).toFixed(2) }</div>
                <div>Num Items: {order.itemResolutions.length}</div>
                <div>Address: {order.addressString}</div>

            </div>
            <div className="space-y-1 text-sm">
                <div>User ID: {order.userId}</div>
                <div>User Name: {user.name}</div>
                <div>User Email: {user.email}</div>
                <div>Is Registered: {user.isRegistered ? 'Yes' : 'No'}</div>
            </div>

            <select
                aria-label="Order status"
                className="mt-4 rounded border px-3 py-2"
                value={order.status}
                onChange={event => patchOrderStatus({
                    status: event.target.value as Status,
                })}
                disabled={isPending}
            >
                {Object.entries(status).map(([label, value]) => (
                    <option key={label} value={label}>
                        {value}
                    </option>
                ))}
            </select>

            <h3>Items</h3>
            {order.itemResolutions.map(o => 
                <OrderItemCard key={o.productSummary.name} itemResolution={o} />
            )}
        </div>
    );
}

function OrderItemCard(
    { itemResolution }: 
    { itemResolution: ItemResolution }
) {
    const navigate = useNavigate()
    const productSummary = itemResolution.productSummary
    return (
        <div 
        className="rounded border border-slate-200 bg-white p-3 shadow-sm"
        >
            
            <button
            onClick={() => {navigate(`${PageRoutes.product}/${productSummary.slug}`)}}
            >
                <ProductMediaCarouselComponent productId={productSummary.id} limit={1} />
                <h2 className="mt-2 font-semibold">{productSummary.name}</h2>
            </button>
            
            <div className={itemResolution.onSale ? "bg-red-200" : ""} >
                <p>{formatMoney(itemResolution.unitPriceCent)} each </p>
                <p>{itemResolution.quantity}x </p>
                <p>{formatMoney(itemResolution.lineTotalCent)} total </p>
            </div>

        </div>
    )
}

export {
    OrdersPage
}
