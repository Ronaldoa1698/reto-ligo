import { test as base, createBdd } from 'playwright-bdd';
import { LoginPage } from '../pages/login.page.js';
import { InventoryPage } from '../pages/inventory.page.js';
import { CartPage } from '../pages/cart.page.js';
import { CheckoutInformationPage } from '../pages/checkout-information.page.js';
import { CheckoutOverviewPage } from '../pages/checkout-overview.page.js';
import { CheckoutCompletePage } from '../pages/checkout-complete.page.js';
import { createPurchaseData } from '../data/purchase.data.js';
import type { PurchaseData } from '../types/purchase.types.js';

type Credentials = {
  username: string;
  password: string;
};

type WebFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutInformationPage: CheckoutInformationPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
  purchaseData: PurchaseData;
  credentials: Credentials;
};

function requiredVariable(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(
      `Falta ${name}. Configúrala en web/.env o en las variables de entorno. Consulta web/README.md.`,
    );
  }
  return value;
}

export const test = base.extend<WebFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutInformationPage: async ({ page }, use) => {
    await use(new CheckoutInformationPage(page));
  },
  checkoutOverviewPage: async ({ page }, use) => {
    await use(new CheckoutOverviewPage(page));
  },
  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },
  purchaseData: async ({}, use) => {
    await use(createPurchaseData());
  },
  credentials: async ({}, use) => {
    await use({
      username: requiredVariable('SAUCE_USERNAME'),
      password: requiredVariable('SAUCE_PASSWORD'),
    });
  },
});

export const { Given, When, Then } = createBdd(test);

export { expect } from '@playwright/test';
