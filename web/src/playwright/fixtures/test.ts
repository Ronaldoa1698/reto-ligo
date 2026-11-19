import { test as base, createBdd } from 'playwright-bdd';
import { LoginPage } from '../pages/login.page.js';
import { InventoryPage } from '../pages/inventory.page.js';

type Credentials = {
  username: string;
  password: string;
};

type WebFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
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
  credentials: async ({}, use) => {
    await use({
      username: requiredVariable('SAUCE_USERNAME'),
      password: requiredVariable('SAUCE_PASSWORD'),
    });
  },
});

export const { Given, When, Then } = createBdd(test);

export { expect } from '@playwright/test';
