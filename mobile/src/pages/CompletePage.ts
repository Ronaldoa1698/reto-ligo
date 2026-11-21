import { $, expect } from '@wdio/globals';
import { app } from '../../config/app.js';
import { BasePage } from './BasePage.js';

class CompletePage extends BasePage {
  get confirmation() { return $(`id=${app.packageId}:id/thankYouTV`); }
  get continueShoppingButton() { return $('~Tap to open catalog'); }

  async expectConfirmed(): Promise<void> {
    await expect(this.confirmation).toHaveText('Thank you for your order');
  }

  async captureConfirmation(): Promise<void> {
    await this.captureEvidence('purchase-confirmation');
  }
  async continueShopping(): Promise<void> { await this.tap(await this.continueShoppingButton); }
}

export default new CompletePage();
