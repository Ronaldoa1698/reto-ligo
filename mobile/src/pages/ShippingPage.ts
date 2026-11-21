import { $, expect } from '@wdio/globals';
import { app } from '../../config/app.js';
import type { PurchaseData } from '../data/purchase.data.js';
import { BasePage } from './BasePage.js';

class ShippingPage extends BasePage {
  get fullName() { return $(`id=${app.packageId}:id/fullNameET`); }
  get address() { return $(`id=${app.packageId}:id/address1ET`); }
  get city() { return $(`id=${app.packageId}:id/cityET`); }
  get zip() { return $(`id=${app.packageId}:id/zipET`); }
  get country() { return $(`id=${app.packageId}:id/countryET`); }
  get paymentButton() { return $('~Saves user info for checkout'); }
  get nameError() { return $(`id=${app.packageId}:id/fullNameErrorTV`); }

  async fillAddress(data: PurchaseData['shipping']): Promise<void> {
    await this.type(await this.fullName, data.fullName);
    await this.type(await this.address, data.address);
    await this.type(await this.city, data.city);
    await this.type(await this.zip, data.zip);
    await this.type(await this.country, data.country);
  }

  async continueToPayment(): Promise<void> { await this.tap(await this.paymentButton); }

  async expectMissingNameError(): Promise<void> {
    await this.scrollTo(await this.nameError, 'down');
    await expect(this.nameError).toHaveText('Please provide your full name.');
  }
}

export default new ShippingPage();
