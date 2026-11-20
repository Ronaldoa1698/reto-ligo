import type { Locator, Page } from '@playwright/test';

export class InventoryLocators {
  readonly products: Locator;
  readonly cartLink: Locator;
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.products = page.getByTestId('inventory-item');
    this.cartLink = page.getByTestId('shopping-cart-link');
  }

  addToCartButton(productName: string): Locator {
    return this.products
      .filter({ has: this.page.getByText(productName, { exact: true }) })
      .getByRole('button', { name: 'Add to cart', exact: true });
  }
}
