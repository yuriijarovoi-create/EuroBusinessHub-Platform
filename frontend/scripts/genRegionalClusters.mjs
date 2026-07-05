import fs from 'fs';

const path = new URL('../src/features/map/data/germany/germanyRegionalClusters.generated.ts', import.meta.url);

const SKIP = new Set([
  'potsdam', 'oranienburg', 'norderstedt', 'pinneberg', 'celle', 'hildesheim', 'hameln',
  'meissen', 'bautzen', 'goerlitz', 'fuerth', 'erlangen', 'ansbach', 'esslingen', 'sindelfingen',
  'ludwigsburg', 'freising', 'erding',
]);

const rows = [
  ['bernau_bei_berlin', 'Bernau bei Berlin', 52.679, 13.584, 'DE-BB', 'Brandenburg', 'Berlin Region', 'berlin', 'Berlin', 42800],
  ['falkensee', 'Falkensee', 52.56, 13.093, 'DE-BB', 'Brandenburg', 'Berlin Region', 'berlin', 'Berlin', 44800],
  ['koenigs_wusterhausen', 'Königs Wusterhausen', 52.301, 13.653, 'DE-BB', 'Brandenburg', 'Berlin Region', 'berlin', 'Berlin', 37800],
  ['strausberg', 'Strausberg', 52.579, 13.887, 'DE-BB', 'Brandenburg', 'Berlin Region', 'berlin', 'Berlin', 26800],
  ['potsdam', 'Potsdam', 52.391, 13.065, 'DE-BB', 'Brandenburg', 'Berlin Region', 'berlin', 'Berlin', 183000],
  ['oranienburg', 'Oranienburg', 52.754, 13.237, 'DE-BB', 'Brandenburg', 'Berlin Region', 'berlin', 'Berlin', 46000],
  ['norderstedt', 'Norderstedt', 53.706, 9.998, 'DE-SH', 'Schleswig-Holstein', 'Hamburg Region', 'hamburg', 'Hamburg', 79000],
  ['ahrensburg', 'Ahrensburg', 53.674, 10.231, 'DE-SH', 'Schleswig-Holstein', 'Hamburg Region', 'hamburg', 'Hamburg', 34000],
  ['pinneberg', 'Pinneberg', 53.667, 9.794, 'DE-SH', 'Schleswig-Holstein', 'Hamburg Region', 'hamburg', 'Hamburg', 44000],
  ['elmshorn', 'Elmshorn', 53.753, 9.653, 'DE-SH', 'Schleswig-Holstein', 'Hamburg Region', 'hamburg', 'Hamburg', 51000],
  ['stade', 'Stade', 53.593, 9.477, 'DE-NI', 'Niedersachsen', 'Hamburg Region', 'hamburg', 'Hamburg', 48000],
  ['buxtehude', 'Buxtehude', 53.477, 9.691, 'DE-NI', 'Niedersachsen', 'Hamburg Region', 'hamburg', 'Hamburg', 41000],
  ['celle', 'Celle', 52.623, 10.081, 'DE-NI', 'Niedersachsen', 'Hanover Region', 'hanover', 'Hannover', 70000],
  ['peine', 'Peine', 52.319, 10.235, 'DE-NI', 'Niedersachsen', 'Hanover Region', 'hanover', 'Hannover', 51000],
  ['lehrte', 'Lehrte', 52.372, 9.978, 'DE-NI', 'Niedersachsen', 'Hanover Region', 'hanover', 'Hannover', 44000],
  ['burgdorf', 'Burgdorf', 52.449, 10.006, 'DE-NI', 'Niedersachsen', 'Hanover Region', 'hanover', 'Hannover', 30400],
  ['hildesheim', 'Hildesheim', 52.151, 9.951, 'DE-NI', 'Niedersachsen', 'Hanover Region', 'hanover', 'Hannover', 101000],
  ['hameln', 'Hameln', 52.104, 9.356, 'DE-NI', 'Niedersachsen', 'Hanover Region', 'hanover', 'Hannover', 58000],
  ['delitzsch', 'Delitzsch', 51.525, 12.343, 'DE-SN', 'Sachsen', 'Leipzig Region', 'leipzig', 'Leipzig', 26800],
  ['torgau', 'Torgau', 51.558, 12.996, 'DE-SN', 'Sachsen', 'Leipzig Region', 'leipzig', 'Leipzig', 20400],
  ['grimma', 'Grimma', 51.236, 12.72, 'DE-SN', 'Sachsen', 'Leipzig Region', 'leipzig', 'Leipzig', 28400],
  ['borna', 'Borna', 51.124, 12.489, 'DE-SN', 'Sachsen', 'Leipzig Region', 'leipzig', 'Leipzig', 18600],
  ['eilenburg', 'Eilenburg', 51.458, 12.633, 'DE-SN', 'Sachsen', 'Leipzig Region', 'leipzig', 'Leipzig', 16200],
  ['pirna', 'Pirna', 50.958, 13.937, 'DE-SN', 'Sachsen', 'Dresden Region', 'dresden', 'Dresden', 39400],
  ['meissen', 'Meißen', 51.163, 13.471, 'DE-SN', 'Sachsen', 'Dresden Region', 'dresden', 'Dresden', 28000],
  ['radebeul', 'Radebeul', 51.106, 13.66, 'DE-SN', 'Sachsen', 'Dresden Region', 'dresden', 'Dresden', 34000],
  ['freital', 'Freital', 51.014, 13.648, 'DE-SN', 'Sachsen', 'Dresden Region', 'dresden', 'Dresden', 39000],
  ['bautzen', 'Bautzen', 51.181, 14.424, 'DE-SN', 'Sachsen', 'Dresden Region', 'dresden', 'Dresden', 40000],
  ['goerlitz', 'Görlitz', 51.152, 14.987, 'DE-SN', 'Sachsen', 'Dresden Region', 'dresden', 'Dresden', 56000],
  ['fuerth', 'Fürth', 49.477, 10.989, 'DE-BY', 'Bayern', 'Nuremberg Region', 'nuremberg', 'Nürnberg', 128000],
  ['erlangen', 'Erlangen', 49.598, 11.004, 'DE-BY', 'Bayern', 'Nuremberg Region', 'nuremberg', 'Nürnberg', 113000],
  ['schwabach', 'Schwabach', 49.329, 11.023, 'DE-BY', 'Bayern', 'Nuremberg Region', 'nuremberg', 'Nürnberg', 41200],
  ['forchheim', 'Forchheim', 49.717, 11.059, 'DE-BY', 'Bayern', 'Nuremberg Region', 'nuremberg', 'Nürnberg', 32600],
  ['ansbach', 'Ansbach', 49.301, 10.571, 'DE-BY', 'Bayern', 'Nuremberg Region', 'nuremberg', 'Nürnberg', 42000],
  ['neumarkt', 'Neumarkt in der Oberpfalz', 49.28, 11.463, 'DE-BY', 'Bayern', 'Nuremberg Region', 'nuremberg', 'Nürnberg', 40800],
  ['esslingen', 'Esslingen am Neckar', 48.742, 9.32, 'DE-BW', 'Baden-Württemberg', 'Stuttgart Region', 'stuttgart', 'Stuttgart', 93000],
  ['boeblingen', 'Böblingen', 48.685, 9.012, 'DE-BW', 'Baden-Württemberg', 'Stuttgart Region', 'stuttgart', 'Stuttgart', 51000],
  ['sindelfingen', 'Sindelfingen', 48.713, 9.004, 'DE-BW', 'Baden-Württemberg', 'Stuttgart Region', 'stuttgart', 'Stuttgart', 65000],
  ['ludwigsburg', 'Ludwigsburg', 48.897, 9.192, 'DE-BW', 'Baden-Württemberg', 'Stuttgart Region', 'stuttgart', 'Stuttgart', 95000],
  ['waiblingen', 'Waiblingen', 48.832, 9.316, 'DE-BW', 'Baden-Württemberg', 'Stuttgart Region', 'stuttgart', 'Stuttgart', 55000],
  ['leonberg', 'Leonberg', 48.801, 9.016, 'DE-BW', 'Baden-Württemberg', 'Stuttgart Region', 'stuttgart', 'Stuttgart', 49000],
  ['dachau', 'Dachau', 48.26, 11.434, 'DE-BY', 'Bayern', 'Munich Region', 'munich', 'München', 48000],
  ['freising', 'Freising', 48.401, 11.749, 'DE-BY', 'Bayern', 'Munich Region', 'munich', 'München', 49000],
  ['erding', 'Erding', 48.306, 11.907, 'DE-BY', 'Bayern', 'Munich Region', 'munich', 'München', 37000],
  ['fuerstenfeldbruck', 'Fürstenfeldbruck', 48.179, 11.254, 'DE-BY', 'Bayern', 'Munich Region', 'munich', 'München', 37000],
  ['starnberg', 'Starnberg', 47.997, 11.341, 'DE-BY', 'Bayern', 'Munich Region', 'munich', 'München', 24000],
  ['germering', 'Germering', 48.136, 11.371, 'DE-BY', 'Bayern', 'Munich Region', 'munich', 'München', 41000],
  ['unterschleissheim', 'Unterschleißheim', 48.28, 11.578, 'DE-BY', 'Bayern', 'Munich Region', 'munich', 'München', 28000],
];

const newRows = rows.filter((r) => !SKIP.has(r[0]));
console.log('Adding', newRows.length, 'cities, skipped', rows.length - newRows.length);

const lines = [
  '/** Regional metro cluster definitions — generated, do not edit */',
  'export interface RawRegionalClusterDef {',
  '  id: string; name: string; lat: number; lng: number;',
  '  bundeslandId: string; federalState: string; region: string;',
  '  hubCityId: string; hubCityName: string; population: number;',
  '}',
  '',
  'export const GERMANY_REGIONAL_CLUSTER_DEFS: RawRegionalClusterDef[] = [',
];

for (const [id, name, lat, lng, bl, state, region, hubId, hubName, pop] of newRows) {
  lines.push('  {');
  lines.push(`    id: ${JSON.stringify(id)},`);
  lines.push(`    name: ${JSON.stringify(name)},`);
  lines.push(`    lat: ${lat}, lng: ${lng},`);
  lines.push(`    bundeslandId: ${JSON.stringify(bl)},`);
  lines.push(`    federalState: ${JSON.stringify(state)},`);
  lines.push(`    region: ${JSON.stringify(region)},`);
  lines.push(`    hubCityId: ${JSON.stringify(hubId)},`);
  lines.push(`    hubCityName: ${JSON.stringify(hubName)},`);
  lines.push(`    population: ${pop},`);
  lines.push('  },');
}
lines.push('];', '');
lines.push('export const GERMANY_REGIONAL_CLUSTER_ROUTES_RAW: Array<[string, string, \'rail\' | \'road\', number]> = [');
for (const [id, , , , , , , hubId] of newRows) {
  const mode = ['berlin', 'hamburg', 'hanover', 'leipzig', 'dresden', 'nuremberg', 'stuttgart', 'munich'].includes(hubId) && id.length < 14 ? 'rail' : 'road';
  lines.push(`  [${JSON.stringify(hubId)}, ${JSON.stringify(id)}, ${JSON.stringify(mode)}, 3],`);
}
lines.push('];');

fs.writeFileSync(path, lines.join('\n'));
