import { expect } from '@playwright/test'

import { PageRoutes } from '@/app/PageRoutes'

import {
    login,
    sampleAdminData,
    test,
} from './fixtures'


test.describe('admin', () => {
    test.use({
        storageState: {
            cookies: [],
            origins: [],
        },
    })

    test('redirects guests away from admin pages', async ({ page }) => {
        await page.goto(PageRoutes.adminDashboard)

        await expect(page).toHaveURL(
            new RegExp(`${PageRoutes.catalogue}$`)
        )
    })

    test('renders the admin dashboard', async ({ page }) => {
        await login(page, sampleAdminData)
        await page.goto(PageRoutes.adminDashboard)

        await expect(
            page.getByRole('heading', { name: 'Admin Dashboard' })
        ).toBeVisible()
        await expect(
            page.getByRole('heading', { name: 'Performance' })
        ).toBeVisible()
        await expect(
            page.getByRole('heading', { name: 'Revenue / Orders' })
        ).toBeVisible()
        await expect(
            page.getByRole('heading', { name: 'Requires Attention' })
        ).toBeVisible()
        await expect(
            page.getByRole('heading', { name: 'Recent Orders' })
        ).toBeVisible()
        await expect(
            page.getByRole('heading', { name: 'Top Products' })
        ).toBeVisible()
    })

    test('navigates between admin sections', async ({ page }) => {
        await login(page, sampleAdminData)
        await page.goto(PageRoutes.adminDashboard)

        const sections = [
            { name: 'Orders', path: PageRoutes.adminOrders },
            { name: 'Products', path: PageRoutes.adminProducts },
            { name: 'Sales', path: PageRoutes.adminSales },
            { name: 'Users', path: PageRoutes.adminUsers },
        ]

        for (const section of sections) {
            await page.getByRole('button', {
                name: section.name,
                exact: true,
            }).click()
            await expect(page).toHaveURL(
                new RegExp(`${section.path}$`)
            )
        }
    })

    test('searches admin products', async ({ page }) => {
        await login(page, sampleAdminData)
        await page.goto(PageRoutes.adminProducts)

        const search = page.getByPlaceholder('Search products...')
        await search.fill('product-that-does-not-exist')
        await search.press('Enter')

        await expect(
            page.getByRole('heading', {
                name: 'Searching: product-that-does-not-exist',
            })
        ).toBeVisible()
    })

    test('opens the create product form', async ({ page }) => {
        await login(page, sampleAdminData)
        await page.goto(PageRoutes.adminProducts)

        await page.getByRole('button', {
            name: 'Create product',
        }).click()

        const dialog = page.getByRole('dialog')
        await expect(
            dialog.getByRole('heading', { name: 'Create Product' })
        ).toBeVisible()
        await expect(dialog.getByLabel('Name')).toBeVisible()
        await expect(dialog.getByLabel('Category')).toBeVisible()
        await expect(dialog.getByLabel('Rarity')).toBeVisible()
        await expect(
            dialog.getByRole('button', { name: 'Create product' })
        ).toBeVisible()
    })

    test('opens the create sale form', async ({ page }) => {
        await login(page, sampleAdminData)
        await page.goto(PageRoutes.adminSales)

        await page.getByRole('button', {
            name: 'Create sale',
        }).click()

        const dialog = page.getByRole('dialog')
        await expect(
            dialog.getByRole('heading', { name: 'Create Sale' })
        ).toBeVisible()
        await expect(dialog.getByLabel('Name')).toBeVisible()
        await expect(dialog.getByLabel('Slug')).toBeVisible()
        await expect(dialog.getByLabel('Start date')).toBeVisible()
        await expect(dialog.getByLabel('End date')).toBeVisible()
    })

    test('searches admin users', async ({ page }) => {
        await login(page, sampleAdminData)
        await page.goto(PageRoutes.adminUsers)

        const search = page.getByPlaceholder('Search')
        await search.fill('user-that-does-not-exist')
        await search.press('Enter')

        await expect(
            page.getByRole('heading', {
                name: 'Searching: user-that-does-not-exist',
            })
        ).toBeVisible()
    })
})
