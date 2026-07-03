
import { expect} from '@playwright/test';

import { AppRoutes } from '@/AppRoutes';
import {test, login} from './fixtures'

test.beforeAll(async ({ api }) => {
  const res = await api.post('/test/reset-db')
  console.log("RES:", res.url(), res.statusText())
  expect(res.ok()).toBeTruthy()
})

test("register page", async ({page}) => {
  //resend supposed to fail
  const registerData  = {
    name: 'aaron',
    email: 'aaron@mail.com',
    password: 'password'
  }
  await page.goto(AppRoutes.register)
  await expect(page.getByText('Register')).toBeVisible()
  await page.getByPlaceholder('Name').fill(registerData.name)
  await page.getByPlaceholder('Email').fill(registerData.email)

  const registerPromise = page.waitForResponse(
    res => res.url().includes('/register') && res.request().method() === 'POST'
  )
  await page.getByRole('button', { name: 'Send set password email' }).click()
  const registerRes = await registerPromise
  expect(registerRes.status()).toBe(500)
  await expect(page.getByText('Resend not working')).toBeVisible()
}) 

test("set password page", async (
  {page, createUser, getSetPasswordToken}
) => {
  const token = await getSetPasswordToken(createUser.email)
  await page.goto(`${AppRoutes.setPassword}?token=${token}`)
  await expect(page.getByText('Set Password')).toBeVisible()
  
  await page.getByPlaceholder('Password').fill(createUser.password)
  await page.getByPlaceholder('Re-enter').fill(createUser.password)
  await page.getByRole('button', { name: 'Submit' }).click()
  
  await expect(page).toHaveURL(AppRoutes.profile)
})

test("Login Profile Button", async ({page, createUser}) => {
  await page.goto(AppRoutes.catalogue)
  await expect(page.getByText('Myst Market')).toBeVisible()
  await page.getByLabel("outLineIcon").click()

  await expect(page.getByText('Sign In')).toBeVisible()

  await page.getByPlaceholder('Email').fill(createUser.email)
  await page.getByPlaceholder('Password').fill(createUser.password)

  await page.getByRole("button", {name:"Login"}).click()
  await expect(page).toHaveURL(AppRoutes.catalogue)
})

test("Login Page", async ({page, createUser}) => {
  await page.goto(AppRoutes.login)
  await expect(page.getByText('Sign in')).toBeVisible()

  await page.getByPlaceholder('Email').fill(createUser.email)
  await page.getByPlaceholder('Password').fill(createUser.password)

  await page.getByRole("button", {name:"Login"}).click()
  await expect(page).toHaveURL(AppRoutes.profile)
})

test.describe("update page", () => {
  test.beforeEach(async ({page, createUser}) => {
    await login(page, createUser)
    await page.getByLabel("solidIcon").click()
    await expect(page.getByText("Profile").first()).toBeVisible()
  })

  test("update profile", async ({page}) => {
    const sampleUpdateData = {
      name: "darren",
      email: "darren@mail.com"
    }
    await page.getByRole("button", {name:"Update"}).click()
    await expect(page.getByRole("button", {name:"Save"})).toBeVisible()
    await page.getByPlaceholder("Name").fill(sampleUpdateData.name)
    await page.getByPlaceholder("Email").fill(sampleUpdateData.email)
    await page.getByRole("button", {name: "Save"}).click()
    await expect(page.getByPlaceholder("Name"))
      .toHaveValue(sampleUpdateData.name)
    await expect(page.getByPlaceholder("Email"))
      .toHaveValue(sampleUpdateData.email)
    await expect(page.getByRole("button", {name: "Update"})).toBeVisible()
  })

  test("logout", async ({page}) => {
    await page.getByRole("button", {name: "Logout"}).click()
    await expect(page).toHaveURL(AppRoutes.login)
  })

  test("delete profile", async ({page}) => {
    await page.getByRole("button", {name: "Delete Profile"}).click()
    await expect(page.getByText("Are you sure you'd like to delete your Profile?"))
      .toBeVisible()
    await page.getByRole("button", {name: "Yes"}).click()
    await expect(page).toHaveURL(AppRoutes.login)

  })

})
