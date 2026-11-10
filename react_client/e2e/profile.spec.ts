import { expect } from '@playwright/test'

import { PageRoutes } from '@/app/PageRoutes'

import { login, test } from './fixtures'

test.describe('profile and orders', () => {
    test.use({
        storageState: {
            cookies: [],
            origins: [],
        },
    })

    test('displays the authenticated profile', async ({
        page,
        createUser,
    }) => {
        await login(page, createUser)
        await page.getByRole('button', {
            name: 'UserCircleSolidIcon',
        }).click()

        await expect(page).toHaveURL(PageRoutes.profile)
        await expect(
            page.getByRole('heading', { name: 'Profile' })
        ).toBeVisible()
        await expect(
            page.getByRole('textbox', { name: 'Name' })
        ).toHaveValue(createUser.name)
        await expect(
            page.getByRole('textbox', { name: 'Email' })
        ).toHaveValue(createUser.email)
        await expect(
            page.getByRole('button', { name: 'Set password with email' })
        ).toBeVisible()
        await expect(
            page.getByRole('heading', { name: 'Orders' })
        ).toBeVisible()
        await expect(
            page.getByRole('heading', { name: 'Reviews' })
        ).toBeVisible()
    })

    test('updates profile details', async ({ page, createUser }) => {
        await login(page, createUser)
        await page.getByRole('button', {
            name: 'UserCircleSolidIcon',
        }).click()

        const updatedName = 'Updated Joe'
        const updatedEmail = 'updated-joe@mail.com'
        await page.getByRole('textbox', { name: 'Name' })
            .fill(updatedName)
        await page.getByRole('textbox', { name: 'Email' })
            .fill(updatedEmail)
        await page.getByRole('button', { name: 'Save' }).click()

        await expect(
            page.getByRole('textbox', { name: 'Name' })
        ).toHaveValue(updatedName)
        await expect(
            page.getByRole('textbox', { name: 'Email' })
        ).toHaveValue(updatedEmail)
    })

    test('resets unsaved profile changes', async ({ page, createUser }) => {
        await login(page, createUser)
        await page.getByRole('button', {
            name: 'UserCircleSolidIcon',
        }).click()

        await page.getByRole('textbox', { name: 'Name' })
            .fill('Unsaved Name')
        await page.getByRole('textbox', { name: 'Email' })
            .fill('unsaved@mail.com')
        await page.getByRole('button', { name: 'Reset' }).click()

        await expect(
            page.getByRole('textbox', { name: 'Name' })
        ).toHaveValue(createUser.name)
        await expect(
            page.getByRole('textbox', { name: 'Email' })
        ).toHaveValue(createUser.email)
    })

    test('opens and cancels profile deletion confirmation', async ({
        page,
        createUser,
    }) => {
        await login(page, createUser)
        await page.getByRole('button', {
            name: 'UserCircleSolidIcon',
        }).click()

        await page.getByRole('button', {
            name: 'Delete Profile',
        }).click()

        const dialog = page.getByRole('dialog', { name: 'Modal' })
        await expect(dialog).toBeVisible()
        await expect(
            dialog.getByRole('heading', {
                name: "Are you sure you'd like to delete your Profile?",
            })
        ).toBeVisible()

        await dialog.getByRole('button', { name: 'Cancel' }).click()
        await expect(dialog).toBeHidden()
        await expect(
            page.getByRole('heading', { name: 'Profile' })
        ).toBeVisible()
    })

    test('logs out from the profile', async ({ page, createUser }) => {
        await login(page, createUser)
        await page.getByRole('button', {
            name: 'UserCircleSolidIcon',
        }).click()

        await page.getByRole('button', { name: 'Logout' }).click()

        await expect(page).toHaveURL(PageRoutes.login)
        await expect(
            page.getByRole('heading', { name: 'Sign in' })
        ).toBeVisible()
    })
})
