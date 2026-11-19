import { expect, type Page } from '@playwright/test';
import { InventoryLocators } from '../locators/inventory.locators.js';

export class InventoryPage {
  readonly page: Page;
  private readonly locators: InventoryLocators;

  constructor(page: Page) {
    this.page = page;
    this.locators = new InventoryLocators(page);
  }

  async expectCatalogVisible(): Promise<void> {
    await expect(this.page).toHaveURL(/\/inventory\.html$/);
    await expect(this.locators.title).toHaveText('Products');
    await expect(this.locators.products.first()).toBeVisible();
  }
}
