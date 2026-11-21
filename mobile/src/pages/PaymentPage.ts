import { $ } from '@wdio/globals';
import { app } from '../../config/app.js';
import type { PurchaseData } from '../data/purchase.data.js';
import { BasePage } from './BasePage.js';

class PaymentPage extends BasePage {
  get fullName() { return $(`id=${app.packageId}:id/nameET`); }
  get number() { return $(`id=${app.packageId}:id/cardNumberET`); }
  get expiration() { return $(`id=${app.packageId}:id/expirationDateET`); }
  get securityCode() { return $(`id=${app.packageId}:id/securityCodeET`); }
  get reviewButton() { return $('~Saves payment info and launches screen to review checkout data'); }

  async fillPayment(data: PurchaseData['payment']): Promise<void> {
    await this.type(await this.fullName, data.fullName);
    await this.type(await this.number, data.number);
    await this.type(await this.expiration, data.expiration);
    await this.type(await this.securityCode, data.code);
  }

  async continueToReview(): Promise<void> { await this.tap(await this.reviewButton); }
}

export default new PaymentPage();
