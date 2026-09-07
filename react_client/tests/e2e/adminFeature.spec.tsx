import { expect } from '@playwright/test';

import { AppRoutes } from '@/app/PageRoutes';
import { login, sampleAdminData, test } from './fixtures';

test('dashboard loads seeded data', async ({ page }) => {
    await login(page, sampleAdminData);
    await page.goto(AppRoutes.adminDashboard);

    await expect(page.getByRole('heading', {
        name: 'Admin Dashboard',
    })).toBeVisible();
    await expect(page.getByRole('heading', {
        name: 'Performance',
    })).toBeVisible();
    await expect(page.getByRole('heading', {
        name: 'Revenue / Orders',
    })).toBeVisible();
    await expect(page.getByRole('heading', {
        name: 'Requires Attention',
    })).toBeVisible();
    await expect(page.getByRole('heading', {
        name: 'Recent Orders',
    })).toBeVisible();
    await expect(page.getByRole('heading', {
        name: 'Top Products',
    })).toBeVisible();
    await expect(page.getByText('Potion of Luck')).toBeVisible();
});

test('admin navigation loads each connected page', async ({ page }) => {
    await login(page, sampleAdminData);
    await page.goto(AppRoutes.adminDashboard);

    await page.getByRole('button', { name: 'Orders' }).click();
    await expect(page.getByRole('heading', {
        name: 'All Orders',
    })).toBeVisible();
    await expect(page.getByText('Order #1')).toBeVisible();

    await page.getByRole('button', { name: 'Products' }).click();
    await expect(page.getByRole('heading', {
        name: 'All Products',
    })).toBeVisible();
    await expect(page.getByText('Sword of Dawn')).toBeVisible();

    await page.getByRole('button', { name: 'Sales' }).click();
    await expect(page.getByRole('heading', {
        name: 'All Sales',
    })).toBeVisible();
    await expect(page.getByText('Spring Sale')).toBeVisible();

    await page.getByRole('button', { name: 'Users' }).click();
    await expect(page.getByRole('heading', {
        name: 'All Users',
    })).toBeVisible();
    await expect(page.getByText('Admin User')).toBeVisible();
});

test('product details open from the admin product list', async ({ page }) => {
    await login(page, sampleAdminData);
    await page.goto(AppRoutes.adminProducts);

    await page.getByText('Sword of Dawn').click();
    await expect(page.getByRole('heading', {
        name: 'Product Details',
    })).toBeVisible();
    await expect(page.getByText('Category: Weapons')).toBeVisible();
    await expect(page.getByText('Rarity: Epic')).toBeVisible();
    await expect(page.getByText('Stock: 1').nth(0)).toBeVisible();
})

test('order details open from the admin order list', async ({ page }) => {
    await login(page, sampleAdminData);
    await page.goto(AppRoutes.adminOrders);

    await page.getByText('Order #1').click();
    await expect(page.getByRole('heading', {
        name: 'Order Details',
    })).toBeVisible();
    await expect(page.getByText('User Name: Myst Customer')).toBeVisible();
    await expect(page.getByText('User Email: customer_one@mail.com'))
        .toBeVisible();
    await expect(page.getByText('Sword of Dawn')).toBeVisible();
});
