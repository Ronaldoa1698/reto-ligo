import { $, browser } from '@wdio/globals';

export class BasePage {
  get cartButton() {
    return $('~View cart');
  }

  protected async scrollTo(element: WebdriverIO.Element, direction: 'up' | 'down' = 'up'): Promise<WebdriverIO.Element> {
    if (!await element.isDisplayed()) {
      await element.scrollIntoView({ direction, maxScrolls: 5 });
    }
    await element.waitForDisplayed();
    return element;
  }

  protected async tap(element: WebdriverIO.Element): Promise<void> {
    await (await this.scrollTo(element)).click();
  }

  protected async type(element: WebdriverIO.Element, value: string): Promise<void> {
    const input = await this.scrollTo(element);
    if (value) await input.setValue(value);
    else await input.clearValue();
    if (await browser.isKeyboardShown()) await browser.hideKeyboard();
  }

  async openCart(): Promise<void> { await this.tap(await this.cartButton); }
}
