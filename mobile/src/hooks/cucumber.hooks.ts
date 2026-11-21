import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { After, Before, Status } from '@cucumber/cucumber';
import { browser } from '@wdio/globals';
import allure from '@wdio/allure-reporter';
import { app, mobileRoot } from '../../config/app.js';
import { sdkHome } from '../../config/environment.js';
import CatalogPage from '../pages/CatalogPage.js';
import { purchaseData } from '../data/purchase.data.js';

Before(async () => {
  await browser.execute('mobile: terminateApp', { appId: app.packageId, timeout: 15_000 });
  await browser.waitUntil(async () => await browser.queryAppState(app.packageId) === 1, {
    timeout: 15_000, timeoutMsg: 'La app anterior no terminó antes de limpiar sus datos.',
  });
  await browser.execute('mobile: clearApp', { appId: app.packageId });
  await browser.execute('mobile: startActivity', {
    component: `${app.packageId}/${app.activity}`,
    action: 'android.intent.action.MAIN',
    categories: ['android.intent.category.LAUNCHER'],
    wait: true,
    stop: true,
  });
  await CatalogPage.expectProductAvailable(purchaseData().product.name);
  await browser.startRecordingScreen();
});

After(async ({ pickle, result }) => {
  const failed = result?.status === Status.FAILED;
  const directory = resolve(mobileRoot, 'artifacts', `${pickle.name.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 100)}-${Date.now()}`);
  async function save(name: string, bytes: Buffer | string, mime: string): Promise<void> {
    await mkdir(directory, { recursive: true });
    await writeFile(resolve(directory, name), bytes);
    allure.addAttachment(name, bytes, mime);
  }
  // Un fallo al recoger evidencia no debe reemplazar el error original del escenario.
  async function capture(action: () => Promise<void>): Promise<void> {
    try { await action(); }
    catch (error) { console.warn('No se pudo recoger una evidencia:', error instanceof Error ? error.message : String(error)); }
  }
  if (failed) {
    await capture(async () => save('failure.png', Buffer.from(await browser.takeScreenshot(), 'base64'), 'image/png'));
    await capture(async () => save('hierarchy.xml', await browser.getPageSource(), 'text/xml'));
    await capture(async () => {
      if (!sdkHome) return;
      const args = process.env.ANDROID_UDID ? ['-s', process.env.ANDROID_UDID] : [];
      const logs = execFileSync(resolve(sdkHome, 'platform-tools/adb'), [...args, 'logcat', '-d', '-t', '400'], { encoding: 'utf8', timeout: 15_000 });
      await save('logcat.txt', logs, 'text/plain');
    });
  }
  await capture(async () => {
    const recording = await browser.stopRecordingScreen();
    if (failed && recording) await save('failure.mp4', Buffer.from(recording, 'base64'), 'video/mp4');
  });
});
