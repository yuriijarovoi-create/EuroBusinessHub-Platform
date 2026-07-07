import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.resolve(frontendRoot, '../shared');
const target = path.resolve(frontendRoot, 'shared');

if (!fs.existsSync(source)) {
  console.error(`Shared source not found: ${source}`);
  process.exit(1);
}

fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(source, target, { recursive: true });
console.log(`Synced ${source} -> ${target}`);
