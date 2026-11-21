import { $, browser } from '@wdio/globals';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import allure from '@wdio/allure-reporter';
import { mobileRoot } from '../../config/app.js';

export class BasePage {
  get cartButton() {
    return $('~View cart');
  }

  protected async scrollTo(element: WebdriverIO.Element, direction: 'up' | 'down' = 'up'): Promise<WebdriverIO.Element> {
    if (!await element.isDisplayed()) {
      await element.scrollIntoView({ direction, maxScrolls: 5, percent: 0.7 });
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

  protected async captureEvidence(name: string): Promise<void> {
    try {
      const screenshot = Buffer.from(await browser.takeScreenshot(), 'base64');
      const directory = resolve(mobileRoot, 'artifacts');
      await mkdir(directory, { recursive: true });
      await writeFile(resolve(directory, `${name}-${randomUUID()}.png`), screenshot);
      allure.addAttachment(`${name}.png`, screenshot, 'image/png');
    } catch (error) {
      console.warn(`No se pudo recoger la captura ${name}:`, error instanceof Error ? error.message : String(error));
    }
  }
}
