import { expect, type Page } from '@playwright/test';
import { CartLocators } from '../locators/cart.locators.js';
import type { PurchaseProduct } from '../types/purchase.types.js';
import { formatUsd } from '../utils/money.js';

export class CartPage {
  readonly page: Page;
  private readonly locators: CartLocators;

  constructor(page: Page) {
    this.page = page;
    this.locators = new CartLocators(page);
  }

  async expectOnlyProduct(product: PurchaseProduct): Promise<void> {
    await expect(this.locators.items).toHaveCount(1);
    await expect(this.locators.productNames).toHaveText(product.name);
    await expect(this.locators.quantities).toHaveText(String(product.quantity));
    await expect(this.locators.prices).toHaveText(formatUsd(product.unitPriceInCents));
  }

  async startCheckout(): Promise<void> {
    await this.locators.checkoutButton.click();
  }

  async removeProduct(productName: string): Promise<void> {
    await this.locators.removeButton(productName).click();
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }

  async expectEmpty(): Promise<void> {
    await expect(this.locators.cartList).toBeVisible();
    await expect(this.locators.items).toHaveCount(0);
  }
}
