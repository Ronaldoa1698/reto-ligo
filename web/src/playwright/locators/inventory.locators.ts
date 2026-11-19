import type { Locator, Page } from '@playwright/test';

export class InventoryLocators {
  readonly title: Locator;
  readonly products: Locator;

  constructor(page: Page) {
    this.title = page.getByTestId('title');
    this.products = page.getByTestId('inventory-item');
  }
}
