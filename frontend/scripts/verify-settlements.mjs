/**
 * Verify settlement database: duplicate IDs, duplicate coordinates, Mosel import integrity.
 * Usage: node scripts/verify-settlements.mjs
 */
import fs from 'fs';

const files = [
  'src/features/map/data/germany/germanyLocalNodes.generated.ts',
  'src/features/map/data/germany/germanyLocalNodesRural.generated.ts',
  'src/features/map/data/germany/germanyRheinlandPfalzNodes.generated.ts',
  'src/features/map/data/germany/germanyCitiesDense.ts',
];

const entries = [];
const idRe = /id:\s*['"]([^'"]+)['"]/g;
const nameRe = /name:\s*['"]([^'"]+)['"]/g;
const latRe = /lat:\s*([\d.]+)/;
const lngRe = /lng:\s*([\d.]+)/;

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const blocks = text.split(/\{\s*\n/).slice(1);
  for (const block of blocks) {
    const idM = block.match(/id:\s*['"]([^'"]+)['"]/);
    if (!idM) continue;
    const nameM = block.match(/name:\s*['"]([^'"]+)['"]/);
    const latM = block.match(/lat:\s*([\d.]+)/);
    const lngM = block.match(/lng:\s*([\d.]+)/);
    if (!latM || !lngM) continue;
    entries.push({
      id: idM[1],
      name: nameM?.[1] ?? idM[1],
      lat: Number(latM[1]),
      lng: Number(lngM[1]),
      file,
    });
  }
}

const byId = new Map();
const dupIds = [];
for (const e of entries) {
  if (byId.has(e.id)) dupIds.push({ id: e.id, a: byId.get(e.id), b: e });
  else byId.set(e.id, e);
}

const coordKey = (lat, lng) => `${lat.toFixed(4)},${lng.toFixed(4)}`;
const byCoord = new Map();
const dupCoords = [];
for (const e of entries) {
  const key = coordKey(e.lat, e.lng);
  if (byCoord.has(key)) dupCoords.push({ coord: key, a: byCoord.get(key), b: e });
  else byCoord.set(key, e);
}

const moselNew = [
  'briedern','mesenich','sankt_aldegund','krov','enkirch','reil','neumagen_dhron','minheim',
  'piesport','niederemmel','kesten','brauneberg','osann_monzel','graach','wehlen','zeltingen_rachtig',
  'erden','urzig','loef','kinheim','koewerich','leiwen','trittenheim','detzem','longuich','mehring',
  'fell','konz','wiltingen','burgen','hatzenport','kattenes','lehmen','niederfell','alken','winningen',
  'bassenheim','urmitz',
];

const missing = moselNew.filter((id) => !byId.has(id));
const report = {
  totalEntries: entries.length,
  uniqueIds: byId.size,
  duplicateIds: dupIds,
  duplicateCoordinates: dupCoords.filter((d) => d.a.id !== d.b.id),
  moselImport: {
    expected: moselNew.length,
    found: moselNew.length - missing.length,
    missing,
    settlements: moselNew.map((id) => byId.get(id)).filter(Boolean),
  },
};

console.log(JSON.stringify(report, null, 2));
process.exit(dupIds.length || missing.length ? 1 : 0);
