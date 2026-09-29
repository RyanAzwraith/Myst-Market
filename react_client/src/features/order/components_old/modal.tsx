import { Loading } from "@/shared/elements/text"

import { ItemCard } from "../index"

import type { Status } from "../schema"
import { status } from "../schema"
import {
    useGetByIdQuery,
    usePatchStatusMutation,
} from "../service"
import { List, Modal } from "@/shared"


export {
    OrderModal
}


function OrderModal ({ orderId }: { 
    orderId: number
}) {
    const { mutate: patchOrderStatus, isPending } = usePatchStatusMutation(orderId)
   
    const { data } = useGetByIdQuery(orderId)
    if (!data) return <Loading />

    const { order, user } = data
    return (
        <Modal>
            <h2>Order Details</h2>
            <div>
                <div>Total: ${ (order.costAudCent / 100).toFixed(2) }</div>
                <div>Num Items: {order.items.length}</div>
                <div>Address: {order.addressString}</div>

            </div>
            <div>
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
            <List
            items={order.items}
            renderItem={item => 
                <ItemCard 
                key={item.productSummary.name} 
                item={item} />
            }
            />
        </Modal>
    );
}