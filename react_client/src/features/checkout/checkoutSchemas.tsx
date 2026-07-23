import type { CartItem} from '@/features/cart/cartSchemas'

type Item = CartItem

type UserSummary = {
	email: string;
	name: string;
}

type ProductSummary = {
    id: number
    name: string
    slug: string
}

type AddressDetail = {
    countryCode: string
    postcode: string
    state: string
    city: string
    street: string
}

type ItemSummary = {
    productId: number
    quantity: number
}

const ItemSummary = {
    from : {
        Item: (t: Item) => ({
            productId: t.product.id,
            quantity: t.quantity,
        }),    
        ItemResolution: (t: ItemResolution) => ({
            productId: t.productSummary.id,
            quantity: t.quantity,
        }),
    }
}

type ItemResolution = {
    productSummary: ProductSummary
    quantity: number
    unitPriceCent: number
    lineTotalCent: number
    onSale: boolean
    warning?: string
}

type StatusType = typeof Status [keyof typeof Status ]

const Status  = {
    Pending: 1,
    Processing: 2,
    Shipped: 3,
    Delivered: 4,
    Cancelled: 5,
    Error: 6
} as const 


type OrderDetail = {
    addressString: string
    itemResolutions: ItemResolution[]
    costAudCent: number
    createdAt: Date
}

type OrderSummary = {
    orderId: number
    createdAt: Date
    totalCent: number
    status: StatusType
}

// Routes
type ResolveItemsRequest = {
    itemSummaries: ItemSummary[]
}
type ResolveItemsResponse = {
    itemResolutions: ItemResolution[]
    totalCent: number
}

type CheckoutUserRequest = {
    itemSummaries: ItemSummary[]
    addressDetail: AddressDetail
    deliveryNote: string
}

type CheckoutGuestRequest = {
    itemSummaries: ItemSummary[]
    addressDetail: AddressDetail
    deliveryNote: string
    userSummary: UserSummary
}

type CheckoutResponse = {
    stripeSessionUrl: string
}

type GetOrderResponse = {
    orderDetail: OrderDetail
}

type GetUserOrdersResponse = {
    orderSummaries: OrderSummary[]
}

// ROUTES
// POST /cart-resolution
// POST /checkout/guest
// POST /checkout/user
// GET /user/order/order_id
// GET /user/orders

export type {
    UserSummary,
    ProductSummary,
    AddressDetail,
    ItemResolution,
    OrderDetail,
    OrderSummary,
    ResolveItemsRequest,
    ResolveItemsResponse,   
    CheckoutUserRequest,        
    CheckoutGuestRequest,
    CheckoutResponse,
    GetOrderResponse,
    GetUserOrdersResponse,
} 

export {
    ItemSummary,
    Status
}