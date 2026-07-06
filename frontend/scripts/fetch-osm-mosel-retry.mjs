/**
 * Retry / supplement OSM Nominatim lookups for Mosel settlements.
 */
const CANDIDATES = [
  { id: 'winningen', query: 'Winningen, Mosel, Rheinland-Pfalz, Deutschland' },
  { id: 'hatzenport', query: 'Hatzenport, Mosel, Rheinland-Pfalz, Deutschland' },
  { id: 'burgen', query: 'Burgen, Mosel, Rheinland-Pfalz, Deutschland' },
  { id: 'kattenes', query: 'Kattenes, Mosel, Rheinland-Pfalz, Deutschland' },
  { id: 'reil', query: 'Reil, Mosel, Rheinland-Pfalz, Deutschland' },
  { id: 'alken', query: 'Alken an der Mosel, Cochem-Zell, Rheinland-Pfalz, Deutschland' },
  { id: 'gondorf', query: 'Gondorf, Cochem-Zell, Rheinland-Pfalz, Deutschland' },
  { id: 'enkirch', query: 'Enkirch, Bernkastel-Wittlich, Rheinland-Pfalz, Deutschland' },
  { id: 'osann_monzel', query: 'Osann-Monzel, Bernkastel-Wittlich, Rheinland-Pfalz, Deutschland' },
  { id: 'niederfell', query: 'Niederfell, Bernkastel-Wittlich, Rheinland-Pfalz, Deutschland' },
  { id: 'niederemmel', query: 'Niederemmel, Bernkastel-Wittlich, Rheinland-Pfalz, Deutschland' },
  { id: 'mehring', query: 'Mehring, Trier-Saarburg, Rheinland-Pfalz, Deutschland' },
  { id: 'fils', query: 'Fils, Trier-Saarburg, Rheinland-Pfalz, Deutschland' },
  { id: 'fell', query: 'Fell, Trier-Saarburg, Rheinland-Pfalz, Deutschland' },
  { id: 'kaifen', query: 'Kaifen, Cochem-Zell, Rheinland-Pfalz, Deutschland' },
  { id: 'lehmen', query: 'Lehmen, Mayen-Koblenz, Rheinland-Pfalz, Deutschland' },
  { id: 'bassenheim', query: 'Bassenheim, Mayen-Koblenz, Rheinland-Pfalz, Deutschland' },
  { id: 'urmitz', query: 'Urmitz, Mayen-Koblenz, Rheinland-Pfalz, Deutschland' },
  { id: 'loesnich', query: 'Lösnich, Bernkastel-Wittlich, Rheinland-Pfalz, Deutschland' },
];

const OFFICIAL_NAMES = {
  krov: 'Kröv',
  urzig: 'Ürzig',
  loef: 'Lösnich',
  koewerich: 'Köwerich',
};

function isValidSettlement(hit) {
  if (!hit) return false;
  if (hit.class === 'boundary' && hit.type === 'administrative') return true;
  if (hit.class === 'place' && ['village', 'town', 'hamlet', 'suburb', 'municipality'].includes(hit.type)) return true;
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
  })}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'EuroBusinessHub-Platform/1.0 (settlement-import; contact: dev@local)' },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

const results = [];
for (const c of CANDIDATES) {
  await sleep(1100);
  try {
    const hits = await nominatim(c.query);
    const hit = hits.find(isValidSettlement) ?? null;
    if (!hit) {
      results.push({ id: c.id, query: c.query, status: 'NOT_FOUND', candidates: hits.length });
      continue;
    }
    const lat = Number(hit.lat);
    const lon = Number(hit.lon);
    const addr = hit.address ?? {};
    const officialName = OFFICIAL_NAMES[c.id] ?? (hit.name || c.query.split(',')[0]);
    results.push({
      id: c.id,
      name: officialName,
      lat: +lat.toFixed(6),
      lng: +lon.toFixed(6),
      osm_type: hit.osm_type,
      osm_id: hit.osm_id,
      place_class: hit.class,
      place_type: hit.type,
      landkreis: addr.county ?? '',
      municipality: addr.municipality ?? addr.city ?? addr.town ?? addr.village ?? '',
      display_name: hit.display_name,
      status: 'OK',
    });
  } catch (e) {
    results.push({ id: c.id, status: 'ERROR', error: String(e) });
  }
  console.error(`Fetched ${c.id}...`);
}

console.log(JSON.stringify(results, null, 2));
