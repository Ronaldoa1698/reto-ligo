import type { Locator, Page } from '@playwright/test';

export class CartLocators {
  readonly cartList: Locator;
  readonly items: Locator;
  readonly productNames: Locator;
  readonly quantities: Locator;
  readonly prices: Locator;
  readonly checkoutButton: Locator;
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.cartList = page.getByTestId('cart-list');
    this.items = page.getByTestId('inventory-item');
    this.productNames = this.items.getByTestId('inventory-item-name');
    this.quantities = this.items.getByTestId('item-quantity');
    this.prices = this.items.getByTestId('inventory-item-price');
    this.checkoutButton = page.getByTestId('checkout');
  }

  removeButton(productName: string): Locator {
    return this.items
      .filter({ has: this.page.getByText(productName, { exact: true }) })
      .getByRole('button', { name: 'Remove', exact: true });
  }
}
