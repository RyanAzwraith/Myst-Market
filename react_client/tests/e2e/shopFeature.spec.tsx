import { expect} from '@playwright/test';

import { AppRoutes } from '@/AppRoutes';
import {test, login} from './fixtures'

const dateString = "2026-07-13T12:00:00"

// varaibles copied from fastapi_server\app\db\see\ base_seed.py and dev_seed.py
const sampleCategoryNames = ['Artifacts', "Consumables", "Weapons", "Accessories"]
const sampleRarityNames = ['Common', "Uncommon", "Rare", "Epic", "Legendary"]

const sampleSale = {
    id: 1,
    name: "Spring Sale",
    slug: "spring-sale",
    description: "Save 20% on selected items.",
    discountPercent: 20,
    startAt: new Date("2025-07-13T12:00:00"),
    endAt: new Date("2036-07-13T12:00:00"),
}

const sampleProduct = {
    id: 1,
    name: "Sword of Dawn",
    categoryName: sampleCategoryNames[2],
    rarityName: sampleRarityNames[4],
    priceAudCent: 25000,
    slug: "sword-of-dawn",
    description: "Ancient enchanted sword",
    stock:1,
    saleSlug: sampleSale.slug,
}

test.beforeAll(async () => {

})

test("category app bar button", async ({page}) => {
    await page.goto(
        `${AppRoutes.shop}?categories=${sampleCategoryNames[0]}`
    )
    await page.getByRole('button', { name: sampleCategoryNames[2] }).click()
    await expect(page.getByText(sampleProduct.name)).toBeVisible()
    await expect(page).toHaveURL(
        `${AppRoutes.shop}?categories=${sampleCategoryNames[2]}`
    )
})

test("search params", async ({page}) => {
    await page.goto(
        `${AppRoutes.shop}`
    )
    await page.getByRole('checkbox', { name: sampleCategoryNames[2] }).click()
    await page.getByRole('checkbox', { name: sampleCategoryNames[0] }).click()
    await expect(page).toHaveURL(
        `${AppRoutes.shop}?categories=${sampleCategoryNames[2]}%2C${sampleCategoryNames[0]}`
    )
    await page.getByRole('button', { name:'clear' }).first().click()
    await expect(page).toHaveURL(
        `${AppRoutes.shop}`
    )

    await page.getByRole('checkbox', { name: sampleRarityNames[3] }).click()
    await page.getByRole('checkbox', { name: sampleRarityNames[1] }).click()
    await expect(page).toHaveURL(
        `${AppRoutes.shop}?rarities=${sampleRarityNames[3]}%2C${sampleRarityNames[1]}`
    )
    await page.getByRole('button', { name:'clear' }).nth(1).click()
    await expect(page).toHaveURL(
        `${AppRoutes.shop}`
    )
    await page.getByRole('checkbox', { name: 'Ascending' }).click()
    await page.getByRole('combobox', { name: 'Sort by' }).selectOption('price')
    await expect(page).toHaveURL(
        `${AppRoutes.shop}?isAscending=true&sortBy=price`
    )
})

test("search bar", async ({page}) => {
    await page.goto(
        `${AppRoutes.shop}`
    )
    await page.getByPlaceholder('search').fill(sampleProduct.name)
    await page.keyboard.press("Enter")
    await expect(page).toHaveURL(
        `${AppRoutes.shop}?search=Sword+of+Dawn`
    )
    await expect(page.getByText(sampleProduct.name).nth(1)).toBeVisible()
    await page.getByLabel("xmarkicon").click()
    await expect(page).toHaveURL(
        `${AppRoutes.shop}`
    )
    await expect(page.getByText('All Products')).toBeVisible()

})


test("pageination", async ({page}) => {
    await page.goto(
        `${AppRoutes.shop}`
    )
    await expect(page.getByLabel("ChevronDownIcon")).not.toBeVisible()
})


