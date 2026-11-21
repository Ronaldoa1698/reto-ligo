import { $, $$, expect } from '@wdio/globals';
import { app } from '../../config/app.js';
import type { PurchaseData } from '../data/purchase.data.js';
import { moneyPattern } from '../utils/money.js';
import { BasePage } from './BasePage.js';

class CartPage extends BasePage {
  get products() { return $$(`id=${app.packageId}:id/titleTV`); }
  get productName() { return $(`id=${app.packageId}:id/titleTV`); }
  get price() { return $(`id=${app.packageId}:id/priceTV`); }
  get quantity() { return $(`id=${app.packageId}:id/noTV`); }
  get increaseButton() { return $('~Increase item quantity'); }
  get decreaseButton() { return $('~Decrease item quantity'); }
  get removeButton() { return $('~Removes product from cart'); }
  get total() { return $(`id=${app.packageId}:id/totalPriceTV`); }
  get checkoutButton() { return $('~Confirms products for checkout'); }
  get emptyMessage() { return $(`id=${app.packageId}:id/noItemTitleTV`); }

  async expectProduct(product: PurchaseData['product'], quantity: number): Promise<void> {
    await expect(this.products).toBeElementsArrayOfSize(1);
    await expect(this.productName).toHaveText(product.name);
    await expect(this.quantity).toHaveText(String(quantity));
    await expect(this.price).toHaveText(moneyPattern(product.priceCents));
    await expect(this.total).toHaveText(moneyPattern(product.priceCents * quantity));
  }

  async increaseQuantity(): Promise<void> { await this.tap(await this.increaseButton); }
  async decreaseQuantity(): Promise<void> { await this.tap(await this.decreaseButton); }
  async removeProduct(): Promise<void> { await this.tap(await this.removeButton); }
  async proceedToCheckout(): Promise<void> { await this.tap(await this.checkoutButton); }
  async expectEmpty(): Promise<void> { await expect(this.emptyMessage).toBeDisplayed(); }
}

export default new CartPage();
