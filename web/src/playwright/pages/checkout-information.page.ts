import { expect, type Page } from '@playwright/test';
import { CheckoutInformationLocators } from '../locators/checkout-information.locators.js';
import type { CheckoutCustomer } from '../types/purchase.types.js';

export class CheckoutInformationPage {
  readonly page: Page;
  private readonly locators: CheckoutInformationLocators;

  constructor(page: Page) {
    this.page = page;
    this.locators = new CheckoutInformationLocators(page);
  }

  async completeInformation(customer: CheckoutCustomer): Promise<void> {
    await this.locators.firstNameInput.fill(customer.firstName);
    await this.locators.lastNameInput.fill(customer.lastName);
    await this.locators.postalCodeInput.fill(customer.postalCode);
    await this.locators.continueButton.click();
  }

  async expectValidationError(message: string): Promise<void> {
    await expect(this.locators.errorMessage).toHaveText(message);
  }

  async expectInformationFormVisible(): Promise<void> {
    await expect(this.locators.firstNameInput).toBeVisible();
    await expect(this.locators.lastNameInput).toBeVisible();
    await expect(this.locators.postalCodeInput).toBeVisible();
    await expect(this.locators.continueButton).toBeVisible();
  }
}
