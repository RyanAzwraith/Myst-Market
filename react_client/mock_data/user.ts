

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
    userListFactory,
    userList,
    userDetailFactory,
    userDetail,
    userDetailListFactory,
    userDetailList,
    userAnalyticsFactory,
    userAnalytics,
    userAnalyticsListFactory,
    userAnalyticsList,
}

faker.seed(12345)

const userFactory = (
    overrides: Partial<User> = {} 
): User => ({ ...{
    id: 1,
    email: faker.internet.email(),
    name: faker.person.fullName(),
    isAdmin: false,
}, ...overrides
})

const user: User = userFactory()
const adminUser: User = userFactory({ 
    email: "admin@mail.com",
    isAdmin: true 
})

const userListFactory = (
    length: number = 25
): User[] =>
    Array.from(
        { length },
        () => userFactory(),
    )

const userList: User[] = userListFactory()


const userDetailFactory = (
    overrides: Partial<UserDetail> = {},
): UserDetail => ({ ...{
    ...userFactory(),
    isRegistered: true,
}, ...overrides })

const userDetail = userDetailFactory()

const userDetailListFactory = (
    length: number = 25
): UserDetail[] =>
    Array.from(
        { length },
        () => userDetailFactory(),
    )

const userDetailList: UserDetail[] = userDetailListFactory()

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

const userAnalytics: UserAnalytics = userAnalyticsFactory()

const userAnalyticsListFactory = (
    length: number = 25
): UserAnalytics[] =>
    Array.from(
        { length },
        () => userAnalyticsFactory(),
    )


const userAnalyticsList: UserAnalytics[] = userAnalyticsListFactory()









