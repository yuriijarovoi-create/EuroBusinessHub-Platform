import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const base = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

const STAGE1 = [
  'berlin', 'hamburg', 'munich', 'frankfurt', 'cologne', 'duesseldorf', 'stuttgart', 'leipzig',
  'dresden', 'dortmund', 'essen', 'bremen', 'hanover', 'nuremberg', 'duisburg', 'bochum',
  'wuppertal', 'bonn', 'muenster', 'mannheim', 'karlsruhe', 'augsburg', 'mainz', 'wiesbaden',
  'kiel', 'aachen', 'magdeburg', 'erfurt', 'freiburg', 'rostock', 'saarbruecken', 'potsdam',
  'regensburg', 'ulm', 'ingolstadt', 'wolfsburg',
];
const STAGE2 = [
  'luebeck', 'oldenburg', 'osnabrueck', 'paderborn', 'heidelberg', 'darmstadt', 'heilbronn',
  'wuerzburg', 'goettingen', 'koblenz', 'trier', 'jena', 'erlangen', 'fuerth', 'reutlingen',
  'offenbach', 'pforzheim', 'kassel', 'hildesheim', 'cottbus', 'schwerin', 'chemnitz', 'zwickau',
  'gera', 'siegen', 'kaiserslautern', 'bayreuth', 'bamberg', 'flensburg', 'neubrandenburg',
];
const STAGE3 = [
  'cochem', 'mayen', 'andernach', 'bad_kreuznach', 'idar_oberstein', 'speyer', 'worms',
  'landau_pfalz', 'neuwied', 'bingen', 'ruesselsheim', 'hanau', 'aschaffenburg', 'fulda',
  'giessen', 'marburg', 'villingen_schwenningen', 'konstanz', 'ravensburg', 'tuebingen',
  'ludwigsburg', 'esslingen', 'aalen', 'schweinfurt', 'passau', 'rosenheim', 'kempten',
  'memmingen', 'landshut', 'coburg',
];

function allCityIds() {
  const files = [
    'data/cities.ts',
    'data/europeBusinessCitiesExtra.ts',
    'features/map/data/germany/germanyCitiesExtra.ts',
    'features/map/data/germany/germanyCitiesDense.ts',
    'features/map/data/germany/germanyLocalNodes.generated.ts',
    'features/map/data/germany/germanyLocalNodesRural.generated.ts',
    'features/map/data/germany/germanyRegionalClusters.generated.ts',
  ];
  const ids = new Set();
  for (const f of files) {
    const src = fs.readFileSync(path.join(base, f), 'utf8');
    for (const m of src.matchAll(/(?:de\(\s*['"]|id:\s*['"])([a-z0-9_]+)/g)) ids.add(m[1]);
  }
  return ids;
}

function enrichmentIds() {
  const src = fs.readFileSync(
    path.join(base, 'features/map/data/germany/germanyCityEnrichment.ts'),
    'utf8',
  );
  return new Set([...src.matchAll(/^\s{2}([a-z_]+):\s*\{/gm)].map((m) => m[1]));
}

const cityIds = allCityIds();
const enrichIds = enrichmentIds();

function report(stage, ids) {
  const missing = ids.filter((id) => !cityIds.has(id));
  const noEnrich = ids.filter((id) => cityIds.has(id) && !enrichIds.has(id));
  console.log(`\n${stage}: ${ids.length - missing.length}/${ids.length} cities present`);
  if (missing.length) console.log('  Missing:', missing.join(', '));
  console.log(`  Enriched: ${ids.filter((id) => enrichIds.has(id)).length}/${ids.length - missing.length}`);
  if (noEnrich.length) console.log('  No curated enrichment (use defaults/local):', noEnrich.slice(0, 12).join(', '), noEnrich.length > 12 ? `+${noEnrich.length - 12} more` : '');
}

report('Stage 1 — Major hubs', STAGE1);
report('Stage 2 — Regional cities', STAGE2);
report('Stage 3 — Small towns', STAGE3);
console.log('\nTotal unique Germany city ids:', cityIds.size);
console.log('Curated enrichment entries:', enrichIds.size);
