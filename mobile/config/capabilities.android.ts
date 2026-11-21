import { app } from './app.js';
import { apkPath } from './environment.js';

export const androidCapabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:app': apkPath,
  'appium:appPackage': app.packageId,
  'appium:appActivity': app.activity,
  'appium:appWaitActivity': `${app.packageId}.view.activities.*`,
  'appium:deviceName': 'Ligo Android',
  'appium:language': 'en',
  'appium:locale': 'US',
  'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION || '14',
  ...(process.env.ANDROID_UDID ? { 'appium:udid': process.env.ANDROID_UDID } : {}),
  'appium:autoGrantPermissions': true,
  'appium:noReset': true,
  'appium:shouldTerminateApp': true,
  'appium:newCommandTimeout': 120,
  'appium:adbExecTimeout': 60_000,
  'appium:uiautomator2ServerInstallTimeout': 60_000,
};
