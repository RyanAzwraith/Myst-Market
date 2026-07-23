import { expect} from '@playwright/test';

import { AppRoutes } from '@/AppRoutes';
import {test, addToCart, login} from './fixtures'

const sampleAddressData  = {
    countryCode: "AUD",
    postcode: "2200",
    state: "NSW",
    city: "Sydney",
    street: "123 Some Street",
}

const sampleDeliveryNote = "leave on porch"

test("checkoutPage", async ({page, seededProduct, createUser}) => {
    await login(page, createUser)
    await addToCart(page, seededProduct)

    await page.getByLabel("solidcarticon").click()
    await page.getByText('Checkout').click()
    await expect(page).toHaveURL(AppRoutes.checkout)

    await expect(page.getByText("Checkout")).toBeVisible()

    await page.getByPlaceholder('country code').fill(sampleAddressData.countryCode)
    await page.getByPlaceholder('postcode').fill(sampleAddressData.postcode)
    await page.getByPlaceholder('state').fill(sampleAddressData.state)
    await page.getByPlaceholder('city').fill(sampleAddressData.city)
    await page.getByPlaceholder('street').fill(sampleAddressData.street)
    await page.getByPlaceholder('delivery note').fill(sampleDeliveryNote)
    await page.getByRole('button', { name: "Pay with Stripe" }).click()

    await page.getByPlaceholder('email@example.com').fill(createUser.email)
    await page.getByPlaceholder('1234 1234 1234 1234').fill("4242424242424242")
    await page.getByPlaceholder('MM / YY').fill("4/44")
    await page.getByPlaceholder('CVC').fill("444")
    await page.getByPlaceholder('Full name on card').fill(createUser.name)
    await page.getByRole('checkbox', { name: "Save my information for" }).click()
   
    await page.getByRole('button', { name: "Pay" }).click()

    await expect(page.getByText("Success!")).toBeVisible({ timeout: 20000 })
    await expect(page).toHaveURL(AppRoutes.success)

})
