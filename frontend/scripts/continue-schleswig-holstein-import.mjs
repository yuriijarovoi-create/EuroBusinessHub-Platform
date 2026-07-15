/**
 * Continue Schleswig-Holstein import in chunks of 250 with post-chunk validation.
 *
 * Usage:
 *   node scripts/continue-schleswig-holstein-import.mjs
 *   node scripts/continue-schleswig-holstein-import.mjs --max-chunks=20 --chunk=250
 *
 * Does NOT commit or push. Stops when queue exhausted, deferred-only remain,
 * build fails, or max chunks reached.
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dir, '..');
const CHUNK = parseInt(process.argv.find((a) => a.startsWith('--chunk='))?.split('=')[1] ?? '250', 10);
const MAX_CHUNKS = parseInt(process.argv.find((a) => a.startsWith('--max-chunks='))?.split('=')[1] ?? '40', 10);
const SKIP_BUILD = process.argv.includes('--skip-build');

const RESULT_PATH = path.join(__dir, 'osm-schleswig-holstein-import-result.json');
const CHECKPOINT_PATH = path.join(__dir, 'osm-schleswig-holstein-checkpoint.json');
const PROGRESS_PATH = path.join(__dir, 'osm-schleswig-holstein-continuation-progress.json');

function run(cmd, args, opts = {}) {
  console.error(`\n>>> ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: false,
    env: process.env,
    ...opts,
  });
  return r.status ?? 1;
}

function runShell(command) {
  console.error(`\n>>> ${command}`);
  const r = spawnSync(command, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
  return r.status ?? 1;
}

function readJson(p, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return fallback;
  }
}

function countGenerated() {
  const p = path.join(ROOT, 'src/features/map/data/germany/germanySchleswigHolsteinNodes.generated.ts');
  if (!fs.existsSync(p)) return 0;
  return (fs.readFileSync(p, 'utf8').match(/id:\s*'/g) || []).length;
}

function germanyMarkerEstimate() {
  const files = [
    'src/data/cities.ts',
    'src/features/map/data/germany/germanyCitiesDense.ts',
    'src/features/map/data/germany/germanyCitiesExtra.ts',
    'src/features/map/data/germany/germanyLocalNodes.generated.ts',
    'src/features/map/data/germany/germanyLocalNodesRural.generated.ts',
    'src/features/map/data/germany/germanyRheinlandPfalzNodes.generated.ts',
    'src/features/map/data/germany/germanySaarlandNodes.generated.ts',
    'src/features/map/data/germany/germanyHessenNodes.generated.ts',
    'src/features/map/data/germany/germanyBadenWuerttembergNodes.generated.ts',
    'src/features/map/data/germany/germanyBayernNodes.generated.ts',
    'src/features/map/data/germany/germanyNordrheinWestfalenNodes.generated.ts',
    'src/features/map/data/germany/germanyNiedersachsenNodes.generated.ts',
    'src/features/map/data/germany/germanySchleswigHolsteinNodes.generated.ts',
    'src/features/map/data/germany/germanyRegionalClusters.generated.ts',
  ];
  let n = 0;
  for (const f of files) {
    const full = path.join(ROOT, f);
    if (!fs.existsSync(full)) continue;
    n += (fs.readFileSync(full, 'utf8').match(/lat:\s*[\d.-]+/g) || []).length;
  }
  return n;
}

function parseBundleSize(buildLog) {
  const m = buildLog?.match(/dist\/assets\/index-[^\s]+\s+([0-9.]+)\s*kB/i);
  return m ? `${m[1]} kB` : null;
}

const baseline = {
  at: new Date().toISOString(),
  generated: countGenerated(),
  germanyMarkers: germanyMarkerEstimate(),
  resultImported: readJson(RESULT_PATH)?.imported?.length ?? 0,
  checkpoint: readJson(CHECKPOINT_PATH),
};

const progress = {
  baseline,
  chunks: [],
  totals: {
    newlyImported: 0,
    nominatimRequests: 0,
    http429Retries: 0,
    cacheHits: 0,
  },
  stoppedReason: null,
};

console.error(JSON.stringify({ phase: 'baseline', ...baseline }, null, 2));
fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));

for (let i = 1; i <= MAX_CHUNKS; i++) {
  const before = countGenerated();
  console.error(`\n========== CHUNK ${i}/${MAX_CHUNKS} (before=${before}) ==========`);

  const importStatus = run(process.execPath, [
    path.join(__dir, 'import-schleswig-holstein-settlements.mjs'),
    '--resume',
    '--no-caps',
    `--chunk=${CHUNK}`,
    '--limit=5000',
  ]);

  const result = readJson(RESULT_PATH, {});
  const report = result.report ?? {};
  const after = countGenerated();
  const newly = report.newlyImported ?? Math.max(0, after - before);

  const chunkReport = {
    chunk: i,
    at: new Date().toISOString(),
    importStatus,
    before,
    after,
    newlyImported: newly,
    totalImported: report.imported ?? after,
    skipped: report.skipped ?? {},
    byLandkreis: report.byLandkreis ?? {},
    nominatimRequests: report.nominatimRequests ?? 0,
    http429Retries: report.http429Retries ?? 0,
    deferred: report.deferred ?? 0,
    failed: report.failed ?? 0,
    queueExhausted: report.queueExhausted ?? false,
    germanyMarkers: germanyMarkerEstimate(),
    validations: {},
  };

  progress.totals.newlyImported += newly;
  progress.totals.nominatimRequests += chunkReport.nominatimRequests;
  progress.totals.http429Retries += chunkReport.http429Retries;
  progress.totals.cacheHits += report.skipped?.cacheHit ?? 0;

  if (importStatus !== 0) {
    chunkReport.validations.import = 'FAIL';
    progress.chunks.push(chunkReport);
    progress.stoppedReason = `import-failed-chunk-${i}`;
    fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));
    console.error(`STOP: import failed on chunk ${i}`);
    process.exit(1);
  }

  // Integrity / duplicates
  let v = run(process.execPath, [path.join(__dir, 'validate-sh-integrity.mjs')]);
  chunkReport.validations.integrity = v === 0 ? 'PASS' : 'FAIL';

  v = run(process.execPath, [path.join(__dir, 'verify-sh-workspace-samples.mjs')]);
  chunkReport.validations.workspace = v === 0 ? 'PASS' : 'FAIL';

  v = run(process.execPath, [path.join(__dir, 'count-schleswig-holstein-settlements.mjs')]);
  chunkReport.validations.count = v === 0 ? 'PASS' : 'FAIL';

  if (!SKIP_BUILD) {
    const tscStatus = runShell('npx tsc -b --pretty false');
    chunkReport.validations.tsc = tscStatus === 0 ? 'PASS' : 'FAIL';

    console.error('\n>>> npm run build');
    const build = spawnSync('npm run build', {
      cwd: ROOT, encoding: 'utf8', shell: true, env: process.env,
    });
    chunkReport.validations.build = build.status === 0 ? 'PASS' : 'FAIL';
    const out = `${build.stdout || ''}\n${build.stderr || ''}`;
    chunkReport.bundleSize = parseBundleSize(out);
    if (build.status !== 0) {
      chunkReport.buildStderr = out.slice(-2000);
    } else if (out) {
      process.stdout.write(out.slice(-1500));
    }

    const lintStatus = runShell('npm run lint');
    chunkReport.validations.lint = lintStatus === 0 ? 'PASS' : 'FAIL';
  }

  progress.chunks.push(chunkReport);
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));

  console.error(`\n--- CHUNK ${i} REPORT ---`);
  console.error(JSON.stringify({
    newlyImported: newly,
    total: after,
    germanyMarkers: chunkReport.germanyMarkers,
    nominatimRequests: chunkReport.nominatimRequests,
    http429Retries: chunkReport.http429Retries,
    deferred: chunkReport.deferred,
    validations: chunkReport.validations,
    bundleSize: chunkReport.bundleSize,
    queueExhausted: chunkReport.queueExhausted,
  }, null, 2));

  const hardFail = Object.entries(chunkReport.validations)
    .filter(([k, v]) => k !== 'count' && v === 'FAIL');
  if (hardFail.length) {
    progress.stoppedReason = `validation-failed:${hardFail.map(([k]) => k).join(',')}`;
    fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));
    console.error(`STOP: validation failed — ${progress.stoppedReason}`);
    process.exit(1);
  }

  if (newly === 0) {
    progress.stoppedReason = chunkReport.queueExhausted
      ? 'queue-exhausted-no-new-imports'
      : 'no-new-imports-remaining-candidates-filtered';
    fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));
    console.error(`STOP: ${progress.stoppedReason}`);
    break;
  }

  if (chunkReport.queueExhausted && newly < CHUNK) {
    progress.stoppedReason = 'queue-exhausted-after-partial-chunk';
    fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));
    console.error(`STOP: queue exhausted after importing ${newly} in final chunk`);
    break;
  }

  // Soft performance guard: Germany markers growing past ~15k with SH alone is a signal
  if (chunkReport.germanyMarkers > 16000) {
    progress.stoppedReason = `performance-marker-ceiling:${chunkReport.germanyMarkers}`;
    fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));
    console.error(`STOP: marker ceiling reached (${chunkReport.germanyMarkers})`);
    break;
  }
}

progress.finishedAt = new Date().toISOString();
progress.finalGenerated = countGenerated();
progress.finalGermanyMarkers = germanyMarkerEstimate();
fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));
console.error('\n========== CONTINUATION FINISHED ==========');
console.error(JSON.stringify({
  chunks: progress.chunks.length,
  totals: progress.totals,
  finalGenerated: progress.finalGenerated,
  finalGermanyMarkers: progress.finalGermanyMarkers,
  stoppedReason: progress.stoppedReason,
}, null, 2));
