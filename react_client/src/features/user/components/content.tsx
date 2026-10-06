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
    <>
        <Text>{user.name}</Text>
        <Text>{user.email}</Text>
        <Text>{user.isRegistered ? 'Registered' : 'Guest'}</Text>
        <Text>Orders: {user.orderCount}</Text>
        <Text>Spent: <MoneyFormat amount={user.spent} /></Text>
        <Text>Reviews: {user.reviewCount}</Text>
    </>
    )
}

function AnalyticsInfo({ user }: {
    user: UserAnalytics
}) {
    return (
    <>
        <Text>ID: {user.id}</Text>
        <Text>Name: {user.name}</Text>
        <Text>Email: {user.email}</Text>
        <Text>Registration: {user.isRegistered ? 'Registered' : 'Guest'}</Text>
        <Text>Created at: {user.createdAt}</Text>
        <Text>Deleted at: {user.deletedAt || "No"}</Text>
        <Text>Order Count: {user.orderCount}</Text>
        <Text>Spent: <MoneyFormat amount={user.spent} /></Text>
        <Text>Revenue lost: <MoneyFormat amount={user.revenueLost} /></Text>
        <Text>Reviews: {user.reviewCount}</Text>
    </>
    )
}