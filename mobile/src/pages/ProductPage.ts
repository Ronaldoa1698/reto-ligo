import { $, expect } from '@wdio/globals';
import { app } from '../../config/app.js';
import type { PurchaseData } from '../data/purchase.data.js';
import { moneyPattern } from '../utils/money.js';
import { BasePage } from './BasePage.js';

class ProductPage extends BasePage {
  get productName() { return $(`id=${app.packageId}:id/productTV`); }
  get price() { return $(`id=${app.packageId}:id/priceTV`); }
  get addToCartButton() { return $('~Tap to add product to cart'); }

  async expectProduct(product: PurchaseData['product']): Promise<void> {
    await expect(this.productName).toHaveText(product.name);
    await this.scrollTo(await this.price);
    await expect(this.price).toHaveText(moneyPattern(product.priceCents));
  }

  async addToCart(): Promise<void> { await this.tap(await this.addToCartButton); }
}

export default new ProductPage();
