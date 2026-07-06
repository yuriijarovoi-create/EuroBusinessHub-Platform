import fs from 'fs';

const files = [
  'src/features/map/data/germany/germanyLocalNodes.generated.ts',
  'src/features/map/data/germany/germanyLocalNodesRural.generated.ts',
  'src/features/map/data/germany/germanyRheinlandPfalzNodes.generated.ts',
  'src/features/map/data/germany/germanyCitiesDense.ts',
];

const ids = new Set();
const idRe = /id:\s*['"]([^'"]+)['"]/g;
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = idRe.exec(t))) ids.add(m[1]);
}
console.log(JSON.stringify([...ids].sort(), null, 2));
