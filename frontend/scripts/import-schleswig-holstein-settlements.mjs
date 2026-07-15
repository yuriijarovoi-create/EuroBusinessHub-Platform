/**
 * Import OSM-verified Schleswig-Holstein settlements into generated TS files.
 * Usage:
 *   node scripts/import-schleswig-holstein-settlements.mjs [--limit=700] [--dry-run] [--fast]
 *   node scripts/import-schleswig-holstein-settlements.mjs --from-cache
 *   node scripts/import-schleswig-holstein-settlements.mjs --resume
 *
 * Nominatim: sequential only, >=1.2s delay, persistent verification cache, checkpoint after each candidate.
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dir, '..', 'src');
const LIMIT = parseInt(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? '700', 10);
const DRY = process.argv.includes('--dry-run');
const FAST = process.argv.includes('--fast');
const FROM_CACHE = process.argv.includes('--from-cache');
const RESUME = process.argv.includes('--resume') || process.argv.includes('--from-cache');
const MIN_DELAY_MS = 1200;
const USER_AGENT = 'EuroBusinessHub-Platform/1.0 (schleswig-holstein-import; contact=geo-data-import)';
const BACKOFF_429 = [30_000, 60_000, 120_000, 300_000];
const MAX_RETRIES = 4;

const CACHE_PATH = path.join(__dir, 'osm-schleswig-holstein-verification-cache.json');
const CHECKPOINT_PATH = path.join(__dir, 'osm-schleswig-holstein-checkpoint.json');
const RESULT_PATH = path.join(__dir, 'osm-schleswig-holstein-import-result.json');

const PLACE_PRIORITY = { town: 0, village: 1, hamlet: 2, city: 3 };
const SKIP_NAME = /^(abtei|kloster|schloss|burg\s|dom\s|hafen\s|bahnhof|flughafen|industrie|hof\s|gut\s|camping|windpark|strand|düne|leuchtturm|fähre|marina|naturschutz|\()/i;

const SEED_FILES = [
  'data/cities.ts',
  'features/map/data/germany/germanyCitiesDense.ts',
  'features/map/data/germany/germanyCitiesExtra.ts',
  'features/map/data/germany/germanyLocalNodes.generated.ts',
  'features/map/data/germany/germanyLocalNodesRural.generated.ts',
  'features/map/data/germany/germanyRheinlandPfalzNodes.generated.ts',
  'features/map/data/germany/germanySaarlandNodes.generated.ts',
  'features/map/data/germany/germanyHessenNodes.generated.ts',
  'features/map/data/germany/germanyBadenWuerttembergNodes.generated.ts',
  'features/map/data/germany/germanyBayernNodes.generated.ts',
  'features/map/data/germany/germanyNordrheinWestfalenNodes.generated.ts',
  'features/map/data/germany/germanyNiedersachsenNodes.generated.ts',
  'features/map/data/germany/germanySchleswigHolsteinNodes.generated.ts',
  'features/map/data/germany/germanyRegionalClusters.generated.ts',
];

const HUBS = [
  { id: 'kiel', name: 'Kiel', lat: 54.323, lng: 10.139 },
  { id: 'hamburg', name: 'Hamburg', lat: 53.551, lng: 9.993 },
  { id: 'luebeck', name: 'Lübeck', lat: 53.866, lng: 10.687 },
  { id: 'flensburg', name: 'Flensburg', lat: 54.784, lng: 9.439 },
  { id: 'neumuenster', name: 'Neumünster', lat: 54.071, lng: 9.984 },
  { id: 'husum', name: 'Husum', lat: 54.476, lng: 9.051 },
  { id: 'rendsburg', name: 'Rendsburg', lat: 54.303, lng: 9.664 },
  { id: 'itzehoe', name: 'Itzehoe', lat: 53.925, lng: 9.515 },
  { id: 'heide', name: 'Heide', lat: 54.196, lng: 9.098 },
  { id: 'schleswig', name: 'Schleswig', lat: 54.515, lng: 9.549 },
  { id: 'norderstedt', name: 'Norderstedt', lat: 53.706, lng: 9.998 },
  { id: 'elmshorn', name: 'Elmshorn', lat: 53.753, lng: 9.653 },
];

const LANDKREIS_REGION = {
  Nordfriesland: 'Nordfriesland',
  'Schleswig-Flensburg': 'Schleswig',
  Dithmarschen: 'Dithmarschen',
  'Rendsburg-Eckernförde': 'MIT',
  Ostholstein: 'Ostholstein',
  'Herzogtum Lauenburg': 'Lauenburg',
  Plön: 'Holstein',
  Steinburg: 'Stör',
  Segeberg: 'Holstein',
  Stormarn: 'Hamburg Region',
  Pinneberg: 'Hamburg Region',
  Flensburg: 'Nord',
  Kiel: 'Kiel',
  Lübeck: 'Lübeck',
  Neumünster: 'Holstein',
};

// Approximate Kreis bboxes [south, west, north, east]
const LANDKREIS_BBOX = {
  Nordfriesland: [54.35, 8.20, 55.10, 9.20],
  'Schleswig-Flensburg': [54.40, 9.10, 54.95, 10.00],
  Dithmarschen: [53.90, 8.70, 54.40, 9.40],
  'Rendsburg-Eckernförde': [54.10, 9.30, 54.60, 10.20],
  Ostholstein: [53.95, 10.40, 54.55, 11.35],
  'Herzogtum Lauenburg': [53.40, 10.20, 53.80, 10.95],
  Plön: [54.05, 10.05, 54.45, 10.70],
  Steinburg: [53.75, 9.20, 54.10, 9.75],
  Segeberg: [53.75, 9.80, 54.15, 10.40],
  Stormarn: [53.55, 10.00, 53.85, 10.55],
  Pinneberg: [53.55, 9.45, 53.85, 10.00],
  Flensburg: [54.75, 9.35, 54.85, 9.55],
  Kiel: [54.28, 10.05, 54.42, 10.25],
  Lübeck: [53.80, 10.55, 53.95, 10.90],
  Neumünster: [54.03, 9.90, 54.12, 10.05],
  Helgoland: [54.16, 7.85, 54.20, 7.92],
};

const LANDKREIS_PRIORITY = [
  'Nordfriesland', 'Schleswig-Flensburg', 'Dithmarschen', 'Rendsburg-Eckernförde',
  'Ostholstein', 'Herzogtum Lauenburg', 'Plön', 'Steinburg', 'Segeberg',
  'Stormarn', 'Pinneberg',
  'Flensburg', 'Kiel', 'Lübeck', 'Neumünster', 'Helgoland',
];

/** Soft caps after Nominatim assignment — keep Hamburg belt from dominating Batch 1 */
const LANDKREIS_CAPS = {
  Nordfriesland: 85,
  'Schleswig-Flensburg': 85,
  Dithmarschen: 75,
  'Rendsburg-Eckernförde': 85,
  Ostholstein: 70,
  'Herzogtum Lauenburg': 55,
  Plön: 55,
  Steinburg: 55,
  Segeberg: 45,
  Stormarn: 40,
  Pinneberg: 35,
  Flensburg: 8,
  Kiel: 8,
  Lübeck: 12,
  Neumünster: 5,
  Helgoland: 3,
};

const ISLAND_BBOX = {
  Sylt: [54.85, 8.25, 55.05, 8.55],
  Föhr: [54.65, 8.45, 54.75, 8.60],
  Amrum: [54.62, 8.28, 54.70, 8.40],
  Fehmarn: [54.40, 10.95, 54.55, 11.30],
  Pellworm: [54.48, 8.60, 54.55, 8.75],
  Helgoland: [54.16, 7.85, 54.20, 7.92],
};

// Mainland SH bbox (Helgoland handled separately via island / Nominatim)
const SH_BBOX = [53.35, 8.20, 55.10, 11.40];

const MAJOR_EXCLUDE = [
  'kiel', 'luebeck', 'flensburg', 'neumuenster', 'norderstedt', 'elmshorn',
  'pinneberg', 'ahrensburg', 'itzehoe', 'wedel', 'geesthacht', 'rendsburg',
  'husum', 'schleswig', 'bad_oldesloe', 'eckernfoerde', 'heide',
];

function slug(name) {
  return name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').replace(/_+/g, '_');
}

function normalizeLandkreis(raw) {
  if (!raw) return null;
  let s = raw.replace(/^Landkreis\s+/, '').replace(/^Kreis\s+/, '').replace(/^Stadt\s+/, '')
    .replace(/^Region\s+/, '').trim();
  const aliases = {
    'Herzogtum Lauenburg': 'Herzogtum Lauenburg',
    Lauenburg: 'Herzogtum Lauenburg',
    'Schleswig-Flensburg': 'Schleswig-Flensburg',
    'Rendsburg-Eckernförde': 'Rendsburg-Eckernförde',
    'Rendsburg-Eckernforde': 'Rendsburg-Eckernförde',
  };
  if (aliases[s]) return aliases[s];
  return s;
}

function inBbox(lat, lng, [s, w, n, e]) {
  return lat >= s && lat <= n && lng >= w && lng <= e;
}

function detectIsland(lat, lng, name) {
  for (const [island, bbox] of Object.entries(ISLAND_BBOX)) {
    if (inBbox(lat, lng, bbox)) return island;
  }
  // Avoid false positives like Föhrden-Barl / Lentföhrden (mainland)
  if (/\bföhrden\b|\bfoehrden\b/i.test(name)) return null;
  if (/wyk auf föhr|wyk auf foehr|^helgoland$|hallig/i.test(name)) {
    if (/helgoland/i.test(name)) return 'Helgoland';
    if (/hallig/i.test(name)) return name;
    return 'Föhr';
  }
  return null;
}

function isCoastal(lat, lng, name, island) {
  if (island) return true;
  // North Sea west coast / Wadden
  if (lng < 9.15 && lat > 53.95) return true;
  // Baltic east / Förde / Fehmarn belt
  if (lng > 10.0 && lat > 54.2) return true;
  if (lng > 10.6 && lat > 53.9) return true;
  if (/siel|hafen|strand|küste|foerde|förde|ostsee|nordsee/i.test(name)) return true;
  return false;
}

function inferLandkreisSort(lat, lng) {
  if (inBbox(lat, lng, ISLAND_BBOX.Helgoland)) return 'Helgoland';
  const hits = [];
  for (const [lk, bbox] of Object.entries(LANDKREIS_BBOX)) {
    if (lk === 'Helgoland') continue;
    if (inBbox(lat, lng, bbox)) hits.push(lk);
  }
  if (!hits.length) return 'other';
  // Prefer smaller / more specific kreisfreie Stadt boxes when overlapping
  const prefer = ['Flensburg', 'Kiel', 'Lübeck', 'Neumünster', 'Helgoland'];
  for (const p of prefer) if (hits.includes(p)) return p;
  for (const p of LANDKREIS_PRIORITY) if (hits.includes(p)) return p;
  return hits[0];
}

function sortPlacesList(list) {
  return [...list].sort((a, b) => {
    const pa = PLACE_PRIORITY[a.place] ?? 9;
    const pb = PLACE_PRIORITY[b.place] ?? 9;
    if (pa !== pb) return pa - pb;
    return (b.population ?? 0) - (a.population ?? 0) || a.name.localeCompare(b.name, 'de');
  });
}

function buildDistributedQueue(rawPlaces) {
  const byDistrict = new Map();
  const islands = [];
  for (const p of rawPlaces) {
    if (detectIsland(p.lat, p.lng, p.name) || inBbox(p.lat, p.lng, ISLAND_BBOX.Helgoland)) {
      islands.push(p);
      continue;
    }
    const lk = inferLandkreisSort(p.lat, p.lng);
    if (!byDistrict.has(lk)) byDistrict.set(lk, []);
    byDistrict.get(lk).push(p);
  }
  for (const [lk, list] of byDistrict) byDistrict.set(lk, sortPlacesList(list));
  const order = [...LANDKREIS_PRIORITY, 'other'];
  const maxRound = Math.max(...[...byDistrict.values()].map((l) => l.length), 0);
  const queue = [...sortPlacesList(islands)];
  for (let r = 0; r < maxRound; r++) {
    for (const lk of order) {
      const list = byDistrict.get(lk);
      if (list && r < list.length) queue.push(list[r]);
    }
  }
  return queue;
}

function loadExistingIds() {
  const ids = new Set();
  const coords = [];
  const namesByLandkreis = new Map();
  for (const f of SEED_FILES) {
    const fullPath = path.join(ROOT, f);
    if (!fs.existsSync(fullPath)) continue;
    const src = fs.readFileSync(fullPath, 'utf8');
    for (const m of src.matchAll(/(?:de\(\s*['"]|id:\s*['"])([a-z0-9_]+)/g)) ids.add(m[1]);
    for (const m of src.matchAll(/id:\s*['"]([^'"]+)['"][\s\S]*?lat:\s*([\d.-]+)[\s\S]*?lng:\s*([\d.-]+)/g)) {
      coords.push({ id: m[1], lat: +m[2], lng: +m[3] });
    }
    for (const block of src.split(/\{\s*\n/)) {
      const idM = block.match(/id:\s*['"]([^'"]+)['"]/);
      const nameM = block.match(/name:\s*['"]([^'"]+)['"]/);
      const lkM = block.match(/landkreis:\s*['"]([^'"]+)['"]/);
      if (!idM || !nameM) continue;
      ids.add(slug(nameM[1]));
      if (lkM) {
        const norm = slug(nameM[1].replace(/\s*\([^)]*\)/g, '').trim());
        if (!namesByLandkreis.has(lkM[1])) namesByLandkreis.set(lkM[1], new Set());
        namesByLandkreis.get(lkM[1]).add(norm);
      }
    }
  }
  for (const id of MAJOR_EXCLUDE) ids.add(id);
  return { ids, coords, namesByLandkreis };
}

function distKm(a, b) {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function nearestHub(lat, lng) {
  let best = HUBS[0], bestD = Infinity;
  for (const h of HUBS) {
    const d = distKm({ lat, lng }, h);
    if (d < bestD) { bestD = d; best = h; }
  }
  return best;
}

function estimatePopulation(place, osmPop) {
  if (osmPop && osmPop > 0) return osmPop;
  return { city: 55000, town: 4500, village: 900, hamlet: 250 }[place] ?? 800;
}

function inferRegion(landkreis, lat, lng, island) {
  if (island === 'Helgoland' || landkreis === 'Helgoland') return 'Helgoland';
  if (island && (island === 'Sylt' || island === 'Föhr' || island === 'Amrum' || island === 'Pellworm' || /hallig/i.test(String(island)))) {
    return 'Nordfriesland';
  }
  if (island === 'Fehmarn') return 'Ostholstein';
  if (landkreis && LANDKREIS_REGION[landkreis]) return LANDKREIS_REGION[landkreis];
  const lk = inferLandkreisSort(lat, lng);
  if (lk !== 'other' && LANDKREIS_REGION[lk]) return LANDKREIS_REGION[lk];
  if (lng < 9.2 && lat > 54.3) return 'Nordfriesland';
  if (lat > 54.5) return 'Schleswig';
  if (lng > 10.5) return 'Ostholstein';
  return 'Schleswig-Holstein';
}

function coordKey(lat, lng) { return `${lat.toFixed(5)},${lng.toFixed(5)}`; }

function isNearExisting(lat, lng, coords, thresholdKm = 0.05) {
  for (const c of coords) if (distKm({ lat, lng }, c) < thresholdKm) return c.id;
  return null;
}

function buildAliases({ name, id }) {
  const aliases = new Set();
  const ascii = name.normalize('NFD').replace(/\p{M}/gu, '').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
  if (ascii !== name) aliases.add(ascii);
  if (name.includes('-')) aliases.add(name.replace(/-/g, ' '));
  if (name.includes(' ')) aliases.add(name.replace(/\s+/g, '-'));
  if (name.startsWith('Bad ')) aliases.add(name.replace('Bad ', ''));
  aliases.delete(name); aliases.delete(id);
  return [...aliases].filter(Boolean).slice(0, 6);
}

function scaleMetrics(pop) {
  const companies = Math.max(28, Math.min(120, Math.round(pop / 120)));
  return {
    companies, jobs: Math.max(12, Math.round(companies * 0.38)),
    warehouses: Math.max(1, Math.round(companies / 35)),
    transport: Math.max(8, Math.round(companies * 0.45)),
    marketplace: Math.max(10, Math.round(companies * 0.55)),
    aiScore: Math.min(72, 42 + Math.round(pop / 8000)),
  };
}

function formatDef(d) {
  const lines = [
    '  {', `    id: '${d.id}',`, `    name: '${d.name.replace(/'/g, "\\'")}',`,
    `    lat: ${d.lat}, lng: ${d.lng},`, `    bundeslandId: 'DE-SH',`,
    `    federalState: 'Schleswig-Holstein',`, `    region: '${d.region}',`,
  ];
  if (d.landkreis) lines.push(`    landkreis: '${d.landkreis.replace(/'/g, "\\'")}',`);
  if (d.municipality) lines.push(`    municipality: '${d.municipality.replace(/'/g, "\\'")}',`);
  lines.push(
    `    nearestMajorCityId: '${d.nearestMajorCityId}',`,
    `    nearestMajorCity: '${d.nearestMajorCity.replace(/'/g, "\\'")}',`,
    `    population: ${d.population},`,
  );
  if (d.tourism) lines.push('    tourism: true,');
  lines.push('  },');
  return lines.join('\n');
}

function formatEnrich(d) {
  const m = scaleMetrics(d.population);
  let s = `  ${d.id}: { metrics: b(${m.companies}, ${m.jobs}, ${m.warehouses}, ${m.transport}, ${m.marketplace}, ${m.aiScore})`;
  if (d.tourism) s += ', tourismScore: 76';
  s += `, logisticsScore: ${Math.min(72, 38 + Math.round(d.population / 6000))}, infra: { logisticsHubs: ['${d.name.replace(/'/g, "\\'")} Regional'] } },`;
  return s;
}

async function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function cacheKey(osmId, lat, lng) {
  return `node/${osmId}@${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`;
}

function loadVerificationCache() {
  if (!fs.existsSync(CACHE_PATH)) return { updatedAt: null, entries: {} };
  try {
    const raw = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
    return { updatedAt: raw.updatedAt ?? null, entries: raw.entries ?? {} };
  } catch {
    return { updatedAt: null, entries: {} };
  }
}

function saveVerificationCache(cache) {
  const payload = {
    updatedAt: new Date().toISOString(),
    count: Object.keys(cache.entries).length,
    entries: cache.entries,
  };
  fs.writeFileSync(CACHE_PATH, JSON.stringify(payload, null, 2));
}

function loadCheckpoint() {
  if (!fs.existsSync(CHECKPOINT_PATH)) {
    return {
      updatedAt: null,
      importedCount: 0,
      processedKeys: [],
      deferred: [],
      failed: [],
      byLandkreis: {},
    };
  }
  try {
    return JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf8'));
  } catch {
    return {
      updatedAt: null,
      importedCount: 0,
      processedKeys: [],
      deferred: [],
      failed: [],
      byLandkreis: {},
    };
  }
}

function saveCheckpoint(cp) {
  cp.updatedAt = new Date().toISOString();
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(cp, null, 2));
}

function parseAdminFromNominatim(d, lat, lng) {
  if (inBbox(lat, lng, ISLAND_BBOX.Helgoland)) {
    return { landkreis: 'Helgoland', municipality: 'Helgoland', ok: true };
  }
  const state = d.address?.state ?? '';
  if (!state.includes('Schleswig-Holstein') && !state.includes('Slesvig-Holsten')) {
    return { ok: false, reason: 'outside-sh' };
  }
  const country = d.address?.country_code ?? '';
  if (country && country !== 'de') return { ok: false, reason: 'outside-de' };
  let landkreis = normalizeLandkreis(d.address?.county ?? d.address?.state_district ?? '') || null;
  const city = d.address?.city ?? d.address?.town ?? '';
  if (!landkreis) {
    if (/Flensburg/i.test(city)) landkreis = 'Flensburg';
    else if (/^Kiel$/i.test(city)) landkreis = 'Kiel';
    else if (/Lübeck|Lubeck/i.test(city)) landkreis = 'Lübeck';
    else if (/Neumünster|Neumuenster/i.test(city)) landkreis = 'Neumünster';
    else if (/Helgoland|Heligoland/i.test(city) || /Helgoland/i.test(d.address?.island ?? '')) landkreis = 'Helgoland';
  }
  return {
    ok: true,
    landkreis,
    municipality: d.address?.municipality ?? d.address?.city ?? d.address?.town ?? d.address?.village ?? null,
  };
}

async function reverseVerify(lat, lng, { osmId } = {}) {
  if (inBbox(lat, lng, ISLAND_BBOX.Helgoland)) {
    return { landkreis: 'Helgoland', municipality: 'Helgoland', status: 'ok' };
  }

  let attempt = 0;
  while (attempt <= MAX_RETRIES) {
    const url = `https://nominatim.openstreetmap.org/reverse?${new URLSearchParams({
      lat: String(lat), lon: String(lng), format: 'json', addressdetails: '1', zoom: '10',
    })}`;
    let res;
    try {
      res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    } catch (err) {
      if (attempt >= MAX_RETRIES) {
        return { status: 'failed', reason: `network:${err?.message ?? 'error'}` };
      }
      const wait = BACKOFF_429[Math.min(attempt, BACKOFF_429.length - 1)];
      console.error(`NET ${osmId ?? '?'} attempt=${attempt + 1} wait=${wait}ms`);
      await sleep(wait);
      attempt++;
      continue;
    }

    if (res.status === 429) {
      if (attempt >= MAX_RETRIES) {
        return { status: 'deferred', reason: 'http-429' };
      }
      const retryAfter = Number(res.headers.get('retry-after'));
      const wait = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : BACKOFF_429[Math.min(attempt, BACKOFF_429.length - 1)];
      console.error(`429 ${osmId ?? '?'} attempt=${attempt + 1} wait=${wait}ms`);
      await sleep(wait);
      attempt++;
      continue;
    }

    if (res.status >= 500) {
      if (attempt >= MAX_RETRIES) {
        return { status: 'failed', reason: `http-${res.status}` };
      }
      const wait = BACKOFF_429[Math.min(attempt, BACKOFF_429.length - 1)];
      console.error(`5xx ${osmId ?? '?'} status=${res.status} wait=${wait}ms`);
      await sleep(wait);
      attempt++;
      continue;
    }

    if (!res.ok) return { status: 'rejected', reason: `http-${res.status}` };

    const d = await res.json();
    const parsed = parseAdminFromNominatim(d, lat, lng);
    if (!parsed.ok) return { status: 'rejected', reason: parsed.reason };
    return {
      status: 'ok',
      landkreis: parsed.landkreis,
      municipality: parsed.municipality,
    };
  }
  return { status: 'deferred', reason: 'max-retries' };
}

function underCap(landkreis, byLandkreis) {
  if (!landkreis) return true;
  const cap = LANDKREIS_CAPS[landkreis];
  if (cap == null) return (byLandkreis[landkreis] ?? 0) < 40;
  return (byLandkreis[landkreis] ?? 0) < cap;
}

// Fast path: materialize from existing verified import-result / cache without Nominatim
if (FROM_CACHE) {
  console.error('Delegating to materialize-schleswig-holstein-from-cache.mjs (no Nominatim)');
  const r = spawnSync(process.execPath, [path.join(__dir, 'materialize-schleswig-holstein-from-cache.mjs'), `--limit=${LIMIT}`], {
    stdio: 'inherit',
    cwd: path.join(__dir, '..'),
  });
  process.exit(r.status ?? 1);
}

const osmPath = path.join(__dir, 'osm-schleswig-holstein-places.json');
if (!fs.existsSync(osmPath)) { console.error('Run fetch-osm-schleswig-holstein-overpass.mjs first'); process.exit(1); }

const { places: rawPlaces } = JSON.parse(fs.readFileSync(osmPath, 'utf8'));
const places = buildDistributedQueue(rawPlaces);
const { ids: existingIds, coords: existingCoords, namesByLandkreis } = loadExistingIds();
const usedIds = new Set(existingIds);
const usedCoords = new Set(existingCoords.map((c) => coordKey(c.lat, c.lng)));
const usedSlugs = new Map();
const batchNamesByLandkreis = new Map();
const skipped = {
  duplicateId: 0, duplicateCoord: 0, nearExisting: 0, verifyFailed: 0,
  slugCollision: 0, duplicateName: 0, unsupportedName: 0, outsideSh: 0,
  kreisCap: 0, deferred429: 0, cacheHit: 0,
};
const imported = [];
const byLandkreis = {};
let coastalCount = 0;
let islandCount = 0;
const deferred = [];
const failed = [];

const verificationCache = loadVerificationCache();
const checkpoint = loadCheckpoint();
const processedKeys = new Set(checkpoint.processedKeys ?? []);

// Seed imported from prior checkpoint / result when resuming
if (RESUME && fs.existsSync(RESULT_PATH)) {
  try {
    const prev = JSON.parse(fs.readFileSync(RESULT_PATH, 'utf8'));
    for (const e of prev.imported ?? []) {
      if (imported.length >= LIMIT) break;
      if (!e?.id || usedIds.has(e.id)) continue;
      imported.push(e);
      usedIds.add(e.id);
      usedCoords.add(coordKey(e.lat, e.lng));
      usedSlugs.set(e.id, e.id);
      existingCoords.push({ id: e.id, lat: e.lat, lng: e.lng });
      const lkKey = e.landkreis ?? inferLandkreisSort(e.lat, e.lng);
      byLandkreis[lkKey] = (byLandkreis[lkKey] ?? 0) + 1;
      if (e.coastal) coastalCount++;
      if (e.island) islandCount++;
      if (e.landkreis) {
        const norm = slug(e.name.replace(/\s*\([^)]*\)/g, '').trim());
        if (!batchNamesByLandkreis.has(e.landkreis)) batchNamesByLandkreis.set(e.landkreis, new Set());
        batchNamesByLandkreis.get(e.landkreis).add(norm);
      }
      if (e.osmId) processedKeys.add(cacheKey(e.osmId, e.lat, e.lng));
    }
    console.error(`Resume seed: ${imported.length} records from prior result`);
  } catch (err) {
    console.error('Resume seed failed:', err?.message);
  }
}

// Pre-write analysis counters for candidates that pass local filters
let verifiedCandidates = imported.length;
const candidateByLk = { ...byLandkreis };

for (const p of places) {
  if (imported.length >= LIMIT) break;
  if (SKIP_NAME.test(p.name)) { skipped.unsupportedName++; continue; }
  if (p.place === 'city' && existingIds.has(p.id)) { skipped.duplicateId++; continue; }

  let id = p.id;
  if (existingIds.has(id) || (existingIds.has(slug(p.name)) && slug(p.name) !== id)) {
    skipped.duplicateId++; continue;
  }

  const lat = +Number(p.lat).toFixed(6);
  const lng = +Number(p.lng).toFixed(6);
  const ck = coordKey(lat, lng);
  const key = cacheKey(p.osmId, lat, lng);
  if (usedCoords.has(ck)) { skipped.duplicateCoord++; continue; }
  if (isNearExisting(lat, lng, existingCoords)) { skipped.nearExisting++; continue; }
  if (processedKeys.has(key) && imported.some((e) => e.osmId === p.osmId)) continue;

  const islandHint = detectIsland(lat, lng, p.name);
  const inMainland = inBbox(lat, lng, SH_BBOX);
  const inHelgoland = inBbox(lat, lng, ISLAND_BBOX.Helgoland);
  if (!inMainland && !inHelgoland && !islandHint) { skipped.outsideSh++; continue; }

  let admin;
  if (FAST) {
    const lk = inferLandkreisSort(lat, lng);
    admin = { landkreis: lk === 'other' ? null : lk, municipality: p.name, status: 'ok' };
  } else if (verificationCache.entries[key]?.status === 'ok') {
    const hit = verificationCache.entries[key];
    admin = { landkreis: hit.landkreis, municipality: hit.municipality, status: 'ok' };
    skipped.cacheHit++;
  } else if (verificationCache.entries[key]?.status === 'deferred') {
    deferred.push({ osmId: p.osmId, id: p.id, name: p.name, reason: verificationCache.entries[key].reason ?? 'cached-deferred' });
    skipped.deferred429++;
    processedKeys.add(key);
    continue;
  } else {
    await sleep(MIN_DELAY_MS);
    admin = await reverseVerify(lat, lng, { osmId: p.osmId });
    if (admin.status === 'ok') {
      verificationCache.entries[key] = {
        osmId: p.osmId,
        id: p.id,
        name: p.name,
        lat,
        lng,
        landkreis: admin.landkreis,
        municipality: admin.municipality,
        verified: true,
        status: 'ok',
      };
      saveVerificationCache(verificationCache);
    } else if (admin.status === 'deferred') {
      verificationCache.entries[key] = {
        osmId: p.osmId, id: p.id, name: p.name, lat, lng,
        status: 'deferred', reason: admin.reason,
      };
      saveVerificationCache(verificationCache);
      deferred.push({ osmId: p.osmId, id: p.id, name: p.name, reason: admin.reason });
      skipped.deferred429++;
      processedKeys.add(key);
      checkpoint.processedKeys = [...processedKeys];
      checkpoint.importedCount = imported.length;
      checkpoint.deferred = deferred;
      checkpoint.failed = failed;
      checkpoint.byLandkreis = { ...byLandkreis };
      saveCheckpoint(checkpoint);
      fs.writeFileSync(RESULT_PATH, JSON.stringify({
        report: {
          totalSourceCandidates: rawPlaces.length,
          verifiedCandidates,
          imported: imported.length,
          skipped,
          byLandkreis,
          coastalCount,
          islandCount,
          deferred: deferred.length,
          failed: failed.length,
          mode: 'nominatim-reverse',
          resumeSafe: true,
        },
        imported,
        deferred,
        failed,
      }, null, 2));
      continue;
    } else if (admin.status === 'failed') {
      failed.push({ osmId: p.osmId, id: p.id, name: p.name, reason: admin.reason });
      skipped.verifyFailed++;
      processedKeys.add(key);
      checkpoint.processedKeys = [...processedKeys];
      checkpoint.importedCount = imported.length;
      checkpoint.failed = failed;
      saveCheckpoint(checkpoint);
      continue;
    } else {
      skipped.verifyFailed++;
      processedKeys.add(key);
      continue;
    }
  }

  if (!admin || admin.status !== 'ok') { skipped.verifyFailed++; continue; }

  verifiedCandidates++;
  const lkPre = admin.landkreis ?? inferLandkreisSort(lat, lng);
  candidateByLk[lkPre] = (candidateByLk[lkPre] ?? 0) + 1;

  if (!underCap(lkPre, byLandkreis)) {
    skipped.kreisCap++;
    processedKeys.add(key);
    continue;
  }

  if (usedIds.has(id) || usedSlugs.has(id)) {
    const disambig = admin.landkreis ? slug(admin.landkreis) : `sh_${p.osmId}`;
    const candidate = `${id}_${disambig}`;
    if (usedIds.has(candidate)) { skipped.duplicateId++; continue; }
    id = candidate;
    skipped.slugCollision++;
  }
  if (usedIds.has(id)) { skipped.duplicateId++; continue; }

  if (admin.landkreis) {
    const norm = slug(p.name.replace(/\s*\([^)]*\)/g, '').trim());
    if (namesByLandkreis.get(admin.landkreis)?.has(norm) || batchNamesByLandkreis.get(admin.landkreis)?.has(norm)) {
      skipped.duplicateName++; continue;
    }
  }

  const hub = nearestHub(lat, lng);
  const population = estimatePopulation(p.place, p.population);
  const island = islandHint || (admin.landkreis === 'Helgoland' ? 'Helgoland' : null);
  const region = inferRegion(admin.landkreis, lat, lng, island);
  const coastal = isCoastal(lat, lng, p.name, island);
  const tourism = p.name.startsWith('Bad ')
    || Boolean(island)
    || /nordsee|ostsee|sylt|föhr|amrum|fehmarn|hallig|helgoland|insel/i.test(p.name)
    || coastal && /bad |kurort|strand/i.test(p.name);

  const entry = {
    id, name: p.name, lat, lng, region,
    landkreis: admin.landkreis, municipality: admin.municipality,
    nearestMajorCityId: hub.id, nearestMajorCity: hub.name, population,
    tourism: tourism || undefined, osmId: p.osmId,
    coastal: coastal || undefined, island: island || undefined,
  };

  imported.push(entry);
  usedIds.add(id); usedCoords.add(ck); usedSlugs.set(p.id, id);
  existingCoords.push({ id, lat, lng });
  processedKeys.add(key);
  if (coastal) coastalCount++;
  if (island) islandCount++;

  const lkKey = admin.landkreis ?? inferLandkreisSort(lat, lng);
  byLandkreis[lkKey] = (byLandkreis[lkKey] ?? 0) + 1;

  if (admin.landkreis) {
    const norm = slug(p.name.replace(/\s*\([^)]*\)/g, '').trim());
    if (!batchNamesByLandkreis.has(admin.landkreis)) batchNamesByLandkreis.set(admin.landkreis, new Set());
    batchNamesByLandkreis.get(admin.landkreis).add(norm);
  }

  // Persist progress after every accepted candidate
  checkpoint.processedKeys = [...processedKeys];
  checkpoint.importedCount = imported.length;
  checkpoint.deferred = deferred;
  checkpoint.failed = failed;
  checkpoint.byLandkreis = { ...byLandkreis };
  saveCheckpoint(checkpoint);
  fs.writeFileSync(RESULT_PATH, JSON.stringify({
    report: {
      totalSourceCandidates: rawPlaces.length,
      verifiedCandidates,
      imported: imported.length,
      skipped,
      byLandkreis,
      coastalCount,
      islandCount,
      deferred: deferred.length,
      failed: failed.length,
      mode: FAST ? 'fast-bbox' : 'nominatim-reverse',
      resumeSafe: true,
    },
    imported,
    deferred,
    failed,
  }, null, 2));

  if (imported.length % 25 === 0 || imported.length <= 5) {
    console.error(`OK ${imported.length}/${LIMIT} ${id} (${p.name}) [${lkKey}]${island ? ` island=${island}` : ''}`);
  }
}

imported.sort((a, b) => a.id.localeCompare(b.id));
const report = {
  totalSourceCandidates: rawPlaces.length,
  verifiedCandidates,
  candidateByLk,
  imported: imported.length,
  skipped,
  byLandkreis,
  coastalCount,
  islandCount,
  deferred: deferred.length,
  failed: failed.length,
  first15: imported.slice(0, 15).map((i) => i.id),
  last15: imported.slice(-15).map((i) => i.id),
  landkreisCoverage: Object.keys(byLandkreis).length,
  mode: FAST ? 'fast-bbox' : 'nominatim-reverse',
  resumeSafe: true,
};
fs.writeFileSync(RESULT_PATH, JSON.stringify({ report, imported, deferred, failed }, null, 2));
checkpoint.phase = imported.length >= LIMIT || deferred.length === 0 ? 'complete' : 'partial';
checkpoint.importedCount = imported.length;
saveCheckpoint(checkpoint);
console.log(JSON.stringify(report, null, 2));

if (DRY || imported.length === 0) process.exit(0);

const nodesPath = path.join(ROOT, 'features/map/data/germany/germanySchleswigHolsteinNodes.generated.ts');
const nodesHeader = `/** Schleswig-Holstein Tier-4 local settlements — OSM verified (generated) */
import type { RawLocalNodeDef } from './germanyLocalNodes.generated';

export const GERMANY_SH_NODE_DEFS: RawLocalNodeDef[] = [
`;
fs.writeFileSync(nodesPath, `${nodesHeader}${imported.map(formatDef).join('\n')}\n];\n`);

const enrichPath = path.join(ROOT, 'features/map/data/germany/germanySchleswigHolsteinEnrichment.ts');
const enrichHeader = `import type { MapCityMetrics } from '@shared/types';
import type { GermanyInfrastructure } from '../../types/germanyTypes';

type MetricsSlice = Pick<
  MapCityMetrics,
  'companies' | 'jobs' | 'warehouses' | 'transport' | 'marketplace' | 'aiScore'
>;

export interface SchleswigHolsteinEnrichment {
  metrics: MetricsSlice;
  logisticsScore?: number;
  tourismScore?: number;
  infra?: Partial<GermanyInfrastructure>;
}

function b(c: number, j: number, w: number, t: number, m: number, a: number): MetricsSlice {
  return { companies: c, jobs: j, warehouses: w, transport: t, marketplace: m, aiScore: a };
}

export const GERMANY_SH_ENRICHMENT: Record<string, SchleswigHolsteinEnrichment> = {

  // ── Schleswig-Holstein batch 1 import (OSM ${new Date().toISOString().slice(0, 10)}) ──
`;
fs.writeFileSync(enrichPath, `${enrichHeader}${imported.map(formatEnrich).join('\n')}\n};\n`);

const aliasPath = path.join(ROOT, 'features/map/data/citySearchAliases.ts');
let aliasSrc = fs.readFileSync(aliasPath, 'utf8');
const aliasMarker = '  // Schleswig-Holstein batch 1 import';
const aliasLines = imported.map((d) => ({ id: d.id, aliases: buildAliases(d) })).filter((x) => x.aliases.length)
  .map((x) => `  ${x.id}: [${x.aliases.map((a) => `'${a.replace(/'/g, "\\'")}'`).join(', ')}],`);
if (aliasLines.length) {
  // Replace previous SH batch block if present
  const markerIdx = aliasSrc.indexOf(aliasMarker);
  if (markerIdx !== -1) {
    const afterMarker = aliasSrc.indexOf('\n', markerIdx) + 1;
    const closeIdx = aliasSrc.indexOf('\n};', afterMarker);
    aliasSrc = `${aliasSrc.slice(0, markerIdx)}${aliasMarker}\n${aliasLines.join('\n')}${aliasSrc.slice(closeIdx)}`;
  } else {
    const slugIdx = aliasSrc.indexOf('export const CITY_SEARCH_SLUG_ALIASES');
    const beforeSlug = aliasSrc.lastIndexOf('\n};', slugIdx);
    aliasSrc = `${aliasSrc.slice(0, beforeSlug)}\n${aliasMarker}\n${aliasLines.join('\n')}\n${aliasSrc.slice(beforeSlug)}`;
  }
  fs.writeFileSync(aliasPath, aliasSrc);
}
console.error(`Wrote ${imported.length} settlements into TS files`);
