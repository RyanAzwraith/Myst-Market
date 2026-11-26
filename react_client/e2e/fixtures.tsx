import {
    test as base, expect, request, type Page, type APIRequestContext
} from '@playwright/test'

import { serverRoutes } from '@/implementations/server/http/serverRoutes'
import { PageRoutes } from '@/app/PageRoutes'

const sampleUserData = {
    name: 'joe',
    email: 'joe@mail.com',
    password: 'password'
}

const sampleAdminData = {
    name: 'Admin User',
    email: 'admin@mail.com',
    password: '123'
}

type TestUserData = typeof sampleUserData

type Fixtures = {
    api: APIRequestContext
    createUser: TestUserData
    getSetPasswordToken: (email: string) => Promise<string>
}

const test = base.extend<Fixtures>({
    api: async ({}, use) => {
        const api = await request.newContext({
            baseURL: process.env.VITE_SERVER_URL,
        })
        try {
            await use(api)
        } finally {
            await api.dispose()
        }
    },
    createUser: async ({api}, use) => {
        const res = await api.post(serverRoutes.test.createUser, {
            data: sampleUserData
        })
        expect(res.ok()).toBeTruthy()
        await use(sampleUserData)
    },
    getSetPasswordToken: async ({api}, use) => {
        await use(async (email) => {
            const res = await api.post(serverRoutes.test.setPasswordToken, {
                data: { email }
            })
            expect(res.ok()).toBeTruthy()
            const { setPasswordToken } = await res.json()
            return setPasswordToken
        })
    },
})

async function resetDatabase(api: APIRequestContext) {
    const response = await api.post(serverRoutes.test.resetDb, {
        timeout: 120000,
    })
    expect(response.ok()).toBeTruthy()
}

async function login (
    page: Page, user: TestUserData
) {
    await page.goto(PageRoutes.catalogue)
    const outlineIcon = page.getByLabel("UserCircleOutlineIcon")
    await outlineIcon.click()

    await page.getByPlaceholder('Email').fill(user.email)
    await page.getByPlaceholder('Password').fill(user.password)
    await page.getByRole("button", { name: "Login" }).click()
    await expect(
        page.getByRole("button", { name: "UserCircleSolidIcon" })
    ).toBeVisible()
}

async function addToCart (
  page: Page
) {
    await page.goto(PageRoutes.shop)
    await page.getByRole('button', { name: 'Add to Cart' }).click()
    await page.getByLabel("plusicon").click()
    await page.getByPlaceholder('quantity').fill('3')
}

test.beforeEach(async ({ api, context }) => {
    await resetDatabase(api)
    await context.clearCookies()
})

export {
    test,
    login,
    addToCart,
    resetDatabase,
    sampleAdminData,
    sampleUserData,
}