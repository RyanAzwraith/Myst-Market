import { expect } from '@playwright/test'

import { AppRoutes } from '@/AppRoutes'
import { sampleProduct, test } from './fixtures'


test('shop page displays product images', async ({ page }) => {
	await page.goto(AppRoutes.shop)

	const images = page.locator('img')
	await expect(images.first()).toBeVisible()
	await expect(images).toHaveCount(10)
})

test('Sword of Dawn product page displays multiple images', async ({ page }) => {
	await page.goto(`${AppRoutes.product}/${sampleProduct.slug}`)

	await expect(page.getByRole('heading', {
		name: sampleProduct.name,
	})).toBeVisible()
	await expect(page.locator('img')).toHaveCount(2)
})

test('products CSV can be exported and imported', async ({ api }) => {
	const exportResponse = await api.get('/products/export')

	expect(exportResponse.ok()).toBeTruthy()
	expect(exportResponse.headers()['content-type']).toContain('text/csv')

	const importResponse = await api.post('/products/import', {
		multipart: {
			file: {
				name: 'products.csv',
				mimeType: 'text/csv',
				buffer: await exportResponse.body(),
			},
		},
	})

	expect(importResponse.ok()).toBeTruthy()
	const result = await importResponse.json()
	expect(result.failed).toBe(0)
	expect(result.imported).toBe(0)
	expect(result.updated).toBe(0)
	expect(result.errors).toEqual([])
})
