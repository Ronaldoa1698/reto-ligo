import { expect, type Page } from '@playwright/test';
import { LoginLocators } from '../locators/login.locators.js';

export class LoginPage {
  readonly page: Page;
  private readonly locators: LoginLocators;

  constructor(page: Page) {
    this.page = page;
    this.locators = new LoginLocators(page);
  }

  async navigateToUrl(url: string): Promise<void> {
    await this.page.goto(url);
  }

  async login(username: string, password: string): Promise<void> {
    await this.locators.usernameInput.fill(username);
    await this.locators.passwordInput.fill(password);
    await this.locators.loginButton.click();
  }

  async expectFormVisible(): Promise<void> {
    await expect(this.page).toHaveTitle('Swag Labs');
    await expect(this.locators.usernameInput).toBeVisible();
    await expect(this.locators.passwordInput).toBeVisible();
    await expect(this.locators.loginButton).toBeEnabled();
  }

  async expectInvalidCredentialsError(): Promise<void> {
    await expect(this.locators.errorMessage).toHaveText(
      'Epic sadface: Username and password do not match any user in this service',
    );
  }

  async expectLoginPageVisible(): Promise<void> {
    await expect(this.page).toHaveURL(/\/$/);
    await expect(this.locators.loginButton).toBeVisible();
  }
}
