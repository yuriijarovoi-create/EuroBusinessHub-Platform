/**
 * Reverse-geocode new Mosel imports to confirm OSM placement.
 */
const IMPORTS = [
  ['briedern', 50.110019, 7.208985],
  ['mesenich', 50.096995, 7.198017],
  ['sankt_aldegund', 50.079782, 7.130062],
  ['krov', 49.978447, 7.086691],
  ['enkirch', 49.983039, 7.125758],
  ['reil', 50.023587, 7.114749],
  ['neumagen_dhron', 49.862608, 6.902212],
  ['minheim', 49.865004, 6.936601],
  ['piesport', 49.881366, 6.919572],
  ['niederemmel', 49.878147, 6.924504],
  ['kesten', 49.900671, 6.956263],
  ['brauneberg', 49.908531, 6.985653],
  ['osann_monzel', 49.917139, 6.952409],
  ['graach', 49.935233, 7.063418],
  ['wehlen', 49.941592, 7.041569],
  ['zeltingen_rachtig', 49.955696, 7.00846],
  ['erden', 49.979314, 7.024616],
  ['urzig', 49.979306, 7.005638],
  ['loef', 49.973906, 7.043382],
  ['kinheim', 49.973188, 7.056555],
  ['koewerich', 49.839966, 6.871687],
  ['leiwen', 49.821922, 6.881337],
  ['trittenheim', 49.822044, 6.900022],
  ['detzem', 49.822806, 6.845067],
  ['longuich', 49.806935, 6.772895],
  ['mehring', 49.798028, 6.825346],
  ['fell', 49.7749, 6.780507],
  ['konz', 49.698495, 6.573645],
  ['wiltingen', 49.659172, 6.590185],
  ['burgen', 50.212045, 7.388241],
  ['hatzenport', 50.227991, 7.417635],
  ['kattenes', 50.251746, 7.441778],
  ['lehmen', 50.283939, 7.454023],
  ['niederfell', 50.290661, 7.462671],
  ['alken', 50.245615, 7.448285],
  ['winningen', 50.31388, 7.518218],
  ['bassenheim', 50.35877, 7.456835],
  ['urmitz', 50.414715, 7.519051],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
for (const [id, lat, lng] of IMPORTS) {
  await sleep(1100);
  const url = `https://nominatim.openstreetmap.org/reverse?${new URLSearchParams({
    lat: String(lat), lon: String(lng), format: 'json', addressdetails: '1', zoom: '14',
  })}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'EuroBusinessHub/1.0' } });
  const d = await res.json();
  const display = d.display_name ?? '';
  const village = d.address?.village ?? d.address?.town ?? d.address?.city ?? d.address?.municipality ?? '';
  const ok = display.toLowerCase().includes(id.replace(/_/g, ' ').split(' ')[0].slice(0, 4))
    || village.toLowerCase().includes(id.slice(0, 4))
    || display.toLowerCase().includes(id.replace(/_/g, '-').slice(0, 6));
  results.push({ id, ok, village, display: display.slice(0, 100) });
  console.error(`Verified ${id}`);
}
const failed = results.filter((r) => !r.ok);
console.log(JSON.stringify({ total: results.length, failed: failed.length, failed, all: results }, null, 2));
process.exit(failed.length ? 1 : 0);
