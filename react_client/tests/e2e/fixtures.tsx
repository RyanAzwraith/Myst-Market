import { 
    test as base, expect, request, type Page, type APIRequestContext
} from '@playwright/test'

import { AppRoutes} from '@/AppRoutes'
const sampleUserData  = {
    name: 'joe',
    email: 'joe@mail.com',
    password: 'password'
}

type Fixtures = {
    api: APIRequestContext
    createUser: typeof sampleUserData
    getSetPasswordToken: (email:string) => Promise<string>
}

const test = base.extend<Fixtures>({
    api: async ({}, use) => {
        const api = await request.newContext({
            baseURL: process.env.VITE_SERVER_URL,
        })
        await use(api)
    },
    createUser: async ({api}, use) => {
        const res = await api.post("/test/create_user", {data: {
            name: sampleUserData.name,
            email: sampleUserData.email,
            password: sampleUserData.password
        }})
        expect(res.ok()).toBeTruthy()
        await use(sampleUserData)
    },
    getSetPasswordToken: async ({api}, use) => {
        await use(async (email) => {
            const res = await api.post("/test/set-password-token", {data: {email}})
            console.log(`RES: ${res.url()} ${res.status()} ${res.statusText()}`)
            expect(res.ok()).toBeTruthy()
            const {setPasswordToken} = await res.json()
            return(setPasswordToken)
        })
    }
})


async function login (
  page: Page, createUser: typeof sampleUserData
) {
  await page.goto(AppRoutes.catalogue)
  await expect(page.getByText('Myst Market')).toBeVisible()

  const outlineIcon = page.getByLabel("outLineIcon")
  if (await outlineIcon.count() === 0) return
  await outlineIcon.click()

  await expect(page.getByText("Sign In").first()).toBeVisible()
  await page.getByPlaceholder('Email').fill(createUser.email)
  await page.getByPlaceholder('Password').fill(createUser.password)
  await page.getByRole("button", {name:"Login"}).click()
  await expect(page.getByLabel("solidIcon")).toBeVisible()
}

export {test, login}