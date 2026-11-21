import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { mobileRoot } from './config/app.js';
import { androidCapabilities } from './config/capabilities.android.js';
import { apkPath, sdkHome } from './config/environment.js';
import { sharedConfig } from './wdio.shared.conf.js';

if (!sdkHome) throw new Error('Falta ANDROID_HOME. Defínelo en mobile/.env o expórtalo en la terminal; consulta mobile/README.md.');
const adb = resolve(sdkHome, 'platform-tools/adb');
if (!existsSync(adb)) throw new Error(`ANDROID_HOME no apunta a un SDK válido: ${sdkHome}. Falta platform-tools/adb.`);
if (!existsSync(apkPath)) throw new Error('Falta el APK. Ejecuta pnpm app:download desde mobile.');
const connected = execFileSync(adb, ['devices'], { encoding: 'utf8' }).split('\n')
  .filter((line) => /^\S+\s+device\s*$/.test(line)).map((line) => line.split(/\s+/)[0]);
if (process.env.ANDROID_UDID ? !connected.includes(process.env.ANDROID_UDID) : connected.length !== 1) {
  throw new Error('Conecta un dispositivo Android listo o define ANDROID_UDID si hay varios. Revisa adb devices.');
}

export const config: WebdriverIO.Config = {
  ...sharedConfig,
  capabilities: [androidCapabilities],
  services: [['appium', {
    command: 'appium',
    logPath: resolve(mobileRoot, 'logs'),
    args: { address: '127.0.0.1', port: 4723, basePath: '/', logLevel: 'info', logNoColors: true },
  }]],
};
