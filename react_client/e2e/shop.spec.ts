import { expect } from '@playwright/test'

import { PageRoutes } from '@/app/PageRoutes'

import { test } from './fixtures'

test.describe('shop', () => {
    test('displays products and shop filters', async ({ page }) => {
        await page.goto(PageRoutes.shop)

        await expect(
            page.getByRole('heading', { name: 'All Products' })
        ).toBeVisible()

        await expect(
            page.getByRole('checkbox', { name: 'Weapons' })
        ).toBeVisible()
        await expect(
            page.getByRole('checkbox', { name: 'Rare' })
        ).toBeVisible()
        await expect(
            page.getByRole('combobox', { name: 'sort By' })
        ).toBeVisible()
        await expect(page.locator('main article').first()).toBeVisible()
    })

    test('filters products by category', async ({ page }) => {
        await page.goto(PageRoutes.shop)

        await page.getByRole('checkbox', {
            name: 'Weapons',
        }).click()

        await expect(page).toHaveURL(
            `${PageRoutes.shop}?categories=weapons`
        )
        await expect(
            page.getByRole('heading', { name: 'weapons' })
        ).toBeVisible()
        await expect(page.locator('main article').first()).toBeVisible()
    })

    test('filters products by search text', async ({ page }) => {
        await page.goto(PageRoutes.shop)

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

    test('changes the product sort order', async ({ page }) => {
        await page.goto(PageRoutes.shop)

        await page.getByRole('combobox', {
            name: 'sort By',
        }).selectOption('price')

        await expect(page).toHaveURL(
            `${PageRoutes.shop}?sort=price`
        )
        await expect(
            page.getByRole('heading', { name: 'All Products' })
        ).toBeVisible()
    })

    test('loads more products from the shop', async ({ page }) => {
        await page.goto(PageRoutes.shop)

        const products = page.locator('main article')
        await expect(products.first()).toBeVisible()
        const initialCount = await products.count()
        expect(initialCount).toBeGreaterThan(0)
        await expect(
            page.getByRole('button', { name: 'Load more content' })
        ).toBeVisible()

        await page.getByRole('button', {
            name: 'Load more content',
        }).click()

        await expect.poll(() => products.count())
            .toBeGreaterThan(initialCount)
    })

    test('opens a product page from the shop', async ({ page }) => {
        await page.goto(PageRoutes.shop)

        const product = page.locator('main article').first()
        const productName = product.getByRole('heading', {
            level: 2,
        })
        const name = await productName.textContent()

        await productName.click()

        await expect(page).toHaveURL(/\/product\/[^/]+$/)
        await expect(
            page.getByRole('heading', { name: name ?? '' })
        ).toBeVisible()
    })
})
