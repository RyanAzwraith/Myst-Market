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
    <div className="user-admin-summary-info">
        <div>
            <Text className="user-summary-name">{user.name}</Text>
            <Text className="user-summary-email">{user.email}</Text>
        </div>
        <Text className="user-summary-role">
            {user.isRegistered ? 'Registered' : 'Guest'} · {user.orderCount} orders
        </Text>
        <Text className="user-summary-status">
            <MoneyFormat amount={user.spent} /> · {user.reviewCount} reviews
        </Text>
    </div>
    )
}

function AnalyticsInfo({ user }: {
    user: UserAnalytics
}) {
    return (
    <div className="user-analytics-info">
        <div className="user-analytics-grid">
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