import { expect} from '@playwright/test';

import { AppRoutes } from '@/AppRoutes';
import {test} from './fixtures'

// varaibles copied from fastapi_server\app\db\see\ base_seed.py and dev_seed.py
const sampleCategoryNames = ['Artifacts', "Consumables", "Weapons", "Accessories"]
const sampleRarityNames = ['Common', "Uncommon", "Rare", "Epic", "Legendary"]


test("category app bar button", async ({page, seededProduct}) => {
    await page.goto(
        `${AppRoutes.shop}?categories=${sampleCategoryNames[0]}`
    )
    await page.getByRole('button', { name: sampleCategoryNames[2] }).click()
    await expect(page.getByText(seededProduct.name)).toBeVisible()
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

test("search bar", async ({page, seededProduct}) => {
    await page.goto(
        `${AppRoutes.shop}`
    )
    await page.getByPlaceholder('search').fill(seededProduct.name)
    await page.keyboard.press("Enter")
    await expect(page).toHaveURL(
        `${AppRoutes.shop}?search=Sword+of+Dawn`
    )
    await expect(page.getByText(seededProduct.name).nth(1)).toBeVisible()
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


