import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const base = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

const SEED_FILES = [
  'data/cities.ts',
  'features/map/data/germany/germanyCitiesExtra.ts',
  'features/map/data/germany/germanyCitiesDense.ts',
  'features/map/data/germany/germanyLocalNodes.generated.ts',
  'features/map/data/germany/germanyLocalNodesRural.generated.ts',
  'features/map/data/germany/germanyRegionalClusters.generated.ts',
];

function loadRpCities() {
  const cities = new Map();
  for (const f of SEED_FILES) {
    const src = fs.readFileSync(path.join(base, f), 'utf8');
    const chunks = [];
    for (const m of src.matchAll(/de\(\s*['"]([a-z0-9_]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*([\d.]+)\s*,\s*([\d.]+)/g)) {
      chunks.push({ id: m[1], name: m[2], lat: +m[3], lng: +m[4], file: f });
    }
    for (const m of src.matchAll(/\{\s*\n\s*id:\s*['"]([a-z0-9_]+)['"][\s\S]*?name:\s*['"]([^'"]+)['"][\s\S]*?bundeslandId:\s*['"]DE-RP['"][\s\S]*?lat:\s*([\d.]+)[\s\S]*?lng:\s*([\d.]+)/g)) {
      chunks.push({ id: m[1], name: m[2], lat: +m[3], lng: +m[4], file: f });
    }
    for (const c of chunks) {
      if (!cities.has(c.id)) cities.set(c.id, c);
    }
  }
  // Also scan bundesland map
  const blSrc = fs.readFileSync(path.join(base, 'features/map/data/germany/bundeslandData.ts'), 'utf8');
  const rpIds = [...blSrc.matchAll(/^\s{2}([a-z_]+):\s*'DE-RP'/gm)].map((m) => m[1]);
  const localSrc = fs.readFileSync(path.join(base, 'features/map/data/germany/germanyLocalNodes.ts'), 'utf8');
  return { cities, rpIds: new Set(rpIds) };
}

const REQUESTED = {
  main: [
    ['mainz', 'Mainz'],
    ['ludwigshafen', 'Ludwigshafen am Rhein'],
    ['koblenz', 'Koblenz'],
    ['trier', 'Trier'],
    ['kaiserslautern', 'Kaiserslautern'],
    ['worms', 'Worms'],
    ['neuwied', 'Neuwied'],
    ['speyer', 'Speyer'],
    ['bad_kreuznach', 'Bad Kreuznach'],
    ['frankenthal', 'Frankenthal'],
    ['landau_pfalz', 'Landau in der Pfalz', 'landau_in_der_pfalz'],
    ['pirmasens', 'Pirmasens'],
    ['zweibruecken', 'Zweibrücken'],
    ['andernach', 'Andernach'],
    ['idar_oberstein', 'Idar-Oberstein'],
    ['bingen', 'Bingen am Rhein', 'bingen_am_rhein'],
    ['ingelheim', 'Ingelheim am Rhein'],
    ['mayen', 'Mayen'],
    ['lahnstein', 'Lahnstein'],
    ['germersheim', 'Germersheim'],
  ],
  mosel: [
    ['cochem', 'Cochem'],
    ['zell_an_der_mosel', 'Zell an der Mosel'],
    ['traben_trarbach', 'Traben-Trarbach'],
    ['bernkastel_kues', 'Bernkastel-Kues'],
    ['wittlich', 'Wittlich'],
    ['treis_karden', 'Treis-Karden'],
    ['kaisersesch', 'Kaisersesch'],
    ['alf', 'Alf'],
    ['ediger_eller', 'Ediger-Eller'],
    ['bruttig_fankel', 'Bruttig-Fankel'],
    ['beilstein', 'Beilstein'],
    ['senheim', 'Senheim'],
    ['bremm', 'Bremm'],
    ['bullay', 'Bullay'],
    ['klotten', 'Klotten'],
    ['ernst', 'Ernst'],
    ['valwig', 'Valwig'],
    ['ellenz_poltersdorf', 'Ellenz-Poltersdorf'],
    ['mueden', 'Müden'],
    ['pommern', 'Pommern'],
    ['moselkern', 'Moselkern'],
  ],
  eifel: [
    ['daun', 'Daun'],
    ['gerolstein', 'Gerolstein'],
    ['pruem', 'Prüm'],
    ['bitburg', 'Bitburg'],
    ['adenau', 'Adenau'],
    ['bad_neuenahr_ahrweiler', 'Bad Neuenahr-Ahrweiler'],
    ['sinzig', 'Sinzig'],
    ['remagen', 'Remagen'],
    ['mendig', 'Mendig'],
    ['polch', 'Polch'],
    ['ulmen', 'Ulmen'],
    ['kelberg', 'Kelberg'],
  ],
};

const allIds = new Set();
for (const f of SEED_FILES) {
  const src = fs.readFileSync(path.join(base, f), 'utf8');
  for (const m of src.matchAll(/(?:de\(\s*['"]|id:\s*['"])([a-z0-9_]+)/g)) allIds.add(m[1]);
}

const enrichSrc = fs.readFileSync(path.join(base, 'features/map/data/germany/germanyCityEnrichment.ts'), 'utf8');
const bundeslandSrc = fs.readFileSync(path.join(base, 'features/map/data/germany/germanyBundeslandEnrichment.ts'), 'utf8');
const enriched = new Set([
  ...enrichSrc.matchAll(/^\s{2}([a-z_]+):\s*\{/gm),
  ...bundeslandSrc.matchAll(/^\s{2}([a-z_]+):\s*\{/gm),
].map((m) => m[1]));

const routesSrc = fs.readFileSync(path.join(base, 'features/map/data/germany/germanyRoutes.ts'), 'utf8');
const routes = new Set();
for (const m of routesSrc.matchAll(/\['([a-z_]+)',\s*'([a-z_]+)',\s*'([a-z]+)'/g)) {
  routes.add(`${m[1]}|${m[2]}|${m[3]}`);
  routes.add(`${m[2]}|${m[1]}|${m[3]}`);
}

function resolveEntry(entry) {
  const [canonical, name, ...aliases] = entry;
  for (const id of [canonical, ...aliases]) {
    if (allIds.has(id)) return { id, name, status: 'exists' };
  }
  return { id: canonical, name, status: 'missing' };
}

console.log('=== RHEINLAND-PFALZ ANALYSIS ===\n');
const existing = [];
const missing = [];
const enrichOnly = [];

for (const [group, list] of Object.entries(REQUESTED)) {
  console.log(`--- ${group.toUpperCase()} ---`);
  for (const entry of list) {
    const r = resolveEntry(entry);
    if (r.status === 'exists') {
      existing.push({ ...r, group });
      const needEnrich = !enriched.has(r.id);
      if (needEnrich) enrichOnly.push(r.id);
      console.log(`  OK  ${r.id} (${r.name})${needEnrich ? ' [needs enrichment]' : ''}`);
    } else {
      missing.push({ ...r, group });
      console.log(`  NEW ${r.id} (${r.name})`);
    }
  }
}

console.log('\n=== SUMMARY ===');
console.log('Requested:', existing.length + missing.length);
console.log('Existing:', existing.length);
console.log('Missing:', missing.length);
console.log('Enrich only:', enrichOnly.length);
console.log('\nMISSING:', missing.map((m) => m.id).join(', ') || 'none');
console.log('ENRICH:', enrichOnly.join(', ') || 'none');

const PLANNED_ROUTES = [
  ['mainz', 'koblenz', 'river'],
  ['koblenz', 'cochem', 'river'],
  ['cochem', 'zell_an_der_mosel', 'river'],
  ['cochem', 'trier', 'river'],
  ['trier', 'wittlich', 'road'],
  ['ludwigshafen', 'worms', 'river'],
  ['worms', 'mainz', 'river'],
  ['kaiserslautern', 'ludwigshafen', 'road'],
  ['koblenz', 'mayen', 'road'],
  ['cochem', 'kaisersesch', 'road'],
  ['cochem', 'bruttig_fankel', 'road'],
  ['cochem', 'beilstein', 'road'],
  ['cochem', 'treis_karden', 'road'],
];

console.log('\nPLANNED ROUTES:');
for (const [a, b, mode] of PLANNED_ROUTES) {
  const have = routes.has(`${a}|${b}|${mode}`);
  console.log(`  ${a} ↔ ${b} [${mode}] ${have ? 'EXISTS' : 'NEW'}`);
}
