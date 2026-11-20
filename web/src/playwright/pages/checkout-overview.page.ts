import { expect, type Page } from '@playwright/test';
import { CheckoutOverviewLocators } from '../locators/checkout-overview.locators.js';
import type { PurchaseProduct } from '../types/purchase.types.js';
import { formatUsd } from '../utils/money.js';

export class CheckoutOverviewPage {
  readonly page: Page;
  private readonly locators: CheckoutOverviewLocators;

  constructor(page: Page) {
    this.page = page;
    this.locators = new CheckoutOverviewLocators(page);
  }

  async expectOrderSummary(product: PurchaseProduct, expectedTaxInCents: number): Promise<void> {
    const subtotalInCents = product.unitPriceInCents * product.quantity;
    const totalInCents = subtotalInCents + expectedTaxInCents;

    await expect(this.locators.items).toHaveCount(1);
    await expect(this.locators.productNames).toHaveText(product.name);
    await expect(this.locators.quantities).toHaveText(String(product.quantity));
    await expect(this.locators.prices).toHaveText(formatUsd(product.unitPriceInCents));
    await expect(this.locators.subtotal).toContainText(formatUsd(subtotalInCents));
    await expect(this.locators.tax).toContainText(formatUsd(expectedTaxInCents));
    await expect(this.locators.total).toContainText(formatUsd(totalInCents));
  }

  async finishPurchase(): Promise<void> {
    await this.locators.finishButton.click();
  }
}
