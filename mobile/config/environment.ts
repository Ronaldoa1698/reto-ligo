import { existsSync } from 'node:fs';
import { delimiter, dirname, resolve } from 'node:path';
import ffmpegPath from 'ffmpeg-static';
import { app, mobileRoot } from './app.js';

const envFile = resolve(mobileRoot, '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);

export const sdkHome = process.env.ANDROID_HOME;
process.env.APPIUM_HOME = resolve(mobileRoot, '.cache/appium');
if (typeof ffmpegPath === 'string') process.env.PATH = [dirname(ffmpegPath), process.env.PATH].join(delimiter);

export const apkPath = process.env.ANDROID_APP_PATH
  ? resolve(mobileRoot, process.env.ANDROID_APP_PATH)
  : resolve(mobileRoot, 'apps/android', app.filename);

export const testTag = process.env.TEST_TAG || '@regression';
