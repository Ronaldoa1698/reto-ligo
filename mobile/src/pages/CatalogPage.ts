import { $, expect } from '@wdio/globals';
import { app } from '../../config/app.js';
import { BasePage } from './BasePage.js';

// Las descripciones del catálogo se repiten; el nombre distingue cada tarjeta.
class CatalogPage extends BasePage {
  product(name: string) {
    return $(`android=new UiSelector().resourceId("${app.packageId}:id/titleTV").text(${JSON.stringify(name)})`);
  }

  productImage(name: string) {
    return $(`android=new UiSelector().resourceId("${app.packageId}:id/titleTV").text(${JSON.stringify(name)}).fromParent(new UiSelector().resourceId("${app.packageId}:id/productIV"))`);
  }

  async expectProductAvailable(name: string): Promise<void> {
    await this.product(name).waitForDisplayed({ timeout: 30_000 });
    await expect(this.product(name)).toBeDisplayed();
  }

  async openProduct(name: string): Promise<void> { await this.tap(await this.productImage(name)); }
}

export default new CatalogPage();
