import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, '../src/features/map/data/geojson/europeCountries.geojson');
const dest = path.join(__dirname, '../src/features/map/data/europeCountriesGeoJson.ts');
const geo = JSON.parse(fs.readFileSync(src, 'utf8'));
const out = `import type { FeatureCollection } from 'geojson';\n\nexport const europeCountriesGeoJson = ${JSON.stringify(geo)} as FeatureCollection;\n`;
fs.writeFileSync(dest, out);
console.log('Wrote', dest, 'features:', geo.features.length);
