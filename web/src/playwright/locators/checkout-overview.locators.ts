import type { Locator, Page } from '@playwright/test';

export class CheckoutOverviewLocators {
  readonly items: Locator;
  readonly productNames: Locator;
  readonly quantities: Locator;
  readonly prices: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;

  constructor(page: Page) {
    this.items = page.getByTestId('inventory-item');
    this.productNames = this.items.getByTestId('inventory-item-name');
    this.quantities = this.items.getByTestId('item-quantity');
    this.prices = this.items.getByTestId('inventory-item-price');
    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
  }
}
