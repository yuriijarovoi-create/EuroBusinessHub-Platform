import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const base = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

const SEED_FILES = [
  'data/cities.ts',
  'data/europeBusinessCitiesExtra.ts',
  'features/map/data/germany/germanyCitiesExtra.ts',
  'features/map/data/germany/germanyCitiesDense.ts',
  'features/map/data/germany/germanyLocalNodes.generated.ts',
  'features/map/data/germany/germanyLocalNodesRural.generated.ts',
  'features/map/data/germany/germanyRegionalClusters.generated.ts',
];

const NAME_ALIASES = new Map([
  ['cologne', 'köln'],
  ['koeln', 'köln'],
  ['munich', 'münchen'],
  ['muenchen', 'münchen'],
  ['nuremberg', 'nürnberg'],
  ['nuernberg', 'nürnberg'],
  ['hanover', 'hannover'],
  ['frankfurt', 'frankfurt am main'],
  ['freiburg', 'freiburg im breisgau'],
  ['muenster', 'münster'],
  ['luebeck', 'lübeck'],
  ['goettingen', 'göttingen'],
  ['wuerzburg', 'würzburg'],
  ['tuebingen', 'tübingen'],
  ['saarbruecken', 'saarbrücken'],
  ['duesseldorf', 'düsseldorf'],
]);

function normalizeName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function parseCities() {
  const cities = [];
  for (const f of SEED_FILES) {
    const src = fs.readFileSync(path.join(base, f), 'utf8');
    // de('id', 'Name', lat, lng, ...
    for (const m of src.matchAll(/de\(\s*['"]([a-z0-9_]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*([\d.]+)\s*,\s*([\d.]+)/g)) {
      cities.push({ id: m[1], name: m[2], lat: +m[3], lng: +m[4], source: f });
    }
    // id: "x", name: "Y", lat: n, lng: n
    for (const m of src.matchAll(/id:\s*['"]([a-z0-9_]+)['"][\s\S]*?name:\s*['"]([^'"]+)['"][\s\S]*?lat:\s*([\d.]+)[\s\S]*?lng:\s*([\d.]+)/g)) {
      if (!cities.some((c) => c.id === m[1] && c.source === f)) {
        cities.push({ id: m[1], name: m[2], lat: +m[3], lng: +m[4], source: f });
      }
    }
    // core cities id: 'x', name: 'Y', ... lat: n, lng: n
    for (const m of src.matchAll(/id:\s*'([a-z0-9_]+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?countryCode:\s*'DE'[\s\S]*?lat:\s*([\d.]+)[\s\S]*?lng:\s*([\d.]+)/g)) {
      if (!cities.some((c) => c.id === m[1])) {
        cities.push({ id: m[1], name: m[2], lat: +m[3], lng: +m[4], source: f });
      }
    }
  }
  return cities;
}

function parseBundeslandMap() {
  const src = fs.readFileSync(path.join(base, 'features/map/data/germany/bundeslandData.ts'), 'utf8');
  const map = {};
  for (const m of src.matchAll(/^\s{2}([a-z_]+):\s*'(DE-[A-Z]{2})'/gm)) {
    map[m[1]] = m[2];
  }
  // spread from local/cluster maps - parse export
  const localSrc = fs.readFileSync(path.join(base, 'features/map/data/germany/germanyLocalNodes.ts'), 'utf8');
  return { handMap: map };
}

function parseRoutes() {
  const src = fs.readFileSync(path.join(base, 'features/map/data/germany/germanyRoutes.ts'), 'utf8');
  const routes = new Set();
  for (const m of src.matchAll(/\['([a-z_]+)',\s*'([a-z_]+)',\s*'([a-z]+)'/g)) {
    routes.add(`${m[1]}|${m[2]}|${m[3]}`);
    routes.add(`${m[2]}|${m[1]}|${m[3]}`);
  }
  return routes;
}

function parseEnrichment() {
  const src = fs.readFileSync(path.join(base, 'features/map/data/germany/germanyCityEnrichment.ts'), 'utf8');
  return new Set([...src.matchAll(/^\s{2}([a-z_]+):\s*\{/gm)].map((m) => m[1]));
}

// Reference cities per Bundesland (major + regional — not exhaustive, for gap analysis)
const BL_REFERENCE = {
  'DE-BW': ['stuttgart', 'karlsruhe', 'mannheim', 'freiburg', 'heidelberg', 'ulm', 'heilbronn', 'pforzheim', 'reutlingen', 'konstanz', 'villingen_schwenningen', 'ravensburg', 'tuebingen', 'aalen', 'esslingen', 'ludwigsburg', 'friedrichshafen', 'offenburg', 'baden_baden', 'lahr', 'balingen', 'calw', 'sigmaringen', 'rottweil', 'schwaebisch_hall', 'crailsheim', 'goeppingen', 'waiblingen', 'leonberg', 'sindelfingen'],
  'DE-BY': ['munich', 'nuremberg', 'augsburg', 'regensburg', 'ingolstadt', 'wuerzburg', 'erlangen', 'fuerth', 'bayreuth', 'bamberg', 'landshut', 'rosenheim', 'kempten', 'passau', 'schweinfurt', 'coburg', 'memmingen', 'hof', 'freising', 'straubing', 'deggendorf', 'aschaffenburg', 'neu_ulm', 'garmisch_partenkirchen', 'traunstein', 'weiden', 'amberg', 'ansbach', 'nuernberg'],
  'DE-NW': ['cologne', 'duesseldorf', 'dortmund', 'essen', 'duisburg', 'bochum', 'wuppertal', 'bonn', 'muenster', 'bielefeld', 'aachen', 'moenchengladbach', 'krefeld', 'oberhausen', 'hagen', 'hamm', 'herne', 'recklinghausen', 'bottrop', 'solingen', 'leverkusen', 'bergisch_gladbach', 'remscheid', 'paderborn', 'siegen', 'guetersloh', 'iserlohn', 'witten', 'ratingen', 'minden'],
  'DE-HE': ['frankfurt', 'wiesbaden', 'darmstadt', 'kassel', 'offenbach', 'hanau', 'giessen', 'marburg', 'fulda', 'ruesselsheim', 'bad_homburg', 'rodgau', 'ruedesheim', 'limburg', 'friedberg', 'dillenburg', 'witzenhausen', 'eschwege', 'bad_vilbel', 'lampertheim'],
  'DE-SN': ['dresden', 'leipzig', 'chemnitz', 'zwickau', 'plauen', 'goerlitz', 'bautzen', 'freiberg', 'pirna', 'riesa', 'meissen', 'grimma', 'borna', 'annaberg_buchholz', 'zittau', 'kamenz', 'hoyerswerda', 'bischofswerda', 'glauchau', 'mittweida'],
  'DE-NI': ['hanover', 'braunschweig', 'oldenburg', 'osnabrueck', 'wolfsburg', 'goettingen', 'hildesheim', 'salzgitter', 'celle', 'lueneburg', 'wilhelmshaven', 'emden', 'delmenhorst', 'hameln', 'lingen', 'nordhorn', 'wolfenbuettel', 'goslar', 'gifhorn', 'cuxhaven'],
  'DE-BB': ['potsdam', 'cottbus', 'brandenburg', 'frankfurt_oder', 'bernau', 'falkensee', 'oranienburg', 'eberswalde', 'schwedt', 'neuruppin', 'senftenberg', 'spremberg', 'luckenwalde', 'rathenow', 'wittenberge', 'finsterwalde', 'forst', 'strausberg', 'werder'],
  'DE-TH': ['erfurt', 'jena', 'gera', 'weimar', 'gotha', 'eisenach', 'nordhausen', 'suhl', 'ilmenau', 'arnstadt', 'rudolstadt', 'saalfeld', 'sondershausen', 'muhlhausen', 'apolda', 'altenburg', 'meiningen', 'sonneberg', 'greiz', 'zeulenroda'],
  'DE-RP': ['mainz', 'ludwigshafen', 'koblenz', 'trier', 'kaiserslautern', 'worms', 'neuwied', 'speyer', 'bad_kreuznach', 'landau_pfalz', 'pirmasens', 'zweibruecken', 'andernach', 'bingen', 'cochem', 'wittlich', 'idar_oberstein', 'alzey', 'mayen', 'frankenthal'],
  'DE-SH': ['kiel', 'luebeck', 'flensburg', 'neumuenster', 'norderstedt', 'elmshorn', 'pinneberg', 'itzehoe', 'wedel', 'ahrensburg', 'geesthacht', 'rendsburg', 'husum', 'schleswig', 'eckernfoerde', 'heide', 'bad_oldesloe', 'sylt'],
  'DE-SL': ['saarbruecken', 'neunkirchen', 'homburg', 'voelklingen', 'sankt_ingbert', 'saarlouis', 'merzig', 'st_wendel', 'dillingen', 'lebach', 'blieskastel', 'ottweiler', 'st_ingbert'],
  'DE-MV': ['rostock', 'schwerin', 'neubrandenburg', 'stralsund', 'greifswald', 'wismar', 'guestrow', 'wittenberge_mv', 'parchim', 'anklam', 'demmin', 'ribnitz', 'sassnitz', 'buehlitz', 'waren'],
  'DE-ST': ['magdeburg', 'halle', 'dessau', 'wernigerode', 'halberstadt', 'quedlinburg', 'stendal', 'wittenberg', 'naumburg', 'merseburg', 'bernburg', 'koethen', 'sangerhausen', 'aschersleben', 'zeitz', 'weissenfels', 'bitterfeld'],
  'DE-HB': ['bremen', 'bremerhaven'],
  'DE-HH': ['hamburg'],
  'DE-BE': ['berlin'],
};

const cities = parseCities();
const uniqueById = new Map();
for (const c of cities) {
  if (!uniqueById.has(c.id)) uniqueById.set(c.id, c);
  else uniqueById.get(c.id).sources = [...(uniqueById.get(c.id).sources || [uniqueById.get(c.id).source]), c.source];
}

// Duplicate detection
const byNormName = new Map();
const duplicateCandidates = [];
for (const c of uniqueById.values()) {
  const norm = normalizeName(c.name);
  const alias = NAME_ALIASES.get(c.id) ?? norm;
  const key = alias;
  if (byNormName.has(key) && byNormName.get(key).id !== c.id) {
    duplicateCandidates.push({ a: byNormName.get(key), b: c });
  } else {
    byNormName.set(key, c);
  }
}

// Coord proximity duplicates
for (const [idA, a] of uniqueById) {
  for (const [idB, b] of uniqueById) {
    if (idA >= idB) continue;
    const dlat = Math.abs(a.lat - b.lat);
    const dlng = Math.abs(a.lng - b.lng);
    if (dlat < 0.02 && dlng < 0.02 && normalizeName(a.name) !== normalizeName(b.name)) {
      duplicateCandidates.push({ a, b, reason: 'coords' });
    }
  }
}

const blMapSrc = fs.readFileSync(path.join(base, 'features/map/data/germany/bundeslandData.ts'), 'utf8');
const cityToBl = {};
for (const m of blMapSrc.matchAll(/^\s{2}([a-z_]+):\s*'(DE-[A-Z]{2})'/gm)) cityToBl[m[1]] = m[2];

// Count per BL
const blCounts = {};
for (const id of uniqueById.keys()) {
  const bl = cityToBl[id] ?? 'UNKNOWN';
  blCounts[bl] = (blCounts[bl] ?? 0) + 1;
}

// Gap analysis vs reference
const blGaps = {};
for (const [bl, refs] of Object.entries(BL_REFERENCE)) {
  const existing = refs.filter((id) => uniqueById.has(id));
  const missing = refs.filter((id) => !uniqueById.has(id));
  blGaps[bl] = { existing: existing.length, total: refs.length, missing, pct: Math.round((existing.length / refs.length) * 100) };
}

const enrichIds = parseEnrichment();
const deCities = [...uniqueById.values()].filter((c) => {
  const src = fs.readFileSync(path.join(base, 'features/map/data/germany/bundeslandData.ts'), 'utf8');
  return cityToBl[c.id];
});

console.log('=== GERMANY ANALYSIS ===');
console.log('Raw city records scanned:', cities.length);
console.log('Unique city ids:', uniqueById.size);
console.log('Mapped to Bundesland:', deCities.length);
console.log('Curated enrichment entries:', enrichIds.size);
console.log('Duplicate name/coord candidates:', duplicateCandidates.length);
if (duplicateCandidates.length) {
  duplicateCandidates.slice(0, 8).forEach(({ a, b, reason }) =>
    console.log(`  - ${a.id} (${a.name}) vs ${b.id} (${b.name})${reason ? ` [${reason}]` : ''}`),
  );
}

console.log('\n=== BUNDESLAND COVERAGE (hand-mapped cities) ===');
Object.entries(blCounts)
  .sort((a, b) => a[1] - b[1])
  .forEach(([bl, n]) => console.log(`  ${bl}: ${n} cities`));

console.log('\n=== BUNDESLAND GAP vs REFERENCE SET ===');
Object.entries(blGaps)
  .sort((a, b) => a[1].pct - b[1].pct)
  .forEach(([bl, g]) => {
    console.log(`  ${bl}: ${g.existing}/${g.total} (${g.pct}%) — missing: ${g.missing.slice(0, 8).join(', ')}${g.missing.length > 8 ? '...' : ''}`);
  });

const least = Object.entries(blGaps).sort((a, b) => a[1].pct - b[1].pct)[0];
console.log('\n=== LEAST COMPLETE (reference gap) ===');
console.log(least[0], least[1]);
