

import { faker } from "@faker-js/faker"

import type {
    User,
    UserAnalytics,
    UserDetail,
} from "@/features/user/schema"

export {
    userFactory,
    user,
    adminUser,
    users,
    userDetailFactory,
    userDetail,
    userAnalyticsFactory,
    userAnalytic,
    userAnalytics
}

faker.seed(12345)

const userFactory = (
    overrides: Partial<User> = {} 
): User => ({ ...{
    id: 1,
    email: faker.internet.email(),
    name: faker.person.fullName(),
    isAdmin: false,
}, ...overrides})

const user: User = userFactory()
const adminUser: User = userFactory({ 
    isAdmin: true 
})

const users: User[] = Array.from(
    { length: 25 },
    () => userFactory(),
)


const userDetailFactory = (
    overrides: Partial<UserDetail> = {},
): UserDetail => ({ ...{
    ...userFactory(),
    isRegistered: true,
}, ...overrides })

const userDetail: UserDetail = userDetailFactory()


const userAnalyticsFactory = (
    overrides: Partial<UserAnalytics> = {},
): UserAnalytics => ({ ...{
    ...userDetailFactory(),
    createdAt: faker.date.past().toISOString().slice(0, 10),
    deletedAt: null,
    orderCount: faker.number.int({ min: 0, max: 20 }),
    spent: faker.number.int({ min: 0, max: 50000 }),
    revenueLost: faker.number.int({ min: 0, max: 5000 }),
    reviewCount: faker.number.int({ min: 0, max: 10 }),
}, ...overrides })

const userAnalytic: UserAnalytics = userAnalyticsFactory()

const userAnalytics: UserAnalytics[] = users.map(user => 
    userAnalyticsFactory({ ...user })
)






