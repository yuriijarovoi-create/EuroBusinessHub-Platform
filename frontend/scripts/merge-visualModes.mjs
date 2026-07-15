import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { visualModesByLang } from './visualModes-i18n-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.resolve(__dirname, '../src/i18n/locales');
const langs = ['en', 'de', 'uk', 'ru', 'pl'];

for (const lang of langs) {
  const filePath = path.join(localesDir, lang, 'map.json');
  const map = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  map.visualModes = visualModesByLang[lang];
  if (lang === 'uk' && map.title !== 'Жива європейська бізнес-мережа') {
    map.title = 'Жива європейська бізнес-мережа';
  }
  fs.writeFileSync(filePath, `${JSON.stringify(map, null, 2)}\n`, 'utf8');
  console.log(`${lang}: visualModes keys = ${Object.keys(map.visualModes).length}, title = ${map.title}`);
}
