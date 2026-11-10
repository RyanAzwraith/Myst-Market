import { expect } from '@playwright/test'

import { PageRoutes } from '@/app/PageRoutes'

import { test } from './fixtures'

test.describe('catalogue', () => {
    test('displays the catalogue sections and statistics', async ({ page }) => {
        await page.goto(PageRoutes.catalogue)

        await expect(
            page.getByRole('heading', { name: 'Catalogue' })
        ).toBeVisible()
        await expect(
            page.getByText('Wow Such Wow About Us Wow')
        ).toBeVisible()

        const stats = page.locator('section').filter({
            has: page.getByText('Items discovered'),
        })
        await expect(stats).toBeVisible()
        await expect(stats.locator('article')).toHaveCount(3)
        await expect(stats.getByText('Adventurers served')).toBeVisible()
        await expect(stats.getByText('Average rating')).toBeVisible()

        for (const sectionName of [
            'Featured Products',
            'Popular Products',
            'Newest Products',
            'Biggest Sales',
            'Testimonials',
        ]) {
            await expect(
                page.getByRole('heading', { name: sectionName })
            ).toBeVisible()
        }
    })

    test('displays seeded products in the product carousels', async ({
        page,
    }) => {
        await page.goto(PageRoutes.catalogue)

        for (const sectionName of [
            'Featured Products',
            'Popular Products',
            'Newest Products',
        ]) {
            const section = page.locator('section').filter({
                has: page.getByRole('heading', { name: sectionName }),
            })

            await expect(section.locator('article')).toHaveCount(3)
            await expect(
                section.getByRole('button', { name: 'Previous items' })
            ).toBeVisible()
            await expect(
                section.getByRole('button', { name: 'Next items' })
            ).toBeVisible()
            await expect(
                section.getByRole('button', { name: 'Add to Cart' }).first()
            ).toBeVisible()
        }
    })

    test('moves through the featured product carousel', async ({ page }) => {
        await page.goto(PageRoutes.catalogue)

        const section = page.locator('section').filter({
            has: page.getByRole('heading', { name: 'Featured Products' }),
        })
        const firstProduct = section.getByRole('heading', {
            level: 2,
        }).nth(1)
        const initialName = await firstProduct.textContent()

        await section.getByRole('button', {
            name: 'Next items',
        }).click()

        await expect(firstProduct).not.toHaveText(initialName ?? '')
    })

    test('opens a product page from the featured products', async ({
        page,
    }) => {
        await page.goto(PageRoutes.catalogue)

        const section = page.locator('section').filter({
            has: page.getByRole('heading', { name: 'Featured Products' }),
        })
        const productName = section.getByRole('heading', {
            level: 2,
        }).nth(1)
        const name = await productName.textContent()

        await productName.click()

        await expect(page).toHaveURL(/\/product\/[^/]+$/)
        await expect(
            page.getByRole('heading', { name: name ?? '' })
        ).toBeVisible()
    })

    test('opens a sale page from the biggest sales section', async ({
        page,
    }) => {
        await page.goto(PageRoutes.catalogue)

        const section = page.locator('section').filter({
            has: page.getByRole('heading', { name: 'Biggest Sales' }),
        })
        const saleName = section.getByRole('heading', {
            level: 1,
        }).first()
        const name = await saleName.textContent()

        await saleName.click()

        await expect(page).toHaveURL(/\/sale\/[^/]+$/)
        await expect(
            page.getByRole('heading', { name: name ?? '' })
        ).toBeVisible()
    })

    test('displays seeded testimonials', async ({ page }) => {
        await page.goto(PageRoutes.catalogue)

        const section = page.locator('section').filter({
            has: page.getByRole('heading', { name: 'Testimonials' }),
        })

        await expect(section.locator('article')).toHaveCount(3)
        await expect(section.locator('.review-user-name').first())
            .toBeVisible()
        await expect(section.locator('.review-description').first())
            .toBeVisible()
    })
})
