import { $, expect } from '@wdio/globals';
import { app } from '../../config/app.js';
import type { PurchaseData } from '../data/purchase.data.js';
import { moneyPattern } from '../utils/money.js';
import { BasePage } from './BasePage.js';

class ReviewPage extends BasePage {
  get productName() { return $(`id=${app.packageId}:id/titleTV`); }
  get price() { return $(`id=${app.packageId}:id/priceTV`); }
  get items() { return $(`id=${app.packageId}:id/itemNumberTV`); }
  get delivery() { return $(`id=${app.packageId}:id/amountTV`); }
  get total() { return $(`id=${app.packageId}:id/totalAmountTV`); }
  get shippingName() { return $(`id=${app.packageId}:id/fullNameTV`); }
  get placeOrderButton() { return $('~Completes the process of checkout'); }

  async expectOrder(data: PurchaseData): Promise<void> {
    await this.scrollTo(await this.productName);
    await expect(this.productName).toHaveText(data.product.name);
    await expect(this.price).toHaveText(moneyPattern(data.product.priceCents));
    await expect(this.items).toHaveText('1 Items');
    await this.scrollTo(await this.shippingName);
    await expect(this.shippingName).toHaveText(data.shipping.fullName);
    await this.scrollTo(await this.delivery);
    await expect(this.delivery).toHaveText(moneyPattern(data.deliveryCents));
    await expect(this.total).toHaveText(moneyPattern(data.product.priceCents + data.deliveryCents));
    await this.captureEvidence('order-review');
  }

  async placeOrder(): Promise<void> { await this.tap(await this.placeOrderButton); }
}

export default new ReviewPage();
