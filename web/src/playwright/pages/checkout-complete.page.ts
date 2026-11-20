import { expect, type Page } from '@playwright/test';
import { CheckoutCompleteLocators } from '../locators/checkout-complete.locators.js';

export class CheckoutCompletePage {
  readonly page: Page;
  private readonly locators: CheckoutCompleteLocators;

  constructor(page: Page) {
    this.page = page;
    this.locators = new CheckoutCompleteLocators(page);
  }

  async expectOrderConfirmed(): Promise<void> {
    await expect(this.locators.confirmationMessage).toHaveText('Thank you for your order!');
  }

  async openCart(): Promise<void> {
    await this.locators.cartLink.click();
  }

  async captureScreenshot(): Promise<Buffer> {
    return this.page.screenshot({ fullPage: true });
  }
}
