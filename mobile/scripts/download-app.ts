import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { app, mobileRoot } from '../config/app.js';

const directory = resolve(mobileRoot, 'apps/android');
const destination = resolve(directory, app.filename);
const checksum = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
if (existsSync(destination) && checksum(await readFile(destination)) === app.sha256) {
  console.log(`APK ${app.version} disponible; SHA-256 correcto.`);
} else {
  await mkdir(directory, { recursive: true });
  const response = await fetch(app.url, { signal: AbortSignal.timeout(120_000) });
  if (!response.ok) throw new Error(`Descarga del APK fallida: HTTP ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (checksum(bytes) !== app.sha256) throw new Error('SHA-256 del APK inesperado; revisa la release oficial.');
  const temporary = `${destination}.partial`;
  try {
    await writeFile(temporary, bytes);
    await rename(temporary, destination);
  } finally {
    await rm(temporary, { force: true });
  }
  console.log(`APK ${app.version} descargado y verificado.`);
}
