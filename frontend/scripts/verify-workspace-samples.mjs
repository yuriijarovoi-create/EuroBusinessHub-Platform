/**
 * Verify sample settlement IDs resolve in the canonical cities merge.
 * Usage: node scripts/verify-workspace-samples.mjs [id1 id2 ...]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dir, '..', 'src');

const SEED_FILES = [
  'data/cities.ts',
  'features/map/data/germany/germanyCitiesDense.ts',
  'features/map/data/germany/germanyCitiesExtra.ts',
  'features/map/data/germany/germanyLocalNodes.generated.ts',
  'features/map/data/germany/germanyLocalNodesRural.generated.ts',
  'features/map/data/germany/germanyRheinlandPfalzNodes.generated.ts',
  'features/map/data/germany/germanySaarlandNodes.generated.ts',
  'features/map/data/germany/germanyHessenNodes.generated.ts',
  'features/map/data/germany/germanyRegionalClusters.generated.ts',
];

function loadAllIds() {
  const ids = new Set();
  for (const f of SEED_FILES) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    for (const m of src.matchAll(/(?:de\(\s*['"]|id:\s*['"])([a-z0-9_]+)/g)) ids.add(m[1]);
  }
  return ids;
}

const defaultSamples = [
  'cochem',
  'morbach',
  'saarburg',
  'schweich',
  'manderscheid',
  'mimbach',
  'bilzingen',
  'aach',
  'trier',
  'wittlich',
];

const samples = process.argv.slice(2).length ? process.argv.slice(2) : defaultSamples;
const allIds = loadAllIds();

const results = samples.map((id) => ({
  id,
  found: allIds.has(id),
  workspaceRoute: `/workspace/${id}`,
}));

const failed = results.filter((r) => !r.found);
console.log(JSON.stringify({ checked: results.length, failed: failed.length, results }, null, 2));
process.exit(failed.length ? 1 : 0);
