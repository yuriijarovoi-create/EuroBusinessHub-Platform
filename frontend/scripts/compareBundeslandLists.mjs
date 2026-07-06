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

function loadAllIds() {
  const ids = new Set();
  const idToName = new Map();
  for (const f of SEED_FILES) {
    const src = fs.readFileSync(path.join(base, f), 'utf8');
    for (const m of src.matchAll(/de\(\s*['"]([a-z0-9_]+)['"]\s*,\s*['"]([^'"]+)['"]/g)) {
      ids.add(m[1]);
      idToName.set(m[1], m[2]);
    }
    for (const m of src.matchAll(/id:\s*['"]([a-z0-9_]+)['"][\s\S]*?name:\s*['"]([^'"]+)['"]/g)) {
      ids.add(m[1]);
      if (!idToName.has(m[1])) idToName.set(m[1], m[2]);
    }
    for (const m of src.matchAll(/id:\s*'([a-z0-9_]+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?countryCode:\s*'DE'/g)) {
      ids.add(m[1]);
      if (!idToName.has(m[1])) idToName.set(m[1], m[2]);
    }
  }
  return { ids, idToName };
}

/** User list → expected project id */
const BUNDESLAENDER = {
  'NORDRHEIN-WESTFALEN': [
    ['cologne', 'Cologne', 'Köln'],
    ['duesseldorf', 'Düsseldorf'],
    ['dortmund', 'Dortmund'],
    ['essen', 'Essen'],
    ['duisburg', 'Duisburg'],
    ['bochum', 'Bochum'],
    ['wuppertal', 'Wuppertal'],
    ['bonn', 'Bonn'],
    ['muenster', 'Münster'],
    ['bielefeld', 'Bielefeld'],
    ['gelsenkirchen', 'Gelsenkirchen'],
    ['moenchengladbach', 'Mönchengladbach'],
    ['aachen', 'Aachen'],
    ['krefeld', 'Krefeld'],
    ['oberhausen', 'Oberhausen'],
    ['hagen', 'Hagen'],
    ['hamm', 'Hamm'],
    ['muelheim_an_der_ruhr', 'Mülheim an der Ruhr'],
    ['leverkusen', 'Leverkusen'],
    ['solingen', 'Solingen'],
    ['herne', 'Herne'],
    ['neuss', 'Neuss'],
    ['paderborn', 'Paderborn'],
    ['recklinghausen', 'Recklinghausen'],
    ['bottrop', 'Bottrop'],
    ['remscheid', 'Remscheid'],
    ['siegen', 'Siegen'],
    ['guetersloh', 'Gütersloh'],
    ['moers', 'Moers'],
  ],
  BAYERN: [
    ['munich', 'Munich', 'München'],
    ['nuremberg', 'Nuremberg', 'Nürnberg'],
    ['augsburg', 'Augsburg'],
    ['regensburg', 'Regensburg'],
    ['ingolstadt', 'Ingolstadt'],
    ['wuerzburg', 'Würzburg'],
    ['fuerth', 'Fürth'],
    ['erlangen', 'Erlangen'],
    ['bamberg', 'Bamberg'],
    ['bayreuth', 'Bayreuth'],
    ['landshut', 'Landshut'],
    ['passau', 'Passau'],
    ['rosenheim', 'Rosenheim'],
    ['schweinfurt', 'Schweinfurt'],
    ['kempten', 'Kempten'],
  ],
  'BADEN-WÜRTTEMBERG': [
    ['stuttgart', 'Stuttgart'],
    ['mannheim', 'Mannheim'],
    ['karlsruhe', 'Karlsruhe'],
    ['freiburg', 'Freiburg im Breisgau'],
    ['heidelberg', 'Heidelberg'],
    ['heilbronn', 'Heilbronn'],
    ['ulm', 'Ulm'],
    ['pforzheim', 'Pforzheim'],
    ['reutlingen', 'Reutlingen'],
    ['tuebingen', 'Tübingen'],
    ['ludwigsburg', 'Ludwigsburg'],
    ['esslingen', 'Esslingen am Neckar'],
    ['konstanz', 'Konstanz'],
    ['baden_baden', 'Baden-Baden'],
    ['offenburg', 'Offenburg'],
  ],
  HESSEN: [
    ['frankfurt', 'Frankfurt am Main'],
    ['wiesbaden', 'Wiesbaden'],
    ['kassel', 'Kassel'],
    ['darmstadt', 'Darmstadt'],
    ['offenbach', 'Offenbach am Main'],
    ['hanau', 'Hanau'],
    ['marburg', 'Marburg'],
    ['fulda', 'Fulda'],
    ['giessen', 'Gießen'],
    ['wetzlar', 'Wetzlar'],
    ['ruesselsheim', 'Rüsselsheim am Main'],
  ],
  SACHSEN: [
    ['leipzig', 'Leipzig'],
    ['dresden', 'Dresden'],
    ['chemnitz', 'Chemnitz'],
    ['zwickau', 'Zwickau'],
    ['plauen', 'Plauen'],
    ['goerlitz', 'Görlitz'],
    ['freiberg', 'Freiberg'],
  ],
  NIEDERSACHSEN: [
    ['hanover', 'Hanover', 'Hannover'],
    ['braunschweig', 'Braunschweig'],
    ['oldenburg', 'Oldenburg'],
    ['osnabrueck', 'Osnabrück'],
    ['wolfsburg', 'Wolfsburg'],
    ['goettingen', 'Göttingen'],
    ['hildesheim', 'Hildesheim'],
    ['salzgitter', 'Salzgitter'],
    ['celle', 'Celle'],
    ['wilhelmshaven', 'Wilhelmshaven'],
    ['lueneburg', 'Lüneburg'],
  ],
  'RHEINLAND-PFALZ': [
    ['mainz', 'Mainz'],
    ['ludwigshafen', 'Ludwigshafen am Rhein'],
    ['koblenz', 'Koblenz'],
    ['trier', 'Trier'],
    ['kaiserslautern', 'Kaiserslautern'],
    ['worms', 'Worms'],
    ['speyer', 'Speyer'],
    ['neustadt_an_der_weinstrasse', 'Neustadt an der Weinstraße'],
  ],
  THÜRINGEN: [
    ['erfurt', 'Erfurt'],
    ['jena', 'Jena'],
    ['gera', 'Gera'],
    ['weimar', 'Weimar'],
    ['eisenach', 'Eisenach'],
    ['gotha', 'Gotha'],
    ['suhl', 'Suhl'],
  ],
  'SACHSEN-ANHALT': [
    ['magdeburg', 'Magdeburg'],
    ['halle', 'Halle'],
    ['dessau', 'Dessau-Roßlau'],
    ['wittenberg', 'Wittenberg'],
    ['stendal', 'Stendal'],
  ],
  BRANDENBURG: [
    ['potsdam', 'Potsdam'],
    ['cottbus', 'Cottbus'],
    ['brandenburg', 'Brandenburg an der Havel'],
    ['frankfurt_oder', 'Frankfurt an der Oder'],
    ['oranienburg', 'Oranienburg'],
    ['eberswalde', 'Eberswalde'],
  ],
  'SCHLESWIG-HOLSTEIN': [
    ['kiel', 'Kiel'],
    ['luebeck', 'Lübeck'],
    ['flensburg', 'Flensburg'],
    ['neumuenster', 'Neumünster'],
    ['norderstedt', 'Norderstedt'],
  ],
  'MECKLENBURG-VORPOMMERN': [
    ['rostock', 'Rostock'],
    ['schwerin', 'Schwerin'],
    ['neubrandenburg', 'Neubrandenburg'],
    ['stralsund', 'Stralsund'],
    ['greifswald', 'Greifswald'],
    ['wismar', 'Wismar'],
  ],
  SAARLAND: [
    ['saarbruecken', 'Saarbrücken'],
    ['neunkirchen', 'Neunkirchen'],
    ['homburg', 'Homburg'],
    ['voelklingen', 'Völklingen'],
  ],
};

const { ids, idToName } = loadAllIds();

const enrichSrc = fs.readFileSync(path.join(base, 'features/map/data/germany/germanyCityEnrichment.ts'), 'utf8');
const enriched = new Set([...enrichSrc.matchAll(/^\s{2}([a-z_]+):\s*\{/gm)].map((m) => m[1]));

const routesSrc = fs.readFileSync(path.join(base, 'features/map/data/germany/germanyRoutes.ts'), 'utf8');
const routes = new Set();
for (const m of routesSrc.matchAll(/\['([a-z_]+)',\s*'([a-z_]+)',\s*'([a-z]+)'/g)) {
  routes.add(`${m[1]}|${m[2]}|${m[3]}`);
  routes.add(`${m[2]}|${m[1]}|${m[3]}`);
}

console.log('TOTAL EXISTING GERMAN CITY IDS:', ids.size);

const allMissing = [];
const allEnrich = [];
const allExists = [];

for (const [bl, cities] of Object.entries(BUNDESLAENDER)) {
  const missing = [];
  const enrichOnly = [];
  const exists = [];
  for (const [id, ...names] of cities) {
    if (ids.has(id)) {
      exists.push(id);
      if (!enriched.has(id)) enrichOnly.push(id);
      else allEnrich.push({ id, bl, status: 'has enrichment' });
    } else {
      missing.push({ id, name: names[0], bl });
      allMissing.push({ id, name: names[0], bl });
    }
  }
  console.log(`\n=== ${bl} ===`);
  console.log('Exists:', exists.length, '/', cities.length);
  if (missing.length) console.log('MISSING:', missing.map((m) => `${m.id} (${m.name})`).join(', '));
  if (enrichOnly.length) console.log('ENRICH ONLY (no curated data):', enrichOnly.join(', '));
}

console.log('\n=== SUMMARY ===');
console.log('Total in lists:', Object.values(BUNDESLAENDER).flat().length);
console.log('Already exist:', allExists.length);
console.log('Missing to add:', allMissing.length);
console.log('Need enrichment:', [...new Set(allMissing.map(() => 0))]);

const uniqueMissing = allMissing;
console.log('\nALL MISSING:');
uniqueMissing.forEach((m) => console.log(`  [${m.bl}] ${m.id} — ${m.name}`));

// enrich only without full enrichment
const needEnrich = [];
for (const [bl, cities] of Object.entries(BUNDESLAENDER)) {
  for (const [id] of cities) {
    if (ids.has(id) && !enriched.has(id)) needEnrich.push({ id, bl });
  }
}
console.log('\nENRICH ONLY (exist, no curated enrichment):', needEnrich.length);
needEnrich.forEach((e) => console.log(`  [${e.bl}] ${e.id}`));

// Planned routes for missing cities
const HUBS = {
  'NORDRHEIN-WESTFALEN': 'cologne',
  BAYERN: 'munich',
  'BADEN-WÜRTTEMBERG': 'stuttgart',
  HESSEN: 'frankfurt',
  SACHSEN: 'leipzig',
  NIEDERSACHSEN: 'hanover',
  'RHEINLAND-PFALZ': 'mainz',
  THÜRINGEN: 'erfurt',
  'SACHSEN-ANHALT': 'magdeburg',
  BRANDENBURG: 'berlin',
  'SCHLESWIG-HOLSTEIN': 'hamburg',
  'MECKLENBURG-VORPOMMERN': 'rostock',
  SAARLAND: 'saarbruecken',
};

console.log('\nPLANNED ROUTES (missing cities → hub):');
for (const m of uniqueMissing) {
  const hub = HUBS[m.bl];
  const key = `${m.id}|${hub}|road`;
  const exists = routes.has(key);
  console.log(`  ${m.id} → ${hub} [road] ${exists ? 'EXISTS' : 'NEW'}`);
}
