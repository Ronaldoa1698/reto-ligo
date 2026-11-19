import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const envFile = fileURLToPath(new URL('.env', import.meta.url));
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

const testDir = defineBddConfig({
  featuresRoot: './src/resources/feature',
  features: './src/resources/feature/**/*.feature',
  steps: ['./src/playwright/steps/**/*.ts', './src/playwright/fixtures/test.ts'],
  missingSteps: 'fail-on-gen',
});

export default defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  failOnFlakyTests: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 2,
  timeout: 30_000,
  globalTimeout: 300_000,
  expect: { timeout: 5_000 },
  outputDir: './test-results',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
