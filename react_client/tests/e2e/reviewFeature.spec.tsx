import { expect} from '@playwright/test';

import { AppRoutes } from '@/PageRoutes';
import {test, login, sampleProduct} from './fixtures'

const sampleReview = {
    review_id: 1,
    user_name: "Myst Customer",
    product_id: 1,
    rating: 2,
    description: "Wow much Wow.",
}

test.describe("Reviews feature", async () => {

    test("create and delete", async ({api, page, createUser}) => {
      try {
        await login(page, createUser)
        await page.getByPlaceholder('search').fill(sampleProduct.name)
        await page.keyboard.press("Enter")
        await page.getByText(sampleProduct.name).nth(1).click()

        await expect(page.getByText('Reviews').first()).toBeVisible()
        const form = page.getByRole('form', { name: 'review-form' })
        await expect(form).toBeVisible()
        await form.getByLabel('outlinestaricon').nth(sampleReview.rating-1).click()

        await page.getByPlaceholder('description').fill(sampleReview.description)
        await page.getByRole('button', { name: 'Submit' }).click()
        await expect(page.getByText(sampleReview.description).first()).toBeVisible()

        await page.getByLabel("solidIcon").click()
        await expect(page.getByText("Reviews").first()).toBeVisible()
        await expect(page.getByText(sampleReview.description).first()).toBeVisible()
        
        const article = page.getByRole('article')
          .filter({ hasText: sampleReview.description })
        await expect(article).toBeVisible()
        article.getByLabel('xmarkicon').click()
        await page.getByRole("button", {name: "Yes"}).click()

        await expect(
          page.getByText(sampleReview.description)
        ).toHaveCount(0, { timeout: 10000 })
      } finally {
        const res = await api.post('/test/reset-db', {
          timeout: 120000,
        })
        console.log("RES:", res.url(), res.statusText())
        expect(res.ok()).toBeTruthy()
      }
  }) 


})