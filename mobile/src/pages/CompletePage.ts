import { $, browser, expect } from '@wdio/globals';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import allure from '@wdio/allure-reporter';
import { app, mobileRoot } from '../../config/app.js';
import { BasePage } from './BasePage.js';

class CompletePage extends BasePage {
  get confirmation() { return $(`id=${app.packageId}:id/thankYouTV`); }
  get continueShoppingButton() { return $('~Tap to open catalog'); }

  async expectConfirmed(): Promise<void> {
    await expect(this.confirmation).toHaveText('Thank you for your order');
  }

  async captureConfirmation(): Promise<void> {
    try {
      const screenshot = Buffer.from(await browser.takeScreenshot(), 'base64');
      const directory = resolve(mobileRoot, 'artifacts');
      await mkdir(directory, { recursive: true });
      await writeFile(resolve(directory, 'purchase-confirmation.png'), screenshot);
      allure.addAttachment('purchase-confirmation.png', screenshot, 'image/png');
    } catch (error) {
      console.warn('No se pudo recoger la captura de confirmación:', error);
    }
  }
  async continueShopping(): Promise<void> { await this.tap(await this.continueShoppingButton); }
}

export default new CompletePage();
