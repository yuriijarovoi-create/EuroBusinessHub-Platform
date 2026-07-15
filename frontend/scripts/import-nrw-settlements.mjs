/**
 * Import OSM-verified Nordrhein-Westfalen settlements into generated TS files.
 * Usage: node scripts/import-nrw-settlements.mjs [--limit=700] [--dry-run] [--fast]
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
const SKIP_NAME = /^(abtei|kloster|schloss|burg\s|dom\s|hafen\s|bahnhof|flughafen|industrie|hof\s|gut\s|\()/i;

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
  'features/map/data/germany/germanyRegionalClusters.generated.ts',
];

const HUBS = [
  { id: 'cologne', name: 'Köln', lat: 50.938, lng: 6.96 },
  { id: 'duesseldorf', name: 'Düsseldorf', lat: 51.227, lng: 6.773 },
  { id: 'dortmund', name: 'Dortmund', lat: 51.513, lng: 7.465 },
  { id: 'essen', name: 'Essen', lat: 51.455, lng: 7.011 },
  { id: 'duisburg', name: 'Duisburg', lat: 51.434, lng: 6.762 },
  { id: 'bochum', name: 'Bochum', lat: 51.481, lng: 7.216 },
  { id: 'wuppertal', name: 'Wuppertal', lat: 51.256, lng: 7.151 },
  { id: 'muenster', name: 'Münster', lat: 51.961, lng: 7.626 },
  { id: 'bielefeld', name: 'Bielefeld', lat: 52.023, lng: 8.532 },
  { id: 'bonn', name: 'Bonn', lat: 50.737, lng: 7.098 },
  { id: 'aachen', name: 'Aachen', lat: 50.776, lng: 6.083 },
  { id: 'moenchengladbach', name: 'Mönchengladbach', lat: 51.195, lng: 6.442 },
  { id: 'gelsenkirchen', name: 'Gelsenkirchen', lat: 51.517, lng: 7.099 },
  { id: 'krefeld', name: 'Krefeld', lat: 51.338, lng: 6.585 },
  { id: 'oberhausen', name: 'Oberhausen', lat: 51.496, lng: 6.863 },
  { id: 'hagen', name: 'Hagen', lat: 51.367, lng: 7.463 },
  { id: 'paderborn', name: 'Paderborn', lat: 51.718, lng: 8.754 },
  { id: 'leverkusen', name: 'Leverkusen', lat: 51.045, lng: 6.986 },
  { id: 'solingen', name: 'Solingen', lat: 51.172, lng: 7.084 },
  { id: 'herne', name: 'Herne', lat: 51.538, lng: 7.226 },
  { id: 'neuss', name: 'Neuss', lat: 51.198, lng: 6.692 },
  { id: 'recklinghausen', name: 'Recklinghausen', lat: 51.614, lng: 7.197 },
  { id: 'bottrop', name: 'Bottrop', lat: 51.523, lng: 6.925 },
  { id: 'remscheid', name: 'Remscheid', lat: 51.179, lng: 7.189 },
  { id: 'bergisch_gladbach', name: 'Bergisch Gladbach', lat: 50.992, lng: 7.133 },
  { id: 'moers', name: 'Moers', lat: 51.451, lng: 6.632 },
  { id: 'siegen', name: 'Siegen', lat: 50.875, lng: 8.024 },
  { id: 'guetersloh', name: 'Gütersloh', lat: 51.906, lng: 8.385 },
  { id: 'iserlohn', name: 'Iserlohn', lat: 51.375, lng: 7.696 },
  { id: 'wesel', name: 'Wesel', lat: 51.659, lng: 6.617 },
];

const LANDKREIS_REGION = {
  Borken: 'Münsterland',
  Coesfeld: 'Münsterland',
  Steinfurt: 'Münsterland',
  Warendorf: 'Münsterland',
  'Hochsauerlandkreis': 'Sauerland',
  'Siegen-Wittgenstein': 'Sieg',
  Olpe: 'Sauerland',
  Soest: 'Hellweg',
  'Märkischer Kreis': 'Sauerland',
  'Ennepe-Ruhr-Kreis': 'Ruhr',
  Höxter: 'Weserbergland',
  Lippe: 'Ostwestfalen',
  'Minden-Lübbecke': 'Ostwestfalen',
  Herford: 'Ostwestfalen',
  Gütersloh: 'Ostwestfalen',
  Paderborn: 'Ostwestfalen',
  Kleve: 'Niederrhein',
  Wesel: 'Niederrhein',
  Viersen: 'Niederrhein',
  Mettmann: 'Rheinland',
  'Rhein-Kreis Neuss': 'Rheinland',
  Heinsberg: 'Rheinland',
  Düren: 'Rheinland',
  Euskirchen: 'Eifel',
  'Rhein-Erft-Kreis': 'Rheinland',
  'Rhein-Sieg-Kreis': 'Rhein-Sieg',
  'Oberbergischer Kreis': 'Bergisches Land',
  'Rheinisch-Bergischer Kreis': 'Bergisches Land',
  Aachen: 'Städteregion Aachen',
  Recklinghausen: 'Ruhr',
  Münster: 'Münsterland',
  Köln: 'Rheinland',
  Düsseldorf: 'Rheinland',
  Dortmund: 'Ruhr',
  Bielefeld: 'Ostwestfalen',
  Bonn: 'Rhein-Sieg',
};

const REGIERUNGSBEZIRK_BY_LK = {
  Borken: 'Münster', Coesfeld: 'Münster', Steinfurt: 'Münster', Warendorf: 'Münster', Münster: 'Münster',
  'Hochsauerlandkreis': 'Arnsberg', 'Siegen-Wittgenstein': 'Arnsberg', Olpe: 'Arnsberg', Soest: 'Arnsberg',
  'Märkischer Kreis': 'Arnsberg', 'Ennepe-Ruhr-Kreis': 'Arnsberg',
  Höxter: 'Detmold', Lippe: 'Detmold', 'Minden-Lübbecke': 'Detmold', Herford: 'Detmold', Gütersloh: 'Detmold',
  Paderborn: 'Detmold', Bielefeld: 'Detmold',
  Kleve: 'Düsseldorf', Wesel: 'Düsseldorf', Viersen: 'Düsseldorf', Mettmann: 'Düsseldorf',
  'Rhein-Kreis Neuss': 'Düsseldorf', Düsseldorf: 'Düsseldorf', Duisburg: 'Düsseldorf', Krefeld: 'Düsseldorf',
  Mönchengladbach: 'Düsseldorf', Oberhausen: 'Düsseldorf', Remscheid: 'Düsseldorf', Solingen: 'Düsseldorf',
  Wuppertal: 'Düsseldorf', Recklinghausen: 'Münster',
  Heinsberg: 'Köln', Düren: 'Köln', Euskirchen: 'Köln', 'Rhein-Erft-Kreis': 'Köln', 'Rhein-Sieg-Kreis': 'Köln',
  'Oberbergischer Kreis': 'Köln', 'Rheinisch-Bergischer Kreis': 'Köln', Köln: 'Köln', Bonn: 'Köln',
  Leverkusen: 'Köln', 'Bergisch Gladbach': 'Köln', Aachen: 'Köln',
  Dortmund: 'Arnsberg', Bochum: 'Arnsberg', Essen: 'Düsseldorf', Gelsenkirchen: 'Münster', Hagen: 'Arnsberg',
  Hamm: 'Arnsberg', Herne: 'Arnsberg', Bottrop: 'Münster',
};

const LANDKREIS_BBOX = {
  Borken: [51.85, 6.55, 52.25, 7.25],
  Coesfeld: [51.85, 7.05, 52.15, 7.75],
  Steinfurt: [52.05, 7.15, 52.35, 7.85],
  Warendorf: [51.85, 7.65, 52.15, 8.25],
  'Hochsauerlandkreis': [51.05, 7.65, 51.55, 8.65],
  'Siegen-Wittgenstein': [50.75, 7.85, 51.05, 8.45],
  Olpe: [50.95, 7.55, 51.25, 8.05],
  Soest: [51.45, 7.85, 51.75, 8.45],
  'Märkischer Kreis': [51.25, 7.25, 51.55, 7.85],
  'Ennepe-Ruhr-Kreis': [51.35, 7.25, 51.55, 7.55],
  Höxter: [51.65, 8.95, 51.95, 9.55],
  Lippe: [51.85, 8.55, 52.15, 9.25],
  'Minden-Lübbecke': [52.05, 8.45, 52.35, 9.05],
  Herford: [52.05, 8.45, 52.25, 8.85],
  Gütersloh: [51.75, 8.15, 52.05, 8.65],
  Paderborn: [51.55, 8.55, 51.95, 9.25],
  Kleve: [51.65, 5.95, 52.05, 6.55],
  Wesel: [51.45, 6.35, 51.75, 6.95],
  Viersen: [51.15, 6.15, 51.45, 6.55],
  Mettmann: [51.15, 6.75, 51.35, 7.15],
  'Rhein-Kreis Neuss': [51.05, 6.45, 51.25, 6.85],
  Heinsberg: [50.95, 5.95, 51.15, 6.35],
  Düren: [50.65, 6.25, 50.95, 6.85],
  Euskirchen: [50.45, 6.45, 50.75, 7.05],
  'Rhein-Erft-Kreis': [50.75, 6.55, 51.05, 7.05],
  'Rhein-Sieg-Kreis': [50.65, 7.05, 50.95, 7.55],
  'Oberbergischer Kreis': [50.95, 7.15, 51.15, 7.65],
  'Rheinisch-Bergischer Kreis': [50.95, 7.05, 51.15, 7.35],
  Aachen: [50.65, 5.95, 50.95, 6.25],
  Recklinghausen: [51.45, 6.95, 51.75, 7.45],
};

const LANDKREIS_PRIORITY = [
  'Borken', 'Coesfeld', 'Steinfurt', 'Warendorf',
  'Hochsauerlandkreis', 'Siegen-Wittgenstein', 'Olpe', 'Soest', 'Märkischer Kreis',
  'Höxter', 'Lippe', 'Minden-Lübbecke', 'Herford', 'Gütersloh', 'Paderborn',
  'Kleve', 'Wesel', 'Viersen', 'Heinsberg', 'Düren', 'Euskirchen',
  'Rhein-Erft-Kreis', 'Rhein-Sieg-Kreis', 'Oberbergischer Kreis', 'Rheinisch-Bergischer Kreis',
  'Aachen', 'Mettmann', 'Rhein-Kreis Neuss', 'Ennepe-Ruhr-Kreis', 'Recklinghausen',
];

const NRW_BBOX = [50.32, 5.87, 52.53, 9.46];

function slug(name) {
  return name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').replace(/_+/g, '_');
}

function normalizeLandkreis(raw) {
  if (!raw) return null;
  return raw.replace(/^Landkreis\s+/, '').replace(/^Kreis\s+/, '').replace(/^Stadt\s+/, '')
    .replace(/^Städteregion\s+/, '').trim();
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
  if (lng < 6.5) return 'Niederrhein';
  if (lat > 51.8) return 'Münsterland';
  if (lng > 8.5) return 'Ostwestfalen';
  return 'Rheinland';
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
    `    lat: ${d.lat}, lng: ${d.lng},`, `    bundeslandId: 'DE-NW',`,
    `    federalState: 'Nordrhein-Westfalen',`, `    region: '${d.region}',`,
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
  const res = await fetch(url, { headers: { 'User-Agent': 'EuroBusinessHub-Platform/1.0 (nrw-import)' } });
  if (!res.ok) return null;
  const d = await res.json();
  const state = d.address?.state ?? '';
  if (!state.includes('Nordrhein-Westfalen') && !state.includes('North Rhine-Westphalia')) return null;
  return {
    landkreis: normalizeLandkreis(d.address?.county ?? '') || null,
    municipality: d.address?.municipality ?? d.address?.city ?? d.address?.town ?? d.address?.village ?? null,
  };
}

const osmPath = path.join(__dir, 'osm-nrw-places.json');
if (!fs.existsSync(osmPath)) { console.error('Run fetch-osm-nrw-overpass.mjs first'); process.exit(1); }

const { places: rawPlaces } = JSON.parse(fs.readFileSync(osmPath, 'utf8'));
const places = buildDistributedQueue(rawPlaces);
const { ids: existingIds, coords: existingCoords, namesByLandkreis } = loadExistingIds();
const usedIds = new Set(existingIds);
const usedCoords = new Set(existingCoords.map((c) => coordKey(c.lat, c.lng)));
const usedSlugs = new Map();
const batchNamesByLandkreis = new Map();
const skipped = { duplicateId: 0, duplicateCoord: 0, nearExisting: 0, verifyFailed: 0, slugCollision: 0, duplicateName: 0, unsupportedName: 0, outsideNrw: 0 };
const imported = [];
const byLandkreis = {};
const byRegierungsbezirk = {};

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

  if (usedSlugs.has(id)) { id = `${id}_${p.osmId}`; skipped.slugCollision++; }
  if (usedIds.has(id)) { skipped.duplicateId++; continue; }

  let admin;
  if (FAST) {
    const [s, w, n, e] = NRW_BBOX;
    if (lat < s || lat > n || lng < w || lng > e) { skipped.outsideNrw++; continue; }
    const lk = inferLandkreisSort(lat, lng);
    admin = { landkreis: lk === 'other' ? null : lk, municipality: p.name };
  } else {
    await sleep(1100);
    admin = await reverseVerify(lat, lng);
    if (!admin) { skipped.verifyFailed++; continue; }
  }

  if (admin.landkreis) {
    const norm = slug(p.name.replace(/\s*\([^)]*\)/g, '').trim());
    if (namesByLandkreis.get(admin.landkreis)?.has(norm) || batchNamesByLandkreis.get(admin.landkreis)?.has(norm)) {
      skipped.duplicateName++; continue;
    }
  }

  const hub = nearestHub(lat, lng);
  const population = estimatePopulation(p.place, p.population);
  const region = inferRegion(admin.landkreis, lat, lng);
  const tourism = p.name.startsWith('Bad ') || /eifel|sauerland|münsterland|teutoburger/i.test(region);

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
  const rb = REGIERUNGSBEZIRK_BY_LK[lkKey] ?? 'other';
  byRegierungsbezirk[rb] = (byRegierungsbezirk[rb] ?? 0) + 1;

  if (admin.landkreis) {
    const norm = slug(p.name.replace(/\s*\([^)]*\)/g, '').trim());
    if (!batchNamesByLandkreis.has(admin.landkreis)) batchNamesByLandkreis.set(admin.landkreis, new Set());
    batchNamesByLandkreis.get(admin.landkreis).add(norm);
  }
  console.error(`OK ${imported.length}/${LIMIT} ${id} (${p.name})`);
}

imported.sort((a, b) => a.id.localeCompare(b.id));
const report = {
  totalSourceCandidates: rawPlaces.length, imported: imported.length, skipped,
  byLandkreis, byRegierungsbezirk,
  first15: imported.slice(0, 15).map((i) => i.id),
  last15: imported.slice(-15).map((i) => i.id),
};
fs.writeFileSync(path.join(__dir, 'osm-nrw-import-result.json'), JSON.stringify({ report, imported }, null, 2));
console.log(JSON.stringify(report, null, 2));

if (DRY || imported.length === 0) process.exit(0);

const nodesPath = path.join(ROOT, 'features/map/data/germany/germanyNordrheinWestfalenNodes.generated.ts');
let nodesSrc = fs.readFileSync(nodesPath, 'utf8');
const ip = nodesSrc.lastIndexOf('];');
nodesSrc = `${nodesSrc.slice(0, ip).trimEnd()}\n${imported.map(formatDef).join('\n')}\n${nodesSrc.slice(ip)}`;
fs.writeFileSync(nodesPath, nodesSrc);

const enrichPath = path.join(ROOT, 'features/map/data/germany/germanyNordrheinWestfalenEnrichment.ts');
let enrichSrc = fs.readFileSync(enrichPath, 'utf8');
const ei = enrichSrc.lastIndexOf('};');
enrichSrc = `${enrichSrc.slice(0, ei)}\n  // ── NRW batch import (OSM ${new Date().toISOString().slice(0, 10)}) ──\n${imported.map(formatEnrich).join('\n')}\n${enrichSrc.slice(ei)}`;
fs.writeFileSync(enrichPath, enrichSrc);

const aliasPath = path.join(ROOT, 'features/map/data/citySearchAliases.ts');
let aliasSrc = fs.readFileSync(aliasPath, 'utf8');
const aliasLines = imported.map((d) => ({ id: d.id, aliases: buildAliases(d) })).filter((x) => x.aliases.length)
  .map((x) => `  ${x.id}: [${x.aliases.map((a) => `'${a.replace(/'/g, "\\'")}'`).join(', ')}],`);
if (aliasLines.length) {
  const slugIdx = aliasSrc.indexOf('export const CITY_SEARCH_SLUG_ALIASES');
  const closeIdx = aliasSrc.lastIndexOf('};', slugIdx);
  aliasSrc = `${aliasSrc.slice(0, closeIdx)}\n  // Nordrhein-Westfalen batch import\n${aliasLines.join('\n')}\n${aliasSrc.slice(closeIdx)}`;
  fs.writeFileSync(aliasPath, aliasSrc);
}
console.error(`Patched ${imported.length} settlements into TS files`);
