import { 
    MoneyFormat, 
    Text 
} from '@/shared'

import type { 
    UserAnalytics ,
    User
} from '../schema'


export { 
    UserInfo,
    AdminSummaryInfo,
    AnalyticsInfo 
}


function UserInfo({ user }: {
    user: User
}) {
    return (
    <>
        <Text>Name: {user.name}</Text>
        <Text>Email: {user.email}</Text>
    </>
    )
}

function AdminSummaryInfo({ user }: {
    user: UserAnalytics
}) {
    return (
    <div className="grid w-full gap-2 sm:grid-cols-3 sm:items-center">
        <div>
            <Text className="font-semibold text-gray-900">{user.name}</Text>
            <Text className="text-sm text-gray-600">{user.email}</Text>
        </div>
        <Text className="text-sm text-gray-600">
            {user.isRegistered ? 'Registered' : 'Guest'} · {user.orderCount} orders
        </Text>
        <Text className="text-sm text-gray-600 sm:text-right">
            <MoneyFormat amount={user.spent} /> · {user.reviewCount} reviews
        </Text>
    </div>
    )
}

function AnalyticsInfo({ user }: {
    user: UserAnalytics
}) {
    return (
    <div className="space-y-4 text-gray-900">
        <div className="grid gap-2 rounded-lg bg-gray-50 p-4 sm:grid-cols-2">
            <Text>ID: {user.id}</Text>
            <Text>Name: {user.name}</Text>
            <Text>Email: {user.email}</Text>
            <Text>
                Registration: {user.isRegistered ? 'Registered' : 'Guest'}
            </Text>
            <Text>Created at: {user.createdAt}</Text>
            <Text>Deleted at: {user.deletedAt || "No"}</Text>
            <Text>Order Count: {user.orderCount}</Text>
            <Text>Spent: <MoneyFormat amount={user.spent} /></Text>
            <Text>Revenue lost: <MoneyFormat amount={user.revenueLost} /></Text>
            <Text>Reviews: {user.reviewCount}</Text>
        </div>
    </div>
    )
}