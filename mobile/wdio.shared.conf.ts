import { mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Options } from '@wdio/types';
import { mobileRoot } from './config/app.js';
import { loadConfiguration, loadSources } from '@cucumber/cucumber/api';
import { testTag } from './config/environment.js';

// Validar al cargar evita que WDIO termine con éxito al omitir una selección vacía.
if (!/^@[A-Za-z0-9_-]+$/.test(testTag)) throw new Error('TEST_TAG debe ser un único tag, por ejemplo @cart o @smoke.');
const { runConfiguration } = await loadConfiguration({ provided: {
  paths: [resolve(mobileRoot, 'src/features/**/*.feature')], tags: testTag,
} }, { cwd: mobileRoot });
const { plan, errors } = await loadSources(runConfiguration.sources, { cwd: mobileRoot });
if (errors.length) throw new Error(`No se pudieron cargar los features: ${JSON.stringify(errors)}`);
if (!plan.length) throw new Error(`No se encontraron escenarios para ${testTag}.`);

export function prepareRun(): void {
  console.log(`Selección ${testTag}: ${plan.length} escenarios.`);
  for (const directory of ['logs', 'artifacts', 'reports', 'allure-results', 'allure-report']) {
    rmSync(resolve(mobileRoot, directory), { recursive: true, force: true });
  }
  for (const name of ['logs', 'artifacts', 'reports/junit', 'allure-results']) {
    mkdirSync(resolve(mobileRoot, name), { recursive: true });
  }
}

export const sharedConfig: Options.Testrunner = {
  runner: 'local',
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',
  framework: 'cucumber',
  specs: [[resolve(mobileRoot, 'src/features/**/*.feature')]],
  maxInstances: 1,
  logLevel: 'warn',
  outputDir: resolve(mobileRoot, 'logs'),
  waitforTimeout: 20_000,
  waitforInterval: 300,
  connectionRetryTimeout: 120_000,
  connectionRetryCount: 0,
  specFileRetries: 0,
  reporters: [
    'spec',
    ['allure', {
      outputDir: resolve(mobileRoot, 'allure-results'),
      disableWebdriverStepsReporting: true,
      disableWebdriverScreenshotsReporting: false,
    }],
    ['junit', {
      outputDir: resolve(mobileRoot, 'reports/junit'),
      outputFileFormat: ({ cid }: { cid: string }) => `results-${cid}.xml`,
    }],
  ],
  cucumberOpts: {
    import: [resolve(mobileRoot, 'src/steps/**/*.ts'), resolve(mobileRoot, 'src/hooks/**/*.ts')],
    tags: testTag,
    timeout: 120_000,
    retry: 0,
    strict: true,
    failAmbiguousDefinitions: true,
  },
  onPrepare: prepareRun,
};
