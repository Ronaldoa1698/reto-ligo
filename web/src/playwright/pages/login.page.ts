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
    await expect(this.locators.usernameInput).toBeVisible();
    await expect(this.locators.passwordInput).toBeVisible();
    await expect(this.locators.loginButton).toBeVisible();
    await expect(this.locators.loginButton).toBeEnabled();
  }

  async loginWithLockedUser(password: string): Promise<void> {
    const demoUsernames = await this.locators.demoUsernames.innerText();
    const username = demoUsernames.split(/\s+/).find(value => value.startsWith('locked_'));
    if (!username) {
      throw new Error('La demo no publica un usuario bloqueado en el formulario de acceso.');
    }
    await this.login(username, password);
  }

  async expectInvalidCredentialsError(): Promise<void> {
    await expect(this.locators.errorMessage).toContainText(
      'Username and password do not match any user in this service',
    );
  }

  async expectLockedUserError(): Promise<void> {
    await expect(this.locators.errorMessage).toContainText('Sorry, this user has been locked out.');
  }

  async expectLoginPageVisible(): Promise<void> {
    await this.expectFormVisible();
  }
}
