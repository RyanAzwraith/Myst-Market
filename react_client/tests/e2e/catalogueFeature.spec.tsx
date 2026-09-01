import { expect } from '@playwright/test';

import { AppRoutes } from '@/PageRoutes';
import { test, sampleProduct } from './fixtures'

test.describe("Catalogue Page", () => {
    test("renders headings and stats", async ({ page }) => {
        await page.goto(AppRoutes.catalogue)
        await expect(page.getByText('Catalogue')).toBeVisible()
        await expect(page.getByText('Items discovered')).toBeVisible()
        await expect(page.getByText('Adventurers served')).toBeVisible()
        await expect(page.getByText('Featured Product')).toBeVisible()
        await expect(page.getByText('Popular Products')).toBeVisible()
        await expect(page.getByText('Newest Products')).toBeVisible()
        await expect(page.getByText('Biggest Sales')).toBeVisible()
    })

    test("featured product is visible and links to product page", async ({ page }) => {
        await page.goto(AppRoutes.catalogue)
        const featuredHeading = page.getByRole('heading', { name: 'Featured Product' })
        await expect(featuredHeading).toBeVisible()
        const newestSection = featuredHeading.locator('xpath=..')
        await expect(newestSection.getByText(sampleProduct.name)).toBeVisible()
        await newestSection.getByText(sampleProduct.name).click()
        await expect(page).toHaveURL(`${AppRoutes.product}/${sampleProduct.slug}`)
    })

    test("biggest sale is shown", async ({ page }) => {
        await page.goto(AppRoutes.catalogue)
        const biggestSales = page.getByRole('heading', { name: 'Biggest Sales' })
        await expect(biggestSales).toBeVisible()
        const newestSection = biggestSales.locator('xpath=..')
        await expect(newestSection.getByText('Spring Sale')).toBeVisible()
    })

    test("popular and newest product cards are displayed", async ({ page }) => {
        await page.goto(AppRoutes.catalogue)

        const popularHeading = page.getByRole('heading', { name: 'Popular Products' })
        await expect(popularHeading).toBeVisible()
        const popularSection = popularHeading.locator('xpath=..')
        await expect(popularSection.getByText("Potion of Luck")).toBeVisible()

        const newestHeading = page.getByRole('heading', { name: 'Newest Products' })
        await expect(newestHeading).toBeVisible()
        const newestSection = newestHeading.locator('xpath=..')
        await expect(newestSection.getByText(sampleProduct.name)).toBeVisible()
    })

    test("testimonials section contains at least one review", async ({ page }) => {
        await page.goto(AppRoutes.catalogue)
        const testimonialsHeading = page.getByRole('heading', { name: 'Testimonials' })
        await expect(testimonialsHeading).toBeVisible()
        const testimonialsSection = testimonialsHeading.locator('xpath=..')
        await expect(testimonialsSection.locator('article').first()).toBeVisible()
    })
})