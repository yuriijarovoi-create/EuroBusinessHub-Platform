/**
 * Verify settlement database: duplicate IDs, duplicate coordinates, Mosel import integrity.
 * Parses seed arrays only (skips *_ENRICH mirror exports).
 * Usage: node scripts/verify-settlements.mjs
 */
import fs from 'fs';

const SEED_FILES = [
  'src/features/map/data/germany/germanyLocalNodes.generated.ts',
  'src/features/map/data/germany/germanyLocalNodesRural.generated.ts',
  'src/features/map/data/germany/germanyRheinlandPfalzNodes.generated.ts',
  'src/features/map/data/germany/germanySaarlandNodes.generated.ts',
  'src/features/map/data/germany/germanyHessenNodes.generated.ts',
  'src/features/map/data/germany/germanyBadenWuerttembergNodes.generated.ts',
  'src/features/map/data/germany/germanyCitiesDense.ts',
];

const LEGACY_DUPLICATE_SLUGS = new Set([
  'bingen_am_rhein',
  'landau_in_der_pfalz',
  'weiden_in_der_oberpfalz',
]);

function seedSourceOnly(text) {
  const enrichMarkers = [
    'export const GERMANY_LOCAL_NODE_ENRICH_IDS',
    'export const GERMANY_LOCAL_NODE_RURAL_ENRICH',
  ];
  let cut = text.length;
  for (const marker of enrichMarkers) {
    const idx = text.indexOf(marker);
    if (idx !== -1) cut = Math.min(cut, idx);
  }
  return text.slice(0, cut);
}

function decimalPlaces(n) {
  const s = String(n);
  const dot = s.indexOf('.');
  return dot === -1 ? 0 : s.length - dot - 1;
}

function coordPrecision(entry) {
  return decimalPlaces(entry.lat) + decimalPlaces(entry.lng);
}

function parseEntries(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const text = seedSourceOnly(raw);
  const entries = [];
  const blocks = text.split(/\{\s*\n/).slice(1);
  for (const block of blocks) {
    const idM = block.match(/id:\s*['"]([^'"]+)['"]/);
    if (!idM) continue;
    if (LEGACY_DUPLICATE_SLUGS.has(idM[1])) continue;
    const nameM = block.match(/name:\s*['"]([^'"]+)['"]/);
    const latM = block.match(/lat:\s*([\d.]+)/);
    const lngM = block.match(/lng:\s*([\d.]+)/);
    if (!latM || !lngM) continue;
    entries.push({
      id: idM[1],
      name: nameM?.[1] ?? idM[1],
      lat: Number(latM[1]),
      lng: Number(lngM[1]),
      file,
    });
  }
  return entries;
}

const rawEntries = SEED_FILES.flatMap(parseEntries);

/** Runtime-equivalent dedupe: one record per id, prefer higher coordinate precision. */
const dedupedById = new Map();
for (const entry of rawEntries) {
  const existing = dedupedById.get(entry.id);
  if (!existing || coordPrecision(entry) > coordPrecision(existing)) {
    dedupedById.set(entry.id, entry);
  }
}
const entries = [...dedupedById.values()];

const rawDupIds = [];
const rawById = new Map();
for (const e of rawEntries) {
  if (LEGACY_DUPLICATE_SLUGS.has(e.id)) continue;
  if (rawById.has(e.id)) rawDupIds.push({ id: e.id, a: rawById.get(e.id), b: e });
  else rawById.set(e.id, e);
}

const coordKey = (lat, lng) => `${lat.toFixed(4)},${lng.toFixed(4)}`;
const byCoord = new Map();
const dupCoords = [];
for (const e of entries) {
  const key = coordKey(e.lat, e.lng);
  if (byCoord.has(key)) dupCoords.push({ coord: key, a: byCoord.get(key), b: e });
  else byCoord.set(key, e);
}

const moselNew = [
  'briedern','mesenich','sankt_aldegund','krov','enkirch','reil','neumagen_dhron','minheim',
  'piesport','niederemmel','kesten','brauneberg','osann_monzel','graach','wehlen','zeltingen_rachtig',
  'erden','urzig','loef','kinheim','koewerich','leiwen','trittenheim','detzem','longuich','mehring',
  'fell','konz','wiltingen','burgen','hatzenport','kattenes','lehmen','niederfell','alken','winningen',
  'bassenheim','urmitz',
];

const missing = moselNew.filter((id) => !dedupedById.has(id));
const report = {
  rawSeedEntries: rawEntries.length,
  dedupedSeedEntries: entries.length,
  uniqueIds: dedupedById.size,
  rawDuplicateIds: rawDupIds.length,
  duplicateCoordinates: dupCoords.filter((d) => d.a.id !== d.b.id),
  legacySlugsExcluded: [...LEGACY_DUPLICATE_SLUGS],
  moselImport: {
    expected: moselNew.length,
    found: moselNew.length - missing.length,
    missing,
  },
};

console.log(JSON.stringify(report, null, 2));
const failed =
  dupCoords.some((d) => d.a.id !== d.b.id) ||
  missing.length > 0 ||
  dedupedById.size !== entries.length;
process.exit(failed ? 1 : 0);
