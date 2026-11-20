import { expect, type Page } from '@playwright/test';
import { InventoryLocators } from '../locators/inventory.locators.js';

export class InventoryPage {
  readonly page: Page;
  private readonly locators: InventoryLocators;

  constructor(page: Page) {
    this.page = page;
    this.locators = new InventoryLocators(page);
  }

  async addProductToCart(productName: string): Promise<void> {
    await this.locators.addToCartButton(productName).click();
  }

  async openCart(): Promise<void> {
    await this.locators.cartLink.click();
  }

  async expectCatalogVisible(): Promise<void> {
    await expect(this.locators.products.first()).toBeVisible();
  }
}
