import { $ } from '@wdio/globals';
import { app } from '../../config/app.js';
import { BasePage } from './BasePage.js';

class LoginPage extends BasePage {
  get demoAccount() { return $(`id=${app.packageId}:id/username1TV`); }
  get loginButton() { return $('~Tap to login with given credentials'); }

  async loginWithDemoAccount(): Promise<void> {
    await this.tap(await this.demoAccount);
    await this.tap(await this.loginButton);
  }
}

export default new LoginPage();
