/**
 * Import OSM-verified Bayern settlements into generated TS files.
 * Reads osm-bayern-places.json, filters duplicates, verifies admin, writes patches.
 *
 * Usage: node scripts/import-bayern-settlements.mjs [--limit=700] [--dry-run] [--fast]
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
  'features/map/data/germany/germanyRegionalClusters.generated.ts',
];

const HUBS = [
  { id: 'munich', name: 'München', lat: 48.137, lng: 11.575 },
  { id: 'nuremberg', name: 'Nürnberg', lat: 49.454, lng: 11.078 },
  { id: 'augsburg', name: 'Augsburg', lat: 48.371, lng: 10.898 },
  { id: 'regensburg', name: 'Regensburg', lat: 49.013, lng: 12.102 },
  { id: 'ingolstadt', name: 'Ingolstadt', lat: 48.763, lng: 11.425 },
  { id: 'wuerzburg', name: 'Würzburg', lat: 49.792, lng: 9.937 },
  { id: 'erlangen', name: 'Erlangen', lat: 49.598, lng: 11.004 },
  { id: 'fuerth', name: 'Fürth', lat: 49.477, lng: 10.989 },
  { id: 'bamberg', name: 'Bamberg', lat: 49.898, lng: 10.902 },
  { id: 'bayreuth', name: 'Bayreuth', lat: 49.948, lng: 11.578 },
  { id: 'landshut', name: 'Landshut', lat: 48.537, lng: 12.152 },
  { id: 'passau', name: 'Passau', lat: 48.574, lng: 13.431 },
  { id: 'rosenheim', name: 'Rosenheim', lat: 47.856, lng: 12.128 },
  { id: 'schweinfurt', name: 'Schweinfurt', lat: 50.049, lng: 10.233 },
  { id: 'aschaffenburg', name: 'Aschaffenburg', lat: 49.977, lng: 9.149 },
  { id: 'kempten', name: 'Kempten', lat: 47.728, lng: 10.315 },
  { id: 'coburg', name: 'Coburg', lat: 50.259, lng: 10.963 },
  { id: 'ansbach', name: 'Ansbach', lat: 49.301, lng: 10.571 },
  { id: 'memmingen', name: 'Memmingen', lat: 47.988, lng: 10.181 },
  { id: 'straubing', name: 'Straubing', lat: 48.881, lng: 12.569 },
  { id: 'deggendorf', name: 'Deggendorf', lat: 48.833, lng: 12.961 },
  { id: 'amberg', name: 'Amberg', lat: 49.443, lng: 11.863 },
  { id: 'weiden', name: 'Weiden in der Oberpfalz', lat: 49.677, lng: 12.157 },
  { id: 'freising', name: 'Freising', lat: 48.403, lng: 11.749 },
  { id: 'erding', name: 'Erding', lat: 48.306, lng: 11.907 },
  { id: 'garmisch_partenkirchen', name: 'Garmisch-Partenkirchen', lat: 47.492, lng: 11.096 },
];

const LANDKREIS_REGION = {
  Hof: 'Fichtelgebirge',
  'Wunsiedel im Fichtelgebirge': 'Fichtelgebirge',
  Kronach: 'Frankenwald',
  Kulmbach: 'Obermain',
  Coburg: 'Itzgrund',
  Lichtenfels: 'Obermain',
  Bayreuth: 'Fränkische Schweiz',
  Bamberg: 'Obermain',
  'Rhön-Grabfeld': 'Rhön',
  'Bad Kissingen': 'Rhön',
  Haßberge: 'Unterfranken',
  'Main-Spessart': 'Spessart',
  Kitzingen: 'Unterfranken',
  'Neustadt an der Waldnaab': 'Oberpfalz',
  Tirschenreuth: 'Oberpfalz',
  Schwandorf: 'Oberpfalz',
  Cham: 'Bayerischer Wald',
  Regen: 'Bayerischer Wald',
  'Freyung-Grafenau': 'Bayerischer Wald',
  'Rottal-Inn': 'Niederbayern',
  'Dingolfing-Landau': 'Niederbayern',
  Kelheim: 'Altmühltal',
  'Straubing-Bogen': 'Niederbayern',
  'Donau-Ries': 'Schwaben',
  Ostallgäu: 'Allgäu',
  Unterallgäu: 'Allgäu',
  Oberallgäu: 'Allgäu',
  Günzburg: 'Schwaben',
  'Dillingen an der Donau': 'Schwaben',
  'Weißenburg-Gunzenhausen': 'Mittelfranken',
  'Neustadt an der Aisch-Bad Windsheim': 'Mittelfranken',
  'Nürnberger Land': 'Mittelfranken',
  Ansbach: 'Mittelfranken',
  Forchheim: 'Fränkische Schweiz',
  'Altötting': 'Inn-Salzach',
  'Berchtesgadener Land': 'Salzach',
  'Bad Tölz-Wolfratshausen': 'Isarwinkel',
  Dachau: 'München Region',
  Ebersberg: 'München Region',
  Erding: 'München Region',
  Freising: 'München Region',
  'Fürstenfeldbruck': 'München Region',
  'Garmisch-Partenkirchen': 'Werdenfelser Land',
  'Landsberg am Lech': 'Lechfeld',
  Miesbach: 'Tegernsee',
  Mühldorf: 'Inn-Salzach',
  'Neuburg-Schrobenhausen': 'Donau',
  Pfaffenhofen: 'Oberbayern',
  Starnberg: 'Fünfseenland',
  Traunstein: 'Chiemgau',
  'Weilheim-Schongau': 'Oberbayern',
  Eichstätt: 'Altmühltal',
  Neumarkt: 'Oberpfalz',
  'Aichach-Friedberg': 'Schwaben',
  Lindau: 'Bodensee',
  'Neu-Ulm': 'Schwaben',
  Miltenberg: 'Unterfranken',
  Roth: 'Mittelfranken',
  Passau: 'Niederbayern',
  Landshut: 'Niederbayern',
  Regensburg: 'Oberpfalz',
  Würzburg: 'Unterfranken',
  Aschaffenburg: 'Unterfranken',
  Augsburg: 'Schwaben',
  Kempten: 'Allgäu',
  München: 'München Region',
  Nürnberg: 'Mittelfranken',
  Ingolstadt: 'Donau',
  Erlangen: 'Mittelfranken',
  Fürth: 'Mittelfranken',
  Schweinfurt: 'Unterfranken',
  Memmingen: 'Schwaben',
  Straubing: 'Niederbayern',
  Amberg: 'Oberpfalz',
  Weiden: 'Oberpfalz',
  Rosenheim: 'Inn-Salzach',
  Deggendorf: 'Niederbayern',
};

const REGIERUNGSBEZIRK_BY_LK = {
  Hof: 'Oberfranken',
  'Wunsiedel im Fichtelgebirge': 'Oberfranken',
  Kronach: 'Oberfranken',
  Kulmbach: 'Oberfranken',
  Coburg: 'Oberfranken',
  Lichtenfels: 'Oberfranken',
  Bayreuth: 'Oberfranken',
  Bamberg: 'Oberfranken',
  Forchheim: 'Oberfranken',
  'Rhön-Grabfeld': 'Unterfranken',
  'Bad Kissingen': 'Unterfranken',
  Haßberge: 'Unterfranken',
  'Main-Spessart': 'Unterfranken',
  Kitzingen: 'Unterfranken',
  Miltenberg: 'Unterfranken',
  Würzburg: 'Unterfranken',
  Aschaffenburg: 'Unterfranken',
  Schweinfurt: 'Unterfranken',
  'Neustadt an der Waldnaab': 'Oberpfalz',
  Tirschenreuth: 'Oberpfalz',
  Schwandorf: 'Oberpfalz',
  Cham: 'Oberpfalz',
  Regen: 'Niederbayern',
  'Freyung-Grafenau': 'Niederbayern',
  'Rottal-Inn': 'Niederbayern',
  'Dingolfing-Landau': 'Niederbayern',
  Kelheim: 'Niederbayern',
  'Straubing-Bogen': 'Niederbayern',
  Landshut: 'Niederbayern',
  Passau: 'Niederbayern',
  Straubing: 'Niederbayern',
  Deggendorf: 'Niederbayern',
  Neumarkt: 'Oberpfalz',
  Regensburg: 'Oberpfalz',
  Amberg: 'Oberpfalz',
  'Amberg-Sulzbach': 'Oberpfalz',
  Weiden: 'Oberpfalz',
  Ansbach: 'Mittelfranken',
  'Neustadt an der Aisch-Bad Windsheim': 'Mittelfranken',
  'Nürnberger Land': 'Mittelfranken',
  'Weißenburg-Gunzenhausen': 'Mittelfranken',
  Roth: 'Mittelfranken',
  Nürnberg: 'Mittelfranken',
  Fürth: 'Mittelfranken',
  Erlangen: 'Mittelfranken',
  'Donau-Ries': 'Schwaben',
  Ostallgäu: 'Schwaben',
  Unterallgäu: 'Schwaben',
  Oberallgäu: 'Schwaben',
  Günzburg: 'Schwaben',
  'Dillingen an der Donau': 'Schwaben',
  Augsburg: 'Schwaben',
  'Aichach-Friedberg': 'Schwaben',
  Lindau: 'Schwaben',
  'Neu-Ulm': 'Schwaben',
  Kempten: 'Schwaben',
  Memmingen: 'Schwaben',
  Kaufbeuren: 'Schwaben',
  'Altötting': 'Oberbayern',
  'Berchtesgadener Land': 'Oberbayern',
  'Bad Tölz-Wolfratshausen': 'Oberbayern',
  Dachau: 'Oberbayern',
  Ebersberg: 'Oberbayern',
  Erding: 'Oberbayern',
  Freising: 'Oberbayern',
  'Fürstenfeldbruck': 'Oberbayern',
  'Garmisch-Partenkirchen': 'Oberbayern',
  'Landsberg am Lech': 'Oberbayern',
  Miesbach: 'Oberbayern',
  Mühldorf: 'Oberbayern',
  München: 'Oberbayern',
  'Neuburg-Schrobenhausen': 'Oberbayern',
  Pfaffenhofen: 'Oberbayern',
  Rosenheim: 'Oberbayern',
  Starnberg: 'Oberbayern',
  Traunstein: 'Oberbayern',
  'Weilheim-Schongau': 'Oberbayern',
  Eichstätt: 'Oberbayern',
  Ingolstadt: 'Oberbayern',
};

/** Bbox [south, west, north, east] — distribution heuristic only */
const LANDKREIS_BBOX = {
  Hof: [50.05, 11.55, 50.45, 12.15],
  'Wunsiedel im Fichtelgebirge': [49.95, 11.85, 50.25, 12.35],
  Kronach: [50.15, 11.15, 50.45, 11.65],
  Kulmbach: [49.95, 11.35, 50.25, 11.75],
  Coburg: [50.15, 10.85, 50.35, 11.15],
  Lichtenfels: [49.95, 10.95, 50.15, 11.35],
  Bayreuth: [49.85, 11.45, 50.15, 11.85],
  Bamberg: [49.75, 10.65, 50.05, 11.15],
  Forchheim: [49.65, 11.05, 49.85, 11.45],
  'Rhön-Grabfeld': [50.25, 9.85, 50.55, 10.45],
  'Bad Kissingen': [50.05, 9.85, 50.35, 10.25],
  Haßberge: [49.95, 10.45, 50.15, 10.85],
  'Main-Spessart': [49.75, 9.35, 50.05, 9.85],
  Kitzingen: [49.65, 10.05, 49.85, 10.45],
  Miltenberg: [49.65, 8.95, 49.85, 9.35],
  'Neustadt an der Waldnaab': [49.45, 12.05, 49.75, 12.55],
  Tirschenreuth: [49.75, 12.05, 50.05, 12.55],
  Schwandorf: [49.25, 11.95, 49.55, 12.45],
  Cham: [49.05, 12.45, 49.45, 13.05],
  Regen: [48.85, 12.85, 49.25, 13.35],
  'Freyung-Grafenau': [48.65, 13.05, 49.05, 13.65],
  'Rottal-Inn': [48.35, 12.65, 48.65, 13.15],
  'Dingolfing-Landau': [48.45, 12.45, 48.75, 13.05],
  Kelheim: [48.75, 11.65, 49.05, 12.15],
  'Straubing-Bogen': [48.65, 12.35, 48.95, 12.85],
  'Donau-Ries': [48.55, 10.35, 48.95, 11.05],
  Ostallgäu: [47.55, 10.35, 47.85, 11.05],
  Unterallgäu: [47.85, 10.05, 48.15, 10.65],
  Oberallgäu: [47.35, 9.95, 47.75, 10.65],
  Günzburg: [48.25, 10.15, 48.55, 10.65],
  'Dillingen an der Donau': [48.45, 10.35, 48.75, 10.85],
  'Weißenburg-Gunzenhausen': [48.95, 10.55, 49.25, 11.15],
  'Neustadt an der Aisch-Bad Windsheim': [49.35, 10.25, 49.65, 10.85],
  'Nürnberger Land': [49.35, 11.05, 49.65, 11.55],
  Ansbach: [49.15, 10.25, 49.45, 10.85],
  'Altötting': [48.15, 12.55, 48.45, 13.05],
  'Berchtesgadener Land': [47.55, 12.75, 47.75, 13.15],
  'Bad Tölz-Wolfratshausen': [47.55, 11.25, 47.85, 11.75],
  Dachau: [48.15, 11.25, 48.35, 11.55],
  Ebersberg: [47.95, 11.85, 48.15, 12.25],
  Erding: [48.25, 11.75, 48.45, 12.15],
  Freising: [48.35, 11.55, 48.55, 11.95],
  'Fürstenfeldbruck': [48.05, 11.05, 48.25, 11.35],
  'Garmisch-Partenkirchen': [47.35, 10.85, 47.55, 11.25],
  'Landsberg am Lech': [47.95, 10.75, 48.15, 11.15],
  Miesbach: [47.65, 11.65, 47.85, 12.05],
  Mühldorf: [48.15, 12.25, 48.45, 12.75],
  'Neuburg-Schrobenhausen': [48.65, 11.05, 48.95, 11.55],
  Pfaffenhofen: [48.45, 11.25, 48.65, 11.65],
  Starnberg: [47.85, 11.05, 48.05, 11.45],
  Traunstein: [47.75, 12.45, 47.95, 12.85],
  'Weilheim-Schongau': [47.65, 10.85, 47.95, 11.25],
  Eichstätt: [48.85, 11.05, 49.05, 11.45],
  Neumarkt: [49.15, 11.55, 49.45, 12.05],
  Passau: [48.45, 13.25, 48.65, 13.55],
  Landshut: [48.45, 11.95, 48.65, 12.35],
  Regensburg: [48.85, 11.85, 49.15, 12.45],
  Würzburg: [49.65, 9.75, 49.85, 10.05],
  Aschaffenburg: [49.85, 8.95, 50.05, 9.35],
  Augsburg: [48.25, 10.75, 48.45, 11.05],
  'Aichach-Friedberg': [48.25, 10.95, 48.55, 11.25],
  Lindau: [47.45, 9.65, 47.65, 10.05],
  'Neu-Ulm': [48.25, 10.05, 48.45, 10.35],
  Roth: [49.05, 10.95, 49.25, 11.35],
  Deggendorf: [48.75, 12.85, 48.95, 13.15],
};

const LANDKREIS_PRIORITY = [
  'Hof',
  'Wunsiedel im Fichtelgebirge',
  'Kronach',
  'Kulmbach',
  'Coburg',
  'Lichtenfels',
  'Bayreuth',
  'Bamberg',
  'Forchheim',
  'Rhön-Grabfeld',
  'Bad Kissingen',
  'Haßberge',
  'Main-Spessart',
  'Kitzingen',
  'Miltenberg',
  'Neustadt an der Waldnaab',
  'Tirschenreuth',
  'Schwandorf',
  'Cham',
  'Regen',
  'Freyung-Grafenau',
  'Rottal-Inn',
  'Dingolfing-Landau',
  'Kelheim',
  'Straubing-Bogen',
  'Altötting',
  'Mühldorf',
  'Berchtesgadener Land',
  'Traunstein',
  'Bad Tölz-Wolfratshausen',
  'Miesbach',
  'Garmisch-Partenkirchen',
  'Weilheim-Schongau',
  'Landsberg am Lech',
  'Eichstätt',
  'Neuburg-Schrobenhausen',
  'Pfaffenhofen',
  'Donau-Ries',
  'Ostallgäu',
  'Unterallgäu',
  'Oberallgäu',
  'Günzburg',
  'Dillingen an der Donau',
  'Aichach-Friedberg',
  'Lindau',
  'Neu-Ulm',
  'Weißenburg-Gunzenhausen',
  'Neustadt an der Aisch-Bad Windsheim',
  'Nürnberger Land',
  'Ansbach',
  'Roth',
  'Dachau',
  'Ebersberg',
  'Erding',
  'Freising',
  'Fürstenfeldbruck',
  'Starnberg',
  'Neumarkt',
  'Regensburg',
  'Amberg-Sulzbach',
  'Passau',
  'Landshut',
  'Deggendorf',
  'Würzburg',
  'Aschaffenburg',
  'Schweinfurt',
  'Augsburg',
  'Kempten',
  'Memmingen',
];

const BY_BBOX = [47.27, 8.98, 50.56, 13.84];

function normalizeLandkreis(raw) {
  if (!raw) return null;
  return raw
    .replace(/^Landkreis\s+/, '')
    .replace(/^Kreis\s+/, '')
    .replace(/^Stadt\s+/, '')
    .trim();
}

function inferLandkreisSort(lat, lng) {
  const hits = [];
  for (const [lk, [s, w, n, e]] of Object.entries(LANDKREIS_BBOX)) {
    if (lat >= s && lat <= n && lng >= w && lng <= e) hits.push(lk);
  }
  if (hits.length === 0) return 'other';
  for (const p of LANDKREIS_PRIORITY) {
    if (hits.includes(p)) return p;
  }
  return hits[0];
}

function sortPlacesList(list) {
  return [...list].sort((a, b) => {
    const pa = PLACE_PRIORITY[a.place] ?? 9;
    const pb = PLACE_PRIORITY[b.place] ?? 9;
    if (pa !== pb) return pa - pb;
    const popA = a.population ?? 0;
    const popB = b.population ?? 0;
    if (popA !== popB) return popB - popA;
    return a.name.localeCompare(b.name, 'de');
  });
}

function buildDistributedQueue(rawPlaces) {
  const byDistrict = new Map();
  for (const p of rawPlaces) {
    const lk = inferLandkreisSort(p.lat, p.lng);
    if (!byDistrict.has(lk)) byDistrict.set(lk, []);
    byDistrict.get(lk).push(p);
  }
  for (const [lk, list] of byDistrict) {
    byDistrict.set(lk, sortPlacesList(list));
  }

  const districtOrder = [...LANDKREIS_PRIORITY, 'other'];
  const maxRound = Math.max(...[...byDistrict.values()].map((l) => l.length), 0);
  const queue = [];
  for (let round = 0; round < maxRound; round += 1) {
    for (const lk of districtOrder) {
      const list = byDistrict.get(lk);
      if (!list || round >= list.length) continue;
      queue.push(list[round]);
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
    const blocks = src.split(/\{\s*\n/);
    for (const block of blocks) {
      const idM = block.match(/id:\s*['"]([^'"]+)['"]/);
      const nameM = block.match(/name:\s*['"]([^'"]+)['"]/);
      const lkM = block.match(/landkreis:\s*['"]([^'"]+)['"]/);
      if (!idM || !nameM) continue;
      ids.add(slug(nameM[1]));
      if (lkM) {
        const lk = lkM[1];
        const norm = normalizeSettlementName(nameM[1]);
        if (!namesByLandkreis.has(lk)) namesByLandkreis.set(lk, new Set());
        namesByLandkreis.get(lk).add(norm);
      }
    }
  }
  return { ids, coords, namesByLandkreis };
}

function normalizeSettlementName(name) {
  return slug(name.replace(/\s*\([^)]*\)/g, '').trim());
}

function slug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .replace(/_+/g, '_');
}

function distKm(a, b) {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function nearestHub(lat, lng) {
  let best = HUBS[0];
  let bestD = Infinity;
  for (const h of HUBS) {
    const d = distKm({ lat, lng }, h);
    if (d < bestD) {
      bestD = d;
      best = h;
    }
  }
  return best;
}

function estimatePopulation(place, osmPop) {
  if (osmPop && osmPop > 0) return osmPop;
  switch (place) {
    case 'city': return 55000;
    case 'town': return 4500;
    case 'village': return 900;
    case 'hamlet': return 250;
    default: return 800;
  }
}

function inferRegion(landkreis, lat, lng) {
  if (landkreis && LANDKREIS_REGION[landkreis]) return LANDKREIS_REGION[landkreis];
  const lk = inferLandkreisSort(lat, lng);
  if (lk !== 'other' && LANDKREIS_REGION[lk]) return LANDKREIS_REGION[lk];
  const rb = REGIERUNGSBEZIRK_BY_LK[lk];
  if (rb) return rb;
  if (lat < 48.0) return 'Allgäu';
  if (lng > 12.5) return 'Ostbayern';
  if (lng < 10.0) return 'Unterfranken';
  return 'Franken';
}

function coordKey(lat, lng) {
  return `${lat.toFixed(5)},${lng.toFixed(5)}`;
}

function isNearExisting(lat, lng, coords, thresholdKm = 0.05) {
  for (const c of coords) {
    if (distKm({ lat, lng }, c) < thresholdKm) return c.id;
  }
  return null;
}

function asciiName(name) {
  return name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');
}

function hyphenVariant(name) {
  return name.replace(/\s+/g, '-');
}

function spaceVariant(name) {
  return name.replace(/-/g, ' ');
}

function buildAliases(entry) {
  const { name, id } = entry;
  const aliases = new Set();
  const ascii = asciiName(name);
  if (ascii !== name) aliases.add(ascii);
  if (name.includes('-')) aliases.add(spaceVariant(name));
  if (name.includes(' ')) aliases.add(hyphenVariant(name));
  if (name.includes(' an der ')) {
    aliases.add(name.replace(' an der ', ' a.d. '));
    aliases.add(name.replace(' an der ', ' '));
  }
  if (name.includes(' im ')) aliases.add(name.replace(' im ', ' i. '));
  if (name.includes(' in der ')) aliases.add(name.replace(' in der ', ' i.d. '));
  if (name.startsWith('Bad ')) aliases.add(name.replace('Bad ', ''));
  if (name.startsWith('Sankt ')) {
    aliases.add(`St. ${name.slice(6)}`);
    aliases.add(`St ${name.slice(6)}`);
  }
  aliases.delete(name);
  aliases.delete(id);
  return [...aliases].filter(Boolean).slice(0, 6);
}

function scaleMetrics(pop) {
  const companies = Math.max(28, Math.min(120, Math.round(pop / 120)));
  const jobs = Math.max(12, Math.round(companies * 0.38));
  const warehouses = Math.max(1, Math.round(companies / 35));
  const transport = Math.max(8, Math.round(companies * 0.45));
  const marketplace = Math.max(10, Math.round(companies * 0.55));
  const aiScore = Math.min(72, 42 + Math.round(pop / 8000));
  return { companies, jobs, warehouses, transport, marketplace, aiScore };
}

function formatDef(d) {
  const lines = [
    '  {',
    `    id: '${d.id}',`,
    `    name: '${d.name.replace(/'/g, "\\'")}',`,
    `    lat: ${d.lat}, lng: ${d.lng},`,
    `    bundeslandId: 'DE-BY',`,
    `    federalState: 'Bayern',`,
    `    region: '${d.region}',`,
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
  const parts = [`  ${d.id}: { metrics: b(${m.companies}, ${m.jobs}, ${m.warehouses}, ${m.transport}, ${m.marketplace}, ${m.aiScore})`];
  if (d.tourism) parts.push(', tourismScore: 76');
  parts.push(`, logisticsScore: ${Math.min(72, 38 + Math.round(d.population / 6000))}`);
  parts.push(`, infra: { logisticsHubs: ['${d.name.replace(/'/g, "\\'")} Regional'] } },`);
  return parts.join('');
}

function formatAlias(id, aliases) {
  if (!aliases.length) return '';
  const arr = aliases.map((a) => `'${a.replace(/'/g, "\\'")}'`).join(', ');
  return `  ${id}: [${arr}],`;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function reverseVerify(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?${new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'json',
    addressdetails: '1',
    zoom: '10',
  })}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'EuroBusinessHub-Platform/1.0 (bayern-import)' },
  });
  if (!res.ok) return null;
  const d = await res.json();
  const addr = d.address ?? {};
  const state = addr.state ?? '';
  if (!state.includes('Bayern') && !state.includes('Bavaria')) {
    return null;
  }
  const landkreis = normalizeLandkreis(addr.county ?? '');
  const municipality =
    addr.municipality ?? addr.city ?? addr.town ?? addr.village ?? addr.hamlet ?? null;
  return { landkreis: landkreis || null, municipality, display: d.display_name ?? '' };
}

const osmPath = path.join(__dir, 'osm-bayern-places.json');
if (!fs.existsSync(osmPath)) {
  console.error('Run fetch-osm-bayern-overpass.mjs first');
  process.exit(1);
}

const { places: rawPlaces } = JSON.parse(fs.readFileSync(osmPath, 'utf8'));

const places = buildDistributedQueue(rawPlaces);
const { ids: existingIds, coords: existingCoords, namesByLandkreis } = loadExistingIds();
const usedIds = new Set(existingIds);
const usedCoords = new Set(existingCoords.map((c) => coordKey(c.lat, c.lng)));
const usedSlugs = new Map();
const batchNamesByLandkreis = new Map();

const skipped = {
  duplicateId: 0,
  duplicateCoord: 0,
  nearExisting: 0,
  verifyFailed: 0,
  slugCollision: 0,
  duplicateName: 0,
  unsupportedName: 0,
  outsideBayern: 0,
};
const imported = [];
const byLandkreis = {};
const byRegierungsbezirk = {};

for (const p of places) {
  if (imported.length >= LIMIT) break;

  if (SKIP_NAME.test(p.name)) {
    skipped.unsupportedName++;
    continue;
  }
  if (p.place === 'city' && existingIds.has(p.id)) {
    skipped.duplicateId++;
    continue;
  }

  let id = p.id;
  if (existingIds.has(id)) {
    skipped.duplicateId++;
    continue;
  }
  const nameSlug = slug(p.name);
  if (existingIds.has(nameSlug) && nameSlug !== id) {
    skipped.duplicateId++;
    continue;
  }

  const lat = +Number(p.lat).toFixed(6);
  const lng = +Number(p.lng).toFixed(6);
  const ck = coordKey(lat, lng);
  if (usedCoords.has(ck)) {
    skipped.duplicateCoord++;
    continue;
  }
  const near = isNearExisting(lat, lng, existingCoords);
  if (near) {
    skipped.nearExisting++;
    continue;
  }

  if (usedSlugs.has(id)) {
    id = `${id}_${p.osmId}`;
    skipped.slugCollision++;
  }
  if (usedIds.has(id)) {
    skipped.duplicateId++;
    continue;
  }

  let admin;
  if (FAST) {
    const [s, w, n, e] = BY_BBOX;
    if (lat < s || lat > n || lng < w || lng > e) {
      skipped.outsideBayern++;
      continue;
    }
    const lk = inferLandkreisSort(lat, lng);
    admin = { landkreis: lk === 'other' ? null : lk, municipality: p.name, display: p.name };
  } else {
    await sleep(1100);
    admin = await reverseVerify(lat, lng);
    if (!admin) {
      skipped.verifyFailed++;
      console.error(`SKIP verify ${p.name}`);
      continue;
    }
  }

  if (admin.landkreis) {
    const norm = normalizeSettlementName(p.name);
    const existingNames = namesByLandkreis.get(admin.landkreis);
    const batchNames = batchNamesByLandkreis.get(admin.landkreis);
    if (existingNames?.has(norm) || batchNames?.has(norm)) {
      skipped.duplicateName++;
      console.error(`SKIP duplicate name ${p.name} in ${admin.landkreis}`);
      continue;
    }
  }

  const hub = nearestHub(lat, lng);
  const population = estimatePopulation(p.place, p.population);
  const region = inferRegion(admin.landkreis, lat, lng);
  const tourism =
    p.name.startsWith('Bad ') ||
    /allgäu|chiemgau|tegernsee|berchtesgaden|bodensee|fränkische schweiz|rhön|spessart|werdenfelser/i.test(region) ||
    /garmisch|tegernsee|lindau|berchtesgaden/i.test(p.name);

  const entry = {
    id,
    name: p.name,
    lat,
    lng,
    region,
    landkreis: admin.landkreis,
    municipality: admin.municipality,
    nearestMajorCityId: hub.id,
    nearestMajorCity: hub.name,
    population,
    tourism: tourism || undefined,
    place: p.place,
    osmId: p.osmId,
  };

  imported.push(entry);
  usedIds.add(id);
  usedCoords.add(ck);
  usedSlugs.set(p.id, id);
  existingCoords.push({ id, lat, lng });

  const lkKey = admin.landkreis ?? inferLandkreisSort(lat, lng);
  byLandkreis[lkKey] = (byLandkreis[lkKey] ?? 0) + 1;
  const rb = REGIERUNGSBEZIRK_BY_LK[lkKey] ?? 'other';
  byRegierungsbezirk[rb] = (byRegierungsbezirk[rb] ?? 0) + 1;

  if (admin.landkreis) {
    const norm = normalizeSettlementName(p.name);
    if (!batchNamesByLandkreis.has(admin.landkreis)) batchNamesByLandkreis.set(admin.landkreis, new Set());
    batchNamesByLandkreis.get(admin.landkreis).add(norm);
  }
  console.error(`OK ${imported.length}/${LIMIT} ${id} (${p.name})`);
}

imported.sort((a, b) => a.id.localeCompare(b.id));

const report = {
  totalSourceCandidates: rawPlaces.length,
  imported: imported.length,
  skipped,
  byLandkreis,
  byRegierungsbezirk,
  ids: imported.map((i) => i.id),
  first15: imported.slice(0, 15).map((i) => i.id),
  last15: imported.slice(-15).map((i) => i.id),
};

fs.writeFileSync(path.join(__dir, 'osm-bayern-import-result.json'), JSON.stringify({ report, imported }, null, 2));
console.log(JSON.stringify(report, null, 2));

if (DRY || imported.length === 0) process.exit(0);

const nodesPath = path.join(ROOT, 'features/map/data/germany/germanyBayernNodes.generated.ts');
let nodesSrc = fs.readFileSync(nodesPath, 'utf8');
const insertPoint = nodesSrc.lastIndexOf('];');
const newDefs = imported.map(formatDef).join('\n');
const beforeClose = nodesSrc.slice(0, insertPoint).trimEnd();
nodesSrc = `${beforeClose}\n${newDefs}\n${nodesSrc.slice(insertPoint)}`;
fs.writeFileSync(nodesPath, nodesSrc);

const enrichPath = path.join(ROOT, 'features/map/data/germany/germanyBayernEnrichment.ts');
let enrichSrc = fs.readFileSync(enrichPath, 'utf8');
const enrichInsert = enrichSrc.lastIndexOf('};');
const newEnrich = `\n  // ── Bayern batch import (OSM ${new Date().toISOString().slice(0, 10)}) ──\n${imported.map(formatEnrich).join('\n')}\n`;
enrichSrc = `${enrichSrc.slice(0, enrichInsert)}${newEnrich}${enrichSrc.slice(enrichInsert)}`;
fs.writeFileSync(enrichPath, enrichSrc);

const aliasPath = path.join(ROOT, 'features/map/data/citySearchAliases.ts');
let aliasSrc = fs.readFileSync(aliasPath, 'utf8');
const aliasLines = imported
  .map((d) => ({ id: d.id, aliases: buildAliases(d) }))
  .filter((x) => x.aliases.length)
  .map((x) => formatAlias(x.id, x.aliases));
if (aliasLines.length) {
  const slugMarker = 'export const CITY_SEARCH_SLUG_ALIASES';
  const slugIdx = aliasSrc.indexOf(slugMarker);
  const closeIdx = aliasSrc.lastIndexOf('};', slugIdx);
  const newBlock = `\n  // Bayern batch import\n${aliasLines.join('\n')}\n`;
  aliasSrc = `${aliasSrc.slice(0, closeIdx)}${newBlock}${aliasSrc.slice(closeIdx)}`;
  fs.writeFileSync(aliasPath, aliasSrc);
}

console.error(`Patched ${imported.length} settlements into TS files`);
