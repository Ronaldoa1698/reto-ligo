import type { Locator, Page } from '@playwright/test';

export class CheckoutCompleteLocators {
  readonly confirmationMessage: Locator;
  readonly cartLink: Locator;

  constructor(page: Page) {
    this.confirmationMessage = page.getByTestId('complete-header');
    this.cartLink = page.getByTestId('shopping-cart-link');
  }
}
