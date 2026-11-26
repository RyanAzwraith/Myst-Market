import { expect } from '@playwright/test'

import { PageRoutes } from '@/app/PageRoutes'

import { test } from './fixtures'

test.describe('checkout', () => {
    test.use({
        storageState: {
            cookies: [],
            origins: [],
        },
    })

    test('displays the guest checkout form', async ({ page }) => {
        await page.goto(PageRoutes.checkout)

        await expect(
            page.getByRole('heading', { name: 'Checkout' })
        ).toBeVisible()
        await expect(
            page.getByRole('heading', { name: 'Account Information' })
        ).toBeVisible()
        await expect(
            page.getByRole('heading', { name: 'Cart' })
        ).toBeVisible()
        await expect(
            page.getByRole('heading', { name: 'Delivery Information' })
        ).toBeVisible()
        await expect(
            page.getByRole('textbox', { name: 'Name' })
        ).toBeVisible()
        await expect(
            page.getByRole('textbox', { name: 'Email' })
        ).toBeVisible()
        await expect(
            page.getByRole('checkbox', {
                name: 'Would you like to create an account?',
            })
        ).toBeChecked()
        await expect(
            page.getByRole('button', { name: 'Pay with Stripe' })
        ).toBeVisible()
    })

    test('validates required account information', async ({ page }) => {
        await page.goto(PageRoutes.checkout)

        await page.getByRole('button', {
            name: 'Pay with Stripe',
        }).click()

        await expect(page.getByText('Name Required')).toBeVisible()
        await expect(page).toHaveURL(PageRoutes.checkout)
    })

    test('validates required delivery information', async ({ page }) => {
        await page.goto(PageRoutes.checkout)

        await page.getByRole('textbox', { name: 'Name' })
            .fill('Guest Customer')
        await page.getByRole('textbox', { name: 'Email' })
            .fill('guest@mail.com')
        await page.getByRole('button', {
            name: 'Pay with Stripe',
        }).click()

        await expect(page.getByText('Country Code Required')).toBeVisible()
        await expect(page).toHaveURL(PageRoutes.checkout)
    })

    test('allows the guest to change account creation preference', async ({
        page,
    }) => {
        await page.goto(PageRoutes.checkout)

        const createAccount = page.getByRole('checkbox', {
            name: 'Would you like to create an account?',
        })
        await expect(createAccount).toBeChecked()

        await createAccount.uncheck()

        await expect(createAccount).not.toBeChecked()
    })

    test('carries a shop item into checkout', async ({ page }) => {
        await page.goto(PageRoutes.shop)

        const product = page.locator('main article').first()
        const productName = product.getByRole('heading', {
            level: 2,
        })
        const name = await productName.textContent()

        await product.getByRole('button', {
            name: 'Add to Cart',
        }).click()
        await page.goto(PageRoutes.checkout)

        await expect(
            page.getByRole('heading', { name: name ?? '' })
        ).toBeVisible()
        await expect(
            page.getByText('Total').first()
        ).toBeVisible()
    })
})
