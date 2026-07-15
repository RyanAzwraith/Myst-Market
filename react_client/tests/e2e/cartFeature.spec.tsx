import { expect} from '@playwright/test';

import { AppRoutes } from '@/AppRoutes';
import {test, addToCart} from './fixtures'

test("add to cart button", async ({page, seededProduct}) => {
    await page.goto(
        `${AppRoutes.shop}?search=${seededProduct.name}`
    )
    await page.getByRole('button', { name: 'Add to Cart' }).click()
    await page.getByLabel("plusicon").click()
    await expect(await page.getByPlaceholder('quantity').inputValue()).toBe('2')
    await page.getByPlaceholder('quantity').fill('3')
    await expect(await page.getByPlaceholder('quantity').inputValue()).toBe('3')
})

test("cart app bar button", async ({page, seededProduct}) => {
    addToCart(page, seededProduct)
    await page.getByLabel("solidcarticon").click()
    await expect(page.getByText('Cart')).toBeVisible()
})

test("cart modal", async ({page, seededProduct}) => {
    addToCart(page, seededProduct)
    await page.getByLabel("solidcarticon").click()
    await expect(page.getByText(seededProduct.name).nth(2)).toBeVisible()
    await page.getByRole('button', { name: 'clear' }).nth(0).click()
    await expect(page.getByText('Checkout')).not.toBeVisible()
})


