import { expect } from '@playwright/test'

import { PageRoutes } from '@/app/PageRoutes'

import { test } from './fixtures'

test.describe('application shell', () => {
    test('redirects the root URL to the catalogue', async ({ page }) => {
        await page.goto('/')

        await expect(page).toHaveURL(PageRoutes.catalogue)
        await expect(
            page.getByRole('heading', { name: 'Catalogue' })
        ).toBeVisible()
        await expect(
            page.getByPlaceholder('Search products...')
        ).toBeVisible()
        await expect(
            page.getByRole('button', { name: 'Weapons', exact: true })
        ).toBeVisible()
        await expect(
            page.getByLabel('ShoppingCartOutlineIcon')
        ).toBeVisible()
        await expect(
            page.getByLabel('UserCircleOutlineIcon')
        ).toBeVisible()
    })

    test('opens and closes the guest profile menu', async ({ page }) => {
        await page.goto(PageRoutes.catalogue)

        await page.getByLabel('UserCircleOutlineIcon').click()

        const dialog = page.getByRole('dialog', { name: 'Sign in' })
        await expect(dialog).toBeVisible()
        await expect(
            dialog.getByRole('heading', { name: 'Sign in' })
        ).toBeVisible()
        await expect(
            dialog.getByRole('button', { name: 'Register' })
        ).toBeVisible()

        await dialog.getByRole('button', { name: 'Cancel' }).click()

        await expect(dialog).toBeHidden()
        await expect(
            page.getByLabel('UserCircleOutlineIcon')
        ).toBeVisible()
    })

    test('uses the app bar search to open filtered shop results', async ({
        page,
    }) => {
        await page.goto(PageRoutes.catalogue)

        const search = page.getByPlaceholder('Search products...')
        await search.fill('potion')
        await search.press('Enter')

        await expect(page).toHaveURL(
            `${PageRoutes.shop}?search=potion`
        )
        await expect(
            page.getByRole('heading', { name: 'Searching: potion' })
        ).toBeVisible()
    })

    test.describe('mobile application shell', () => {
        test.use({ viewport: { width: 390, height: 844 } })

        test('uses the category menu to open filtered shop results', async ({
            page,
        }) => {
            await page.goto(PageRoutes.catalogue)

            await page.getByRole('button', {
                name: 'Categories',
            }).click()

            const dialog = page.getByRole('dialog', {
                name: 'Product categories',
            })
            await expect(dialog).toBeVisible()
            await dialog.getByRole('button', {
                name: 'Weapons',
                exact: true,
            }).click()

            await expect(page).toHaveURL(
                `${PageRoutes.shop}?categories=weapons`
            )
            await expect(
                page.getByRole('heading', { name: 'weapons' })
            ).toBeVisible()
        })
    })

    test('opens the cart and navigates to checkout', async ({ page }) => {
        await page.goto(PageRoutes.shop)

        const addToCart = page.getByRole('button', {
            name: 'Add to Cart',
        }).first()
        await expect(addToCart).toBeVisible()
        await addToCart.click()

        const cartIcon = page.getByLabel('ShoppingCartSolidIcon')
        await expect(cartIcon).toBeVisible()
        await cartIcon.click()

        const dialog = page.getByRole('dialog')
        await expect(dialog.getByRole('heading', {
            name: 'Cart',
        })).toBeVisible()
        await expect(dialog.getByText('1x')).toBeVisible()

        await dialog.getByRole('button', { name: 'Checkout' }).click()

        await expect(page).toHaveURL(PageRoutes.checkout)
        await expect(
            page.getByRole('heading', { name: 'Checkout' })
        ).toBeVisible()
    })

    test('returns to the catalogue from the brand button', async ({
        page,
    }) => {
        await page.goto(PageRoutes.shop)

        await page.getByRole('button', { name: 'Myst Market' }).click()

        await expect(page).toHaveURL(PageRoutes.catalogue)
        await expect(
            page.getByRole('heading', { name: 'Catalogue' })
        ).toBeVisible()
    })
})
