/**
 * Fetch OSM Nominatim coordinates for Mosel corridor settlements.
 * Usage: node scripts/fetch-osm-mosel-coords.mjs
 */
const CANDIDATES = [
  { id: 'briedern', query: 'Briedern, Cochem-Zell, Rheinland-Pfalz, Germany' },
  { id: 'mesenich', query: 'Mesenich, Cochem-Zell, Rheinland-Pfalz, Germany' },
  { id: 'winningen', query: 'Winningen, Cochem-Zell, Rheinland-Pfalz, Germany' },
  { id: 'hatzenport', query: 'Hatzenport, Cochem-Zell, Rheinland-Pfalz, Germany' },
  { id: 'burgen', query: 'Burgen, Cochem-Zell, Rheinland-Pfalz, Germany' },
  { id: 'krov', query: 'Kröv, Bernkastel-Wittlich, Rheinland-Pfalz, Germany' },
  { id: 'neumagen_dhron', query: 'Neumagen-Dhron, Bernkastel-Wittlich, Rheinland-Pfalz, Germany' },
  { id: 'piesport', query: 'Piesport, Bernkastel-Wittlich, Rheinland-Pfalz, Germany' },
  { id: 'leiwen', query: 'Leiwen, Trier-Saarburg, Rheinland-Pfalz, Germany' },
  { id: 'graach', query: 'Graach an der Mosel, Bernkastel-Wittlich, Rheinland-Pfalz, Germany' },
  { id: 'wehlen', query: 'Wehlen, Bernkastel-Wittlich, Rheinland-Pfalz, Germany' },
  { id: 'zeltingen_rachtig', query: 'Zeltingen-Rachtig, Bernkastel-Wittlich, Rheinland-Pfalz, Germany' },
  { id: 'erden', query: 'Erden, Bernkastel-Wittlich, Rheinland-Pfalz, Germany' },
  { id: 'urzig', query: 'Ürzig, Bernkastel-Wittlich, Rheinland-Pfalz, Germany' },
  { id: 'kinheim', query: 'Kinheim, Bernkastel-Wittlich, Rheinland-Pfalz, Germany' },
  { id: 'loef', query: 'Lösnich, Bernkastel-Wittlich, Rheinland-Pfalz, Germany' },
  { id: 'brauneberg', query: 'Brauneberg, Bernkastel-Wittlich, Rheinland-Pfalz, Germany' },
  { id: 'alken', query: 'Alken, Cochem-Zell, Rheinland-Pfalz, Germany' },
  { id: 'kattenes', query: 'Kattenes, Cochem-Zell, Rheinland-Pfalz, Germany' },
  { id: 'reil', query: 'Reil, Cochem-Zell, Rheinland-Pfalz, Germany' },
  { id: 'trittenheim', query: 'Trittenheim, Trier-Saarburg, Rheinland-Pfalz, Germany' },
  { id: 'detzem', query: 'Detzem, Trier-Saarburg, Rheinland-Pfalz, Germany' },
  { id: 'konz', query: 'Konz, Trier-Saarburg, Rheinland-Pfalz, Germany' },
  { id: 'wiltingen', query: 'Wiltingen, Trier-Saarburg, Rheinland-Pfalz, Germany' },
  { id: 'longuich', query: 'Longuich, Trier-Saarburg, Rheinland-Pfalz, Germany' },
  { id: 'koewerich', query: 'Köwerich, Trier-Saarburg, Rheinland-Pfalz, Germany' },
  { id: 'sankt_aldegund', query: 'Sankt Aldegund, Cochem-Zell, Rheinland-Pfalz, Germany' },
  { id: 'minheim', query: 'Minheim, Bernkastel-Wittlich, Rheinland-Pfalz, Germany' },
  { id: 'kesten', query: 'Kesten, Bernkastel-Wittlich, Rheinland-Pfalz, Germany' },
  { id: 'gondorf', query: 'Gondorf, Cochem-Zell, Rheinland-Pfalz, Germany' },
];

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function nominatim(query) {
  const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
    q: query,
    format: 'json',
    limit: '1',
    addressdetails: '1',
  })}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'EuroBusinessHub-Platform/1.0 (settlement-import; contact: dev@local)' },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const data = await res.json();
  return data[0] ?? null;
}

const results = [];
for (const c of CANDIDATES) {
  await sleep(1100);
  try {
    const hit = await nominatim(c.query);
    if (!hit) {
      results.push({ ...c, status: 'NOT_FOUND' });
      continue;
    }
    const lat = Number(hit.lat);
    const lon = Number(hit.lon);
    const type = hit.type;
    const cls = hit.class;
    const display = hit.display_name;
    const addr = hit.address ?? {};
    results.push({
      id: c.id,
      name: hit.name ?? c.query.split(',')[0],
      lat: +lat.toFixed(6),
      lng: +lon.toFixed(6),
      osm_type: hit.osm_type,
      osm_id: hit.osm_id,
      place_class: cls,
      place_type: type,
      landkreis: addr.county ?? addr.municipality ?? '',
      display_name: display,
      status: 'OK',
    });
  } catch (e) {
    results.push({ ...c, status: 'ERROR', error: String(e) });
  }
  console.error(`Fetched ${c.id}...`);
}

console.log(JSON.stringify(results, null, 2));
