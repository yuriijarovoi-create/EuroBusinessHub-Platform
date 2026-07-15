/**
 * Insert missing landkreis fields for NI settlements (block-scoped).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const nodesPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..', 'src', 'features', 'map', 'data', 'germany',
  'germanyNiedersachsenNodes.generated.ts',
);

const FIXES = {
  bersenbruck: 'Osnabrück',
  borkum: 'Leer',
  braunlage: 'Goslar',
  fassberg: 'Celle',
  lamstedt: 'Cuxhaven',
  lilienthal: 'Osterholz',
  norderney: 'Aurich',
  osterode_am_harz: 'Göttingen',
  quakenbruck: 'Osnabrück',
  salzhemmendorf: 'Hameln-Pyrmont',
  schnackenburg: 'Lüchow-Dannenberg',
  schoningen: 'Helmstedt',
  spelle: 'Emsland',
  stuhr: 'Diepholz',
  syke: 'Diepholz',
  werlte: 'Emsland',
  weyhe: 'Diepholz',
};

let src = fs.readFileSync(nodesPath, 'utf8');
let fixed = 0;
const stillMissing = [];

for (const [id, landkreis] of Object.entries(FIXES)) {
  const idToken = `id: '${id}'`;
  const idIdx = src.indexOf(idToken);
  if (idIdx < 0) {
    console.error('miss id', id);
    continue;
  }
  // Find start of object (previous '{')
  const start = src.lastIndexOf('{', idIdx);
  const end = src.indexOf('},', idIdx);
  if (start < 0 || end < 0) {
    console.error('bad block', id);
    continue;
  }
  const block = src.slice(start, end + 2);
  if (/\blandkreis:/.test(block)) {
    // ensure correct value
    const updated = block.replace(/landkreis: '[^']*'/, `landkreis: '${landkreis}'`);
    if (updated !== block) {
      src = src.slice(0, start) + updated + src.slice(end + 2);
      fixed++;
    }
    continue;
  }
  if (!/region: '[^']*',/.test(block)) {
    stillMissing.push(id);
    continue;
  }
  const updated = block.replace(
    /(region: '[^']*',\r?\n)/,
    `$1    landkreis: '${landkreis}',\n`,
  );
  src = src.slice(0, start) + updated + src.slice(end + 2);
  fixed++;
}

fs.writeFileSync(nodesPath, src);

// recount missing
const missing = [];
for (const id of Object.keys(FIXES)) {
  const idIdx = src.indexOf(`id: '${id}'`);
  const start = src.lastIndexOf('{', idIdx);
  const end = src.indexOf('},', idIdx);
  const block = src.slice(start, end + 2);
  if (!/\blandkreis:/.test(block)) missing.push(id);
}

console.log(JSON.stringify({ fixed, stillMissing: missing }, null, 2));
