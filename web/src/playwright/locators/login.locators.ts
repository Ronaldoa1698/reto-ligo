import type { Locator, Page } from '@playwright/test';

export class LoginLocators {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
    this.errorMessage = page.getByTestId('error');
  }
}
