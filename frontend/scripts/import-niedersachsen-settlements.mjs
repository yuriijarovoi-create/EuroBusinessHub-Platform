/**
 * Import OSM-verified Niedersachsen settlements into generated TS files.
 * Usage: node scripts/import-niedersachsen-settlements.mjs [--limit=700] [--dry-run] [--fast]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dir, '..', 'src');
const LIMIT = parseInt(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? '700', 10);
const DRY = process.argv.includes('--dry-run');
const FAST = process.argv.includes('--fast');

const PLACE_PRIORITY = { town: 0, village: 1, hamlet: 2, city: 3 };
const SKIP_NAME = /^(abtei|kloster|schloss|burg\s|dom\s|hafen\s|bahnhof|flughafen|industrie|hof\s|gut\s|camping|windpark|\()/i;

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
  'features/map/data/germany/germanyRegionalClusters.generated.ts',
];

const HUBS = [
  { id: 'hanover', name: 'Hannover', lat: 52.376, lng: 9.732 },
  { id: 'braunschweig', name: 'Braunschweig', lat: 52.269, lng: 10.521 },
  { id: 'oldenburg', name: 'Oldenburg', lat: 53.144, lng: 8.214 },
  { id: 'osnabrueck', name: 'Osnabrück', lat: 52.279, lng: 8.047 },
  { id: 'wolfsburg', name: 'Wolfsburg', lat: 52.423, lng: 10.787 },
  { id: 'goettingen', name: 'Göttingen', lat: 51.541, lng: 9.916 },
  { id: 'hildesheim', name: 'Hildesheim', lat: 52.151, lng: 9.951 },
  { id: 'salzgitter', name: 'Salzgitter', lat: 52.153, lng: 10.332 },
  { id: 'wilhelmshaven', name: 'Wilhelmshaven', lat: 53.517, lng: 8.106 },
  { id: 'celle', name: 'Celle', lat: 52.622, lng: 10.080 },
  { id: 'lueneburg', name: 'Lüneburg', lat: 53.250, lng: 10.414 },
  { id: 'emden', name: 'Emden', lat: 53.367, lng: 7.206 },
  { id: 'delmenhorst', name: 'Delmenhorst', lat: 53.051, lng: 8.631 },
  { id: 'bremen', name: 'Bremen', lat: 53.079, lng: 8.802 },
  { id: 'hameln', name: 'Hameln', lat: 52.104, lng: 9.357 },
  { id: 'goslar', name: 'Goslar', lat: 51.906, lng: 10.429 },
  { id: 'lingen', name: 'Lingen', lat: 52.521, lng: 7.318 },
  { id: 'nordhorn', name: 'Nordhorn', lat: 52.436, lng: 7.068 },
  { id: 'meppen', name: 'Meppen', lat: 52.691, lng: 7.291 },
  { id: 'papenburg', name: 'Papenburg', lat: 53.077, lng: 7.396 },
  { id: 'cuxhaven', name: 'Cuxhaven', lat: 53.861, lng: 8.694 },
  { id: 'stade', name: 'Stade', lat: 53.594, lng: 9.476 },
  { id: 'vechta', name: 'Vechta', lat: 52.726, lng: 8.286 },
  { id: 'cloppenburg', name: 'Cloppenburg', lat: 52.848, lng: 8.045 },
];

const LANDKREIS_REGION = {
  Emsland: 'Emsland',
  'Grafschaft Bentheim': 'Emsland',
  Osnabrück: 'Osnabrücker Land',
  Cloppenburg: 'Oldenburger Münsterland',
  Vechta: 'Oldenburger Münsterland',
  Oldenburg: 'Oldenburger Land',
  Ammerland: 'Ammerland',
  Friesland: 'Ostfriesland',
  Wesermarsch: 'Wesermarsch',
  Leer: 'Ostfriesland',
  Aurich: 'Ostfriesland',
  Emden: 'Ostfriesland',
  Wilhelmshaven: 'Jadebusen',
  Cuxhaven: 'Elbe-Weser',
  Stade: 'Elbe-Weser',
  'Rotenburg (Wümme)': 'Lüneburger Heide',
  Heidekreis: 'Lüneburger Heide',
  Celle: 'Lüneburger Heide',
  Uelzen: 'Lüneburger Heide',
  'Lüchow-Dannenberg': 'Wendland',
  Lüneburg: 'Lüneburger Heide',
  Harburg: 'Elbe-Weser',
  Gifhorn: 'Braunschweiger Land',
  Helmstedt: 'Braunschweiger Land',
  Wolfenbüttel: 'Braunschweiger Land',
  Braunschweig: 'Braunschweiger Land',
  Salzgitter: 'Braunschweiger Land',
  Wolfsburg: 'Braunschweiger Land',
  Goslar: 'Harz',
  Northeim: 'Südniedersachsen',
  Göttingen: 'Südniedersachsen',
  Holzminden: 'Weserbergland',
  'Hameln-Pyrmont': 'Weserbergland',
  Schaumburg: 'Weserbergland',
  'Nienburg/Weser': 'Mittelweser',
  Diepholz: 'Mittelweser',
  Verden: 'Mittelweser',
  Osterholz: 'Elbe-Weser',
  Peine: 'Braunschweiger Land',
  Hildesheim: 'Hildesheimer Land',
  'Region Hannover': 'Region Hannover',
  Hannover: 'Region Hannover',
  Delmenhorst: 'Oldenburger Land',
};

// Approximate Landkreis bboxes [south, west, north, east] for distribution sorting
const LANDKREIS_BBOX = {
  Emsland: [52.35, 6.85, 53.15, 7.75],
  'Grafschaft Bentheim': [52.30, 6.65, 52.55, 7.25],
  Osnabrück: [52.05, 7.55, 52.75, 8.45],
  Cloppenburg: [52.70, 7.75, 53.05, 8.25],
  Vechta: [52.55, 8.05, 52.85, 8.55],
  Oldenburg: [52.85, 7.95, 53.25, 8.55],
  Ammerland: [53.10, 7.85, 53.35, 8.35],
  Friesland: [53.35, 7.75, 53.70, 8.15],
  Wesermarsch: [53.15, 8.15, 53.55, 8.65],
  Leer: [53.05, 6.50, 53.65, 7.75],
  Aurich: [53.35, 6.90, 53.75, 7.75],
  Emden: [53.33, 7.15, 53.40, 7.25],
  Wilhelmshaven: [53.48, 8.05, 53.58, 8.15],
  Cuxhaven: [53.45, 8.35, 53.90, 9.25],
  Stade: [53.40, 9.15, 53.75, 9.75],
  'Rotenburg (Wümme)': [52.95, 9.05, 53.45, 9.75],
  Heidekreis: [52.65, 9.35, 53.15, 10.15],
  Celle: [52.45, 9.75, 52.95, 10.55],
  Uelzen: [52.75, 10.25, 53.15, 10.95],
  'Lüchow-Dannenberg': [52.85, 10.75, 53.25, 11.65],
  Lüneburg: [53.05, 10.15, 53.45, 10.85],
  Harburg: [53.25, 9.55, 53.55, 10.35],
  Gifhorn: [52.35, 10.25, 52.75, 10.95],
  Helmstedt: [52.10, 10.65, 52.45, 11.15],
  Wolfenbüttel: [51.95, 10.25, 52.25, 10.85],
  Braunschweig: [52.20, 10.45, 52.35, 10.60],
  Salzgitter: [52.05, 10.25, 52.25, 10.45],
  Wolfsburg: [52.35, 10.70, 52.50, 10.85],
  Goslar: [51.70, 10.15, 52.05, 10.70],
  Northeim: [51.55, 9.55, 51.95, 10.15],
  Göttingen: [51.30, 9.55, 51.75, 10.70],
  Holzminden: [51.75, 9.35, 52.05, 9.75],
  'Hameln-Pyrmont': [51.95, 9.15, 52.20, 9.70],
  Schaumburg: [52.15, 8.95, 52.45, 9.35],
  'Nienburg/Weser': [52.45, 8.85, 52.85, 9.45],
  Diepholz: [52.45, 8.25, 53.10, 9.05],
  Verden: [52.85, 8.95, 53.15, 9.45],
  Osterholz: [53.10, 8.55, 53.45, 9.05],
  Peine: [52.25, 10.05, 52.45, 10.45],
  Hildesheim: [51.95, 9.65, 52.25, 10.25],
  'Region Hannover': [52.15, 9.25, 52.55, 10.05],
  Delmenhorst: [53.00, 8.55, 53.10, 8.70],
};

const LANDKREIS_PRIORITY = [
  'Emsland', 'Grafschaft Bentheim', 'Osnabrück', 'Cloppenburg', 'Vechta',
  'Oldenburg', 'Ammerland', 'Friesland', 'Wesermarsch', 'Leer', 'Aurich',
  'Cuxhaven', 'Stade', 'Rotenburg (Wümme)', 'Heidekreis', 'Celle', 'Uelzen',
  'Lüchow-Dannenberg', 'Lüneburg', 'Gifhorn', 'Helmstedt', 'Wolfenbüttel',
  'Goslar', 'Northeim', 'Göttingen', 'Holzminden', 'Hameln-Pyrmont',
  'Schaumburg', 'Nienburg/Weser', 'Diepholz', 'Verden', 'Osterholz', 'Peine',
  'Hildesheim', 'Harburg', 'Region Hannover',
  'Braunschweig', 'Salzgitter', 'Wolfsburg', 'Delmenhorst', 'Emden',
  'Wilhelmshaven',
];

const NI_BBOX = [51.30, 6.65, 53.90, 11.60];

function slug(name) {
  return name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').replace(/_+/g, '_');
}

function normalizeLandkreis(raw) {
  if (!raw) return null;
  let s = raw.replace(/^Landkreis\s+/, '').replace(/^Kreis\s+/, '').replace(/^Stadt\s+/, '')
    .replace(/^Region\s+/, '').trim();
  if (s === 'Hannover') return 'Region Hannover';
  return s;
}

function inferLandkreisSort(lat, lng) {
  const hits = [];
  for (const [lk, [s, w, n, e]] of Object.entries(LANDKREIS_BBOX)) {
    if (lat >= s && lat <= n && lng >= w && lng <= e) hits.push(lk);
  }
  if (!hits.length) return 'other';
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
  for (const p of rawPlaces) {
    const lk = inferLandkreisSort(p.lat, p.lng);
    if (!byDistrict.has(lk)) byDistrict.set(lk, []);
    byDistrict.get(lk).push(p);
  }
  for (const [lk, list] of byDistrict) byDistrict.set(lk, sortPlacesList(list));
  const order = [...LANDKREIS_PRIORITY, 'other'];
  const maxRound = Math.max(...[...byDistrict.values()].map((l) => l.length), 0);
  const queue = [];
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
    for (const m of src.matchAll(/id:\s*['"]([^'"]+)['"][\s\S]*?lat:\s*([\d.]+)[\s\S]*?lng:\s*([\d.]+)/g)) {
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
  // Explicit major-city exclusions (id aliases)
  for (const id of [
    'hanover', 'hannover', 'braunschweig', 'oldenburg', 'osnabrueck', 'wolfsburg',
    'goettingen', 'hildesheim', 'salzgitter', 'wilhelmshaven', 'celle', 'lueneburg',
    'emden', 'delmenhorst',
  ]) ids.add(id);
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

function inferRegion(landkreis, lat, lng) {
  if (landkreis && LANDKREIS_REGION[landkreis]) return LANDKREIS_REGION[landkreis];
  const lk = inferLandkreisSort(lat, lng);
  if (lk !== 'other' && LANDKREIS_REGION[lk]) return LANDKREIS_REGION[lk];
  if (lng < 7.8) return 'Emsland';
  if (lat > 53.3) return 'Ostfriesland';
  if (lat < 51.8) return 'Südniedersachsen';
  if (lng > 10.3) return 'Braunschweiger Land';
  return 'Niedersachsen';
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
    `    lat: ${d.lat}, lng: ${d.lng},`, `    bundeslandId: 'DE-NI',`,
    `    federalState: 'Niedersachsen',`, `    region: '${d.region}',`,
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

async function reverseVerify(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?${new URLSearchParams({
    lat: String(lat), lon: String(lng), format: 'json', addressdetails: '1', zoom: '10',
  })}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'EuroBusinessHub-Platform/1.0 (niedersachsen-import)' } });
  if (!res.ok) return null;
  const d = await res.json();
  const state = d.address?.state ?? '';
  if (!state.includes('Niedersachsen') && !state.includes('Lower Saxony')) return null;
  return {
    landkreis: normalizeLandkreis(d.address?.county ?? d.address?.state_district ?? '') || null,
    municipality: d.address?.municipality ?? d.address?.city ?? d.address?.town ?? d.address?.village ?? null,
  };
}

const osmPath = path.join(__dir, 'osm-niedersachsen-places.json');
if (!fs.existsSync(osmPath)) { console.error('Run fetch-osm-niedersachsen-overpass.mjs first'); process.exit(1); }

const { places: rawPlaces } = JSON.parse(fs.readFileSync(osmPath, 'utf8'));
const places = buildDistributedQueue(rawPlaces);
const { ids: existingIds, coords: existingCoords, namesByLandkreis } = loadExistingIds();
const usedIds = new Set(existingIds);
const usedCoords = new Set(existingCoords.map((c) => coordKey(c.lat, c.lng)));
const usedSlugs = new Map();
const batchNamesByLandkreis = new Map();
const skipped = {
  duplicateId: 0, duplicateCoord: 0, nearExisting: 0, verifyFailed: 0,
  slugCollision: 0, duplicateName: 0, unsupportedName: 0, outsideNi: 0,
};
const imported = [];
const byLandkreis = {};

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
  if (usedCoords.has(ck)) { skipped.duplicateCoord++; continue; }
  if (isNearExisting(lat, lng, existingCoords)) { skipped.nearExisting++; continue; }

  let admin;
  if (FAST) {
    const [s, w, n, e] = NI_BBOX;
    if (lat < s || lat > n || lng < w || lng > e) { skipped.outsideNi++; continue; }
    const lk = inferLandkreisSort(lat, lng);
    admin = { landkreis: lk === 'other' ? null : lk, municipality: p.name };
  } else {
    await sleep(1100);
    admin = await reverseVerify(lat, lng);
    if (!admin) { skipped.verifyFailed++; continue; }
  }

  if (usedIds.has(id) || usedSlugs.has(id)) {
    const disambig = admin.landkreis ? slug(admin.landkreis) : `ni_${p.osmId}`;
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
  const region = inferRegion(admin.landkreis, lat, lng);
  const tourism = p.name.startsWith('Bad ') || /harz|heide|ostfriesland|weserbergland|wendland/i.test(region);

  const entry = {
    id, name: p.name, lat, lng, region,
    landkreis: admin.landkreis, municipality: admin.municipality,
    nearestMajorCityId: hub.id, nearestMajorCity: hub.name, population,
    tourism: tourism || undefined, osmId: p.osmId,
  };

  imported.push(entry);
  usedIds.add(id); usedCoords.add(ck); usedSlugs.set(p.id, id);
  existingCoords.push({ id, lat, lng });

  const lkKey = admin.landkreis ?? inferLandkreisSort(lat, lng);
  byLandkreis[lkKey] = (byLandkreis[lkKey] ?? 0) + 1;

  if (admin.landkreis) {
    const norm = slug(p.name.replace(/\s*\([^)]*\)/g, '').trim());
    if (!batchNamesByLandkreis.has(admin.landkreis)) batchNamesByLandkreis.set(admin.landkreis, new Set());
    batchNamesByLandkreis.get(admin.landkreis).add(norm);
  }
  if (imported.length % 25 === 0 || imported.length <= 5) {
    console.error(`OK ${imported.length}/${LIMIT} ${id} (${p.name}) [${lkKey}]`);
  }
}

imported.sort((a, b) => a.id.localeCompare(b.id));
const report = {
  totalSourceCandidates: rawPlaces.length,
  verifiedAfterDedupe: imported.length + Object.values(skipped).reduce((a, b) => a + b, 0),
  imported: imported.length,
  skipped,
  byLandkreis,
  first15: imported.slice(0, 15).map((i) => i.id),
  last15: imported.slice(-15).map((i) => i.id),
  landkreisCoverage: Object.keys(byLandkreis).length,
};
fs.writeFileSync(path.join(__dir, 'osm-niedersachsen-import-result.json'), JSON.stringify({ report, imported }, null, 2));
console.log(JSON.stringify(report, null, 2));

if (DRY || imported.length === 0) process.exit(0);

const nodesPath = path.join(ROOT, 'features/map/data/germany/germanyNiedersachsenNodes.generated.ts');
const nodesHeader = `/** Niedersachsen Tier-4 local settlements — OSM verified (generated) */
import type { RawLocalNodeDef } from './germanyLocalNodes.generated';

export const GERMANY_NI_NODE_DEFS: RawLocalNodeDef[] = [
`;
fs.writeFileSync(nodesPath, `${nodesHeader}${imported.map(formatDef).join('\n')}\n];\n`);

const enrichPath = path.join(ROOT, 'features/map/data/germany/germanyNiedersachsenEnrichment.ts');
const enrichHeader = `import type { MapCityMetrics } from '@shared/types';
import type { GermanyInfrastructure } from '../../types/germanyTypes';

type MetricsSlice = Pick<
  MapCityMetrics,
  'companies' | 'jobs' | 'warehouses' | 'transport' | 'marketplace' | 'aiScore'
>;

export interface NiedersachsenEnrichment {
  metrics: MetricsSlice;
  logisticsScore?: number;
  tourismScore?: number;
  infra?: Partial<GermanyInfrastructure>;
}

function b(c: number, j: number, w: number, t: number, m: number, a: number): MetricsSlice {
  return { companies: c, jobs: j, warehouses: w, transport: t, marketplace: m, aiScore: a };
}

export const GERMANY_NI_ENRICHMENT: Record<string, NiedersachsenEnrichment> = {

  // ── Niedersachsen batch 1 import (OSM ${new Date().toISOString().slice(0, 10)}) ──
`;
fs.writeFileSync(enrichPath, `${enrichHeader}${imported.map(formatEnrich).join('\n')}\n};\n`);

const aliasPath = path.join(ROOT, 'features/map/data/citySearchAliases.ts');
let aliasSrc = fs.readFileSync(aliasPath, 'utf8');
const aliasLines = imported.map((d) => ({ id: d.id, aliases: buildAliases(d) })).filter((x) => x.aliases.length)
  .map((x) => `  ${x.id}: [${x.aliases.map((a) => `'${a.replace(/'/g, "\\'")}'`).join(', ')}],`);
if (aliasLines.length) {
  const slugIdx = aliasSrc.indexOf('export const CITY_SEARCH_SLUG_ALIASES');
  const closeIdx = aliasSrc.lastIndexOf('};', slugIdx);
  aliasSrc = `${aliasSrc.slice(0, closeIdx)}\n  // Niedersachsen batch 1 import\n${aliasLines.join('\n')}\n${aliasSrc.slice(closeIdx)}`;
  fs.writeFileSync(aliasPath, aliasSrc);
}
console.error(`Wrote ${imported.length} settlements into TS files`);
