import { resolve } from 'node:path';

export const mobileRoot = resolve(import.meta.dirname, '..');
export const app = {
  version: '2.3.0',
  packageId: 'com.saucelabs.mydemoapp.android',
  activity: '.view.activities.SplashActivity',
  filename: 'mda-2.3.0-27.apk',
  url: 'https://github.com/saucelabs/my-demo-app-android/releases/download/2.3.0/mda-2.3.0-27.apk',
  sha256: 'bd3a3d6f2d50e076b2701ed2cc6a0ca82157b40a7033cf5be9f5d084b6591ec8',
} as const;
