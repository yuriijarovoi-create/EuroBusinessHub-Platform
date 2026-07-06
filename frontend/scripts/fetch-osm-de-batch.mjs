/**
 * Fetch OSM coordinates for new German settlement batch.
 */
const CANDIDATES = [
  // Rheinland-Pfalz — Mittelrhein / Nahe
  { id: 'ruedesheim_am_rhein', query: 'Rüdesheim am Rhein, Rheinland-Pfalz, Deutschland' },
  { id: 'bacharach', query: 'Bacharach, Rheinland-Pfalz, Deutschland' },
  { id: 'oberwesel', query: 'Oberwesel, Rheinland-Pfalz, Deutschland' },
  { id: 'bad_sobernheim', query: 'Bad Sobernheim, Rheinland-Pfalz, Deutschland' },
  { id: 'meisenheim', query: 'Meisenheim, Rheinland-Pfalz, Deutschland' },
  // Nordrhein-Westfalen
  { id: 'xanten', query: 'Xanten, Nordrhein-Westfalen, Deutschland' },
  { id: 'kleve', query: 'Kleve, Nordrhein-Westfalen, Deutschland' },
  { id: 'emmerich_am_rhein', query: 'Emmerich am Rhein, Nordrhein-Westfalen, Deutschland' },
  { id: 'arnsberg', query: 'Arnsberg, Nordrhein-Westfalen, Deutschland' },
  { id: 'sundern', query: 'Sundern, Nordrhein-Westfalen, Deutschland' },
  // Hessen
  { id: 'heppenheim', query: 'Heppenheim, Hessen, Deutschland' },
  { id: 'bensheim', query: 'Bensheim, Hessen, Deutschland' },
  { id: 'michelstadt', query: 'Michelstadt, Hessen, Deutschland' },
  { id: 'buedingen', query: 'Büdingen, Hessen, Deutschland' },
  { id: 'lorsch', query: 'Lorsch, Hessen, Deutschland' },
  // Baden-Württemberg
  { id: 'rottweil', query: 'Rottweil, Baden-Württemberg, Deutschland' },
  { id: 'biberach_an_der_riss', query: 'Biberach an der Riß, Baden-Württemberg, Deutschland' },
  { id: 'sigmaringen', query: 'Sigmaringen, Baden-Württemberg, Deutschland' },
  { id: 'muellheim', query: 'Müllheim, Baden-Württemberg, Deutschland' },
  { id: 'tettnang', query: 'Tettnang, Baden-Württemberg, Deutschland' },
  // Bayern
  { id: 'dachau', query: 'Dachau, Bayern, Deutschland' },
  { id: 'freising', query: 'Freising, Bayern, Deutschland' },
  { id: 'deggendorf', query: 'Deggendorf, Bayern, Deutschland' },
  { id: 'cham', query: 'Cham, Bayern, Deutschland' },
  { id: 'schwandorf', query: 'Schwandorf, Bayern, Deutschland' },
  // Niedersachsen
  { id: 'cuxhaven', query: 'Cuxhaven, Niedersachsen, Deutschland' },
  { id: 'emden', query: 'Emden, Niedersachsen, Deutschland' },
  { id: 'delmenhorst', query: 'Delmenhorst, Niedersachsen, Deutschland' },
  { id: 'nordhorn', query: 'Nordhorn, Niedersachsen, Deutschland' },
  { id: 'meppen', query: 'Meppen, Niedersachsen, Deutschland' },
  // Sachsen
  { id: 'bautzen', query: 'Bautzen, Sachsen, Deutschland' },
  { id: 'pirna', query: 'Pirna, Sachsen, Deutschland' },
  { id: 'meissen', query: 'Meißen, Sachsen, Deutschland' },
  { id: 'freital', query: 'Freital, Sachsen, Deutschland' },
  { id: 'riesa', query: 'Riesa, Sachsen, Deutschland' },
];

const OFFICIAL = {
  buedingen: 'Büdingen',
  muellheim: 'Müllheim',
  ruedesheim_am_rhein: 'Rüdesheim am Rhein',
  biberach_an_der_riss: 'Biberach an der Riß',
  meissen: 'Meißen',
};

function isValid(hit) {
  if (!hit) return false;
  if (hit.class === 'boundary' && hit.type === 'administrative') return true;
  if (hit.class === 'place' && ['village', 'town', 'hamlet', 'municipality', 'city'].includes(hit.type)) return true;
  return false;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function nominatim(query) {
  const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
    q: query,
    format: 'json',
    limit: '3',
    addressdetails: '1',
    countrycodes: 'de',
  })}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'EuroBusinessHub-Platform/1.0 (settlement-import)' },
  });
  return res.json();
}

const results = [];
for (const c of CANDIDATES) {
  await sleep(1100);
  const hits = await nominatim(c.query);
  const hit = hits.find(isValid) ?? null;
  if (!hit) {
    results.push({ id: c.id, status: 'NOT_FOUND' });
    continue;
  }
  const addr = hit.address ?? {};
  results.push({
    id: c.id,
    name: OFFICIAL[c.id] ?? hit.name ?? c.query.split(',')[0],
    lat: +Number(hit.lat).toFixed(6),
    lng: +Number(hit.lon).toFixed(6),
    landkreis: (addr.county ?? '').replace(/^Landkreis\s+/, ''),
    federalState: addr.state ?? '',
    status: 'OK',
  });
  console.error(`OK ${c.id}`);
}

console.log(JSON.stringify(results, null, 2));
