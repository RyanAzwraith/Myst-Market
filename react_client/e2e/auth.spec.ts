import { expect } from '@playwright/test'

import { PageRoutes } from '@/app/PageRoutes'

import {
    login,
    test,
} from './fixtures'

test.describe('authentication', () => {
    test.use({
        storageState: {
            cookies: [],
            origins: [],
        },
    })

    test('logs in through the sign-in page', async ({
        page,
        createUser,
    }) => {
        await page.goto(PageRoutes.login)

        await page.getByLabel('Email', { exact: true })
            .fill(createUser.email)
        await page.getByLabel('Password', { exact: true })
            .fill(createUser.password)
        await page.getByRole('button', { name: 'Login' }).click()

        await expect(page).toHaveURL(PageRoutes.profile)
        await expect(
            page.getByRole('heading', { name: 'Profile' })
        ).toBeVisible()
    })

    test('shows an error for invalid credentials', async ({
        page,
        createUser,
    }) => {
        await page.goto(PageRoutes.login)

        await page.getByLabel('Email', { exact: true })
            .fill(createUser.email)
        await page.getByLabel('Password', { exact: true })
            .fill('incorrect-password')
        await page.getByRole('button', { name: 'Login' }).click()

        await expect(
            page.getByText('Invalid email or password')
        ).toBeVisible()
        await expect(page).toHaveURL(PageRoutes.login)
    })

    test('validates required sign-in fields', async ({ page }) => {
        await page.goto(PageRoutes.login)

        await page.getByRole('button', { name: 'Login' }).click()

        await expect(page.getByText('Email required')).toBeVisible()
        await expect(page).toHaveURL(PageRoutes.login)
    })

    test('navigates between sign-in and registration', async ({ page }) => {
        await page.goto(PageRoutes.login)

        await page.getByRole('button', { name: 'Register' }).click()
        await expect(page).toHaveURL(PageRoutes.register)
        await expect(
            page.getByRole('heading', { name: 'Register' })
        ).toBeVisible()

        await page.getByRole('button', { name: 'Login' }).click()
        await expect(page).toHaveURL(PageRoutes.login)
        await expect(
            page.getByRole('heading', { name: 'Sign in' })
        ).toBeVisible()
    })

    test('validates required registration fields', async ({ page }) => {
        await page.goto(PageRoutes.register)

        await page.getByRole('button', {
            name: 'Send set password email',
        }).click()

        await expect(page.getByText('Name required')).toBeVisible()
        await expect(page).toHaveURL(PageRoutes.register)
    })

    test('redirects unauthenticated users from the profile page', async ({
        page,
    }) => {
        await page.goto(PageRoutes.profile)

        await expect(page).toHaveURL(PageRoutes.login)
        await expect(
            page.getByRole('heading', { name: 'Sign in' })
        ).toBeVisible()
    })

    test('logs out from the profile page', async ({
        page,
        createUser,
    }) => {
        await login(page, createUser)
        await page.getByRole("button", { name: "UserCircleSolidIcon" }).click()

        await expect(page).toHaveURL(PageRoutes.profile)
        await page.getByRole('button', { name: 'Logout' }).click()

        await expect(page).toHaveURL(PageRoutes.login)
        await expect(
            page.getByRole('heading', { name: 'Sign in' })
        ).toBeVisible()
    })

    test('preserves authentication after a page refresh', async ({
        page,
        createUser,
    }) => {
        await login(page, createUser)
        await page.getByRole("button", { name: "UserCircleSolidIcon" }).click()
        await expect(page).toHaveURL(PageRoutes.profile)

        await page.reload()

        await expect(page).toHaveURL(PageRoutes.profile)
        await expect(
            page.getByRole('heading', { name: 'Profile' })
        ).toBeVisible()
    })

    test('sets a password with a valid set-password token', async ({
        page,
        createUser,
        getSetPasswordToken,
    }) => {
        const token = await getSetPasswordToken(createUser.email)
        const setPasswordUrl = `${PageRoutes.setPassword}?token=${token}`

        await page.goto(setPasswordUrl)
        await page.getByLabel('Password', { exact: true })
            .fill('new-password')
        await page.getByLabel('Re-enter Password', { exact: true })
            .fill('new-password')
        await page.getByRole('button', {
            name: /submit|password email/i,
        }).click()

        await expect(page).toHaveURL(PageRoutes.profile)
        await expect(
            page.getByRole('heading', { name: 'Profile' })
        ).toBeVisible()
    })

    test('does not accept mismatched password confirmation', async ({
        page,
        createUser,
        getSetPasswordToken,
    }) => {
        const token = await getSetPasswordToken(createUser.email)
        const setPasswordUrl = `${PageRoutes.setPassword}?token=${token}`

        await page.goto(setPasswordUrl)
        await page.getByLabel('Password', { exact: true })
            .fill('new-password')
        await page.getByLabel('Re-enter Password', { exact: true })
            .fill('different-password')
        await page.getByRole('button', {
            name: /submit|password email/i,
        }).click()

        await expect(page).toHaveURL(setPasswordUrl)
        await expect(
            page.getByRole('heading', { name: 'Set Password' })
        ).toBeVisible()
    })
})
