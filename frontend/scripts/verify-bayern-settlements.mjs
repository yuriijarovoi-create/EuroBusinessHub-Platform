/**
 * Validate Bayern settlement imports: bbox, admin areas, duplicates.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dir, '..', 'src');

const BY_BBOX = { south: 47.27, west: 8.98, north: 50.56, east: 13.84 };

const VALID_LANDKREISE = new Set([
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
  'Würzburg',
  'Aschaffenburg',
  'Schweinfurt',
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
  'Landshut',
  'Passau',
  'Straubing',
  'Deggendorf',
  'Neumarkt',
  'Neumarkt in der Oberpfalz',
  'Regensburg',
  'Amberg',
  'Amberg-Sulzbach',
  'Weiden',
  'Ansbach',
  'Neustadt an der Aisch-Bad Windsheim',
  'Nürnberger Land',
  'Weißenburg-Gunzenhausen',
  'Roth',
  'Nürnberg',
  'Fürth',
  'Erlangen',
  'Erlangen-Höchstadt',
  'Donau-Ries',
  'Ostallgäu',
  'Unterallgäu',
  'Oberallgäu',
  'Günzburg',
  'Dillingen an der Donau',
  'Augsburg',
  'Aichach-Friedberg',
  'Lindau',
  'Neu-Ulm',
  'Kempten',
  'Memmingen',
  'Kaufbeuren',
  'Altötting',
  'Berchtesgadener Land',
  'Bad Tölz-Wolfratshausen',
  'Dachau',
  'Ebersberg',
  'Erding',
  'Freising',
  'Fürstenfeldbruck',
  'Garmisch-Partenkirchen',
  'Landsberg am Lech',
  'Miesbach',
  'Mühldorf',
  'Mühldorf am Inn',
  'München',
  'Neuburg-Schrobenhausen',
  'Pfaffenhofen',
  'Pfaffenhofen an der Ilm',
  'Rosenheim',
  'Starnberg',
  'Traunstein',
  'Weilheim-Schongau',
  'Eichstätt',
  'Ingolstadt',
  'Landkreis Hof',
  'Landkreis Wunsiedel im Fichtelgebirge',
  'Landkreis Kronach',
  'Landkreis Kulmbach',
  'Landkreis Coburg',
  'Landkreis Lichtenfels',
  'Landkreis Bayreuth',
  'Landkreis Bamberg',
  'Landkreis Forchheim',
  'Landkreis Rhön-Grabfeld',
  'Landkreis Bad Kissingen',
  'Landkreis Haßberge',
  'Landkreis Main-Spessart',
  'Landkreis Kitzingen',
  'Landkreis Miltenberg',
  'Landkreis Würzburg',
  'Landkreis Aschaffenburg',
  'Landkreis Schweinfurt',
  'Landkreis Neustadt an der Waldnaab',
  'Landkreis Tirschenreuth',
  'Landkreis Schwandorf',
  'Landkreis Cham',
  'Landkreis Regen',
  'Landkreis Freyung-Grafenau',
  'Landkreis Rottal-Inn',
  'Landkreis Dingolfing-Landau',
  'Landkreis Kelheim',
  'Landkreis Straubing-Bogen',
  'Landkreis Landshut',
  'Landkreis Passau',
  'Landkreis Deggendorf',
  'Landkreis Neumarkt',
  'Landkreis Regensburg',
  'Landkreis Amberg-Sulzbach',
  'Landkreis Ansbach',
  'Landkreis Neustadt a.d.Aisch-Bad Windsheim',
  'Landkreis Nürnberger Land',
  'Landkreis Weißenburg-Gunzenhausen',
  'Landkreis Roth',
  'Landkreis Donau-Ries',
  'Landkreis Ostallgäu',
  'Landkreis Unterallgäu',
  'Landkreis Oberallgäu',
  'Landkreis Günzburg',
  'Landkreis Dillingen an der Donau',
  'Landkreis Augsburg',
  'Landkreis Aichach-Friedberg',
  'Landkreis Lindau',
  'Landkreis Neu-Ulm',
  'Landkreis Altötting',
  'Landkreis Berchtesgadener Land',
  'Landkreis Bad Tölz-Wolfratshausen',
  'Landkreis Dachau',
  'Landkreis Ebersberg',
  'Landkreis Erding',
  'Landkreis Freising',
  'Landkreis Fürstenfeldbruck',
  'Landkreis Garmisch-Partenkirchen',
  'Landkreis Landsberg am Lech',
  'Landkreis Miesbach',
  'Landkreis Mühldorf',
  'Landkreis München',
  'Landkreis Neuburg-Schrobenhausen',
  'Landkreis Pfaffenhofen',
  'Landkreis Rosenheim',
  'Landkreis Starnberg',
  'Landkreis Traunstein',
  'Landkreis Weilheim-Schongau',
  'Landkreis Eichstätt',
  'Landkreis Mühldorf am Inn',
  'Landkreis Pfaffenhofen an der Ilm',
  'Landkreis Erlangen-Höchstadt',
  'Landkreis Neumarkt in der Oberpfalz',
]);

const file = path.join(ROOT, 'features/map/data/germany/germanyBayernNodes.generated.ts');
if (!fs.existsSync(file)) {
  console.log(JSON.stringify({ error: 'No Bayern nodes file', entries: 0 }, null, 2));
  process.exit(1);
}

const src = fs.readFileSync(file, 'utf8');
const blocks = src.split(/\{\s*\n/).slice(1);

const entries = [];
const ids = new Set();
const coords = new Map();
const errors = [];

for (const block of blocks) {
  const idM = block.match(/id:\s*['"]([^'"]+)['"]/);
  const nameM = block.match(/name:\s*['"]([^'"]+)['"]/);
  const latM = block.match(/lat:\s*([\d.]+)/);
  const lngM = block.match(/lng:\s*([\d.]+)/);
  const lkM = block.match(/landkreis:\s*['"]([^'"]+)['"]/);
  const blM = block.match(/bundeslandId:\s*['"]([^'"]+)['"]/);
  const fsM = block.match(/federalState:\s*['"]([^'"]+)['"]/);
  if (!idM || !latM || !lngM) continue;

  const entry = {
    id: idM[1],
    name: nameM?.[1] ?? idM[1],
    lat: Number(latM[1]),
    lng: Number(lngM[1]),
    landkreis: lkM?.[1] ?? null,
    bundeslandId: blM?.[1],
    federalState: fsM?.[1],
  };
  entries.push(entry);

  if (ids.has(entry.id)) errors.push(`duplicate id: ${entry.id}`);
  ids.add(entry.id);

  const ck = `${entry.lat.toFixed(5)},${entry.lng.toFixed(5)}`;
  if (coords.has(ck)) errors.push(`duplicate coord: ${entry.id} vs ${coords.get(ck)}`);
  coords.set(ck, entry.id);

  if (!Number.isFinite(entry.lat) || !Number.isFinite(entry.lng)) {
    errors.push(`invalid coords: ${entry.id}`);
  }
  if (
    entry.lat < BY_BBOX.south ||
    entry.lat > BY_BBOX.north ||
    entry.lng < BY_BBOX.west ||
    entry.lng > BY_BBOX.east
  ) {
    errors.push(`outside Bayern bbox: ${entry.id}`);
  }
  if (entry.bundeslandId !== 'DE-BY') errors.push(`wrong bundeslandId: ${entry.id}`);
  if (entry.federalState !== 'Bayern') errors.push(`wrong federalState: ${entry.id}`);
  if (entry.landkreis && !VALID_LANDKREISE.has(entry.landkreis)) {
    errors.push(`unknown landkreis "${entry.landkreis}" for ${entry.id}`);
  }
}

console.log(
  JSON.stringify(
    {
      entries: entries.length,
      errors: errors.length,
      errorSample: errors.slice(0, 20),
      ok: errors.length === 0,
    },
    null,
    2,
  ),
);
process.exit(errors.length ? 1 : 0);
