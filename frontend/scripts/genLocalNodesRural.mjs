import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const seedFiles = [
  'data/cities.ts',
  'features/map/data/germany/germanyCitiesDense.ts',
  'features/map/data/germany/germanyCitiesExtra.ts',
  'features/map/data/germany/germanyLocalNodes.generated.ts',
  'features/map/data/germany/germanyRegionalClusters.generated.ts',
];

const existing = new Set();
for (const f of seedFiles) {
  const src = fs.readFileSync(path.join(root, f), 'utf8');
  for (const m of src.matchAll(/(?:de\(\s*['"]|id:\s*['"])([a-z0-9_]+)/g)) existing.add(m[1]);
}

function slug(name) {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .replace(/_+/g, '_');
}

/** [name, lat, lng, bl, state, region, hubId, hubName, pop, tourism?] */
const CLUSTERS = {
  rp: [
    ['Cochem', 50.145, 7.168, 'DE-RP', 'Rheinland-Pfalz', 'Mosel', 'koblenz', 'Koblenz', 5200, 1],
    ['Bruttig-Fankel', 50.133, 7.133, 'DE-RP', 'Rheinland-Pfalz', 'Mosel', 'koblenz', 'Koblenz', 1100, 1],
    ['Ernst', 50.148, 7.152, 'DE-RP', 'Rheinland-Pfalz', 'Mosel', 'cochem', 'Cochem', 600, 1],
    ['Valwig', 50.158, 7.198, 'DE-RP', 'Rheinland-Pfalz', 'Mosel', 'cochem', 'Cochem', 1800, 1],
    ['Ellenz-Poltersdorf', 50.133, 7.233, 'DE-RP', 'Rheinland-Pfalz', 'Mosel', 'cochem', 'Cochem', 3500, 1],
    ['Beilstein', 50.100, 7.133, 'DE-RP', 'Rheinland-Pfalz', 'Mosel', 'cochem', 'Cochem', 150, 1],
    ['Ediger-Eller', 50.117, 7.117, 'DE-RP', 'Rheinland-Pfalz', 'Mosel', 'cochem', 'Cochem', 950, 1],
    ['Bremm', 50.117, 7.117, 'DE-RP', 'Rheinland-Pfalz', 'Mosel', 'cochem', 'Cochem', 800, 1],
    ['Zell an der Mosel', 50.028, 7.183, 'DE-RP', 'Rheinland-Pfalz', 'Mosel', 'koblenz', 'Koblenz', 4100, 1],
    ['Traben-Trarbach', 49.953, 7.117, 'DE-RP', 'Rheinland-Pfalz', 'Mosel', 'trier', 'Trier', 5800, 1],
    ['Bernkastel-Kues', 49.915, 7.069, 'DE-RP', 'Rheinland-Pfalz', 'Mosel', 'trier', 'Trier', 7500, 1],
    ['Wittlich', 49.985, 6.893, 'DE-RP', 'Rheinland-Pfalz', 'Eifel', 'trier', 'Trier', 19000],
    ['Daun', 50.197, 6.829, 'DE-RP', 'Rheinland-Pfalz', 'Eifel', 'koblenz', 'Koblenz', 8500],
    ['Gerolstein', 50.222, 6.660, 'DE-RP', 'Rheinland-Pfalz', 'Eifel', 'koblenz', 'Koblenz', 7800],
    ['Mayen', 50.327, 7.223, 'DE-RP', 'Rheinland-Pfalz', 'Eifel', 'koblenz', 'Koblenz', 19000],
    ['Mendig', 50.367, 7.300, 'DE-RP', 'Rheinland-Pfalz', 'Eifel', 'koblenz', 'Koblenz', 8800],
    ['Andernach', 50.439, 7.402, 'DE-RP', 'Rheinland-Pfalz', 'Mittelrhein', 'koblenz', 'Koblenz', 30000],
    ['Neuwied', 50.431, 7.471, 'DE-RP', 'Rheinland-Pfalz', 'Mittelrhein', 'koblenz', 'Koblenz', 66000],
    ['Boppard', 50.231, 7.590, 'DE-RP', 'Rheinland-Pfalz', 'Mittelrhein', 'koblenz', 'Koblenz', 7700, 1],
    ['Emmelshausen', 50.154, 7.554, 'DE-RP', 'Rheinland-Pfalz', 'Mittelrhein', 'koblenz', 'Koblenz', 4800],
    ['Kastellaun', 50.072, 7.444, 'DE-RP', 'Rheinland-Pfalz', 'Hunsrück', 'koblenz', 'Koblenz', 5200],
    ['Simmern', 49.983, 7.524, 'DE-RP', 'Rheinland-Pfalz', 'Hunsrück', 'mainz', 'Mainz', 8200],
    ['Kirchberg', 49.945, 7.407, 'DE-RP', 'Rheinland-Pfalz', 'Hunsrück', 'mainz', 'Mainz', 3800],
    ['Idar-Oberstein', 49.714, 7.304, 'DE-RP', 'Rheinland-Pfalz', 'Nahe', 'mainz', 'Mainz', 28000],
    ['Bad Kreuznach', 49.844, 7.867, 'DE-RP', 'Rheinland-Pfalz', 'Nahe', 'mainz', 'Mainz', 52000],
    ['Bingen am Rhein', 49.966, 7.899, 'DE-RP', 'Rheinland-Pfalz', 'Mittelrhein', 'mainz', 'Mainz', 26000],
    ['Alzey', 49.747, 8.116, 'DE-RP', 'Rheinland-Pfalz', 'Rheinhessen', 'mainz', 'Mainz', 18000],
    ['Worms', 49.634, 8.350, 'DE-RP', 'Rheinland-Pfalz', 'Rheinhessen', 'mannheim', 'Mannheim', 83000],
    ['Speyer', 49.317, 8.431, 'DE-RP', 'Rheinland-Pfalz', 'Rheinhessen', 'mannheim', 'Mannheim', 51000],
    ['Landau in der Pfalz', 49.199, 8.107, 'DE-RP', 'Rheinland-Pfalz', 'Pfalz', 'karlsruhe', 'Karlsruhe', 47000],
    ['Neustadt an der Weinstraße', 49.353, 8.139, 'DE-RP', 'Rheinland-Pfalz', 'Pfalz', 'mannheim', 'Mannheim', 53000, 1],
    ['Pirmasens', 49.201, 7.605, 'DE-RP', 'Rheinland-Pfalz', 'Pfalz', 'kaiserslautern', 'Kaiserslautern', 41000],
    ['Zweibrücken', 49.247, 7.364, 'DE-RP', 'Rheinland-Pfalz', 'Pfalz', 'saarbruecken', 'Saarbrücken', 34000],
    ['Bitburg', 49.967, 6.527, 'DE-RP', 'Rheinland-Pfalz', 'Eifel', 'trier', 'Trier', 15000],
    ['Prüm', 50.206, 6.424, 'DE-RP', 'Rheinland-Pfalz', 'Eifel', 'trier', 'Trier', 9500],
  ],
  cologne: [
    ['Troisdorf', 50.816, 7.150, 'DE-NW', 'Nordrhein-Westfalen', 'Rhein-Sieg', 'cologne', 'Köln', 76000],
    ['Siegburg', 50.798, 7.207, 'DE-NW', 'Nordrhein-Westfalen', 'Rhein-Sieg', 'bonn', 'Bonn', 42000],
    ['Sankt Augustin', 50.775, 7.189, 'DE-NW', 'Nordrhein-Westfalen', 'Rhein-Sieg', 'bonn', 'Bonn', 56000],
    ['Hennef', 50.776, 7.283, 'DE-NW', 'Nordrhein-Westfalen', 'Rhein-Sieg', 'bonn', 'Bonn', 48000],
    ['Königswinter', 50.676, 7.192, 'DE-NW', 'Nordrhein-Westfalen', 'Rhein-Sieg', 'bonn', 'Bonn', 42000, 1],
    ['Bad Honnef', 50.643, 7.227, 'DE-NW', 'Nordrhein-Westfalen', 'Rhein-Sieg', 'bonn', 'Bonn', 26000, 1],
    ['Bornheim', 50.763, 6.989, 'DE-NW', 'Nordrhein-Westfalen', 'Rhein-Erft', 'cologne', 'Köln', 48000],
    ['Brühl', 50.829, 6.905, 'DE-NW', 'Nordrhein-Westfalen', 'Rhein-Erft', 'cologne', 'Köln', 45000, 1],
    ['Wesseling', 50.827, 6.975, 'DE-NW', 'Nordrhein-Westfalen', 'Rhein-Erft', 'cologne', 'Köln', 38000],
    ['Euskirchen', 50.660, 6.787, 'DE-NW', 'Nordrhein-Westfalen', 'Eifel', 'cologne', 'Köln', 58000],
    ['Mechernich', 50.593, 6.652, 'DE-NW', 'Nordrhein-Westfalen', 'Eifel', 'cologne', 'Köln', 28000],
    ['Schleiden', 50.533, 6.467, 'DE-NW', 'Nordrhein-Westfalen', 'Eifel', 'cologne', 'Köln', 13000],
    ['Monschau', 50.554, 6.240, 'DE-NW', 'Nordrhein-Westfalen', 'Eifel', 'aachen', 'Aachen', 12000, 1],
    ['Düren', 50.804, 6.483, 'DE-NW', 'Nordrhein-Westfalen', 'Rheinland', 'cologne', 'Köln', 95000],
    ['Jülich', 50.921, 6.362, 'DE-NW', 'Nordrhein-Westfalen', 'Rheinland', 'aachen', 'Aachen', 34000],
    ['Erftstadt', 50.798, 6.765, 'DE-NW', 'Nordrhein-Westfalen', 'Rhein-Erft', 'cologne', 'Köln', 52000],
    ['Kerpen', 50.872, 6.693, 'DE-NW', 'Nordrhein-Westfalen', 'Rhein-Erft', 'cologne', 'Köln', 68000],
    ['Bergheim', 50.955, 6.640, 'DE-NW', 'Nordrhein-Westfalen', 'Rhein-Erft', 'cologne', 'Köln', 62000],
    ['Pulheim', 50.999, 6.803, 'DE-NW', 'Nordrhein-Westfalen', 'Rhein-Erft', 'cologne', 'Köln', 55000],
    ['Frechen', 50.915, 6.812, 'DE-NW', 'Nordrhein-Westfalen', 'Rhein-Erft', 'cologne', 'Köln', 52000],
    ['Hürth', 50.871, 6.868, 'DE-NW', 'Nordrhein-Westfalen', 'Rhein-Erft', 'cologne', 'Köln', 60000],
    ['Leverkusen', 51.045, 6.986, 'DE-NW', 'Nordrhein-Westfalen', 'Rhein-Erft', 'cologne', 'Köln', 164000],
    ['Bergisch Gladbach', 50.992, 7.127, 'DE-NW', 'Nordrhein-Westfalen', 'Rhein-Berg', 'cologne', 'Köln', 111000],
    ['Overath', 50.933, 7.283, 'DE-NW', 'Nordrhein-Westfalen', 'Rhein-Berg', 'cologne', 'Köln', 27000],
    ['Gummersbach', 51.028, 7.565, 'DE-NW', 'Nordrhein-Westfalen', 'Oberberg', 'cologne', 'Köln', 51000],
  ],
  ruhr: [
    ['Oberhausen', 51.496, 6.852, 'DE-NW', 'Nordrhein-Westfalen', 'Ruhrgebiet', 'essen', 'Essen', 211000],
    ['Mülheim an der Ruhr', 51.431, 6.883, 'DE-NW', 'Nordrhein-Westfalen', 'Ruhrgebiet', 'essen', 'Essen', 170000],
    ['Bottrop', 51.523, 6.928, 'DE-NW', 'Nordrhein-Westfalen', 'Ruhrgebiet', 'essen', 'Essen', 117000],
    ['Gladbeck', 51.571, 6.983, 'DE-NW', 'Nordrhein-Westfalen', 'Ruhrgebiet', 'essen', 'Essen', 76000],
    ['Dorsten', 51.660, 6.965, 'DE-NW', 'Nordrhein-Westfalen', 'Ruhrgebiet', 'essen', 'Essen', 77000],
    ['Recklinghausen', 51.614, 7.198, 'DE-NW', 'Nordrhein-Westfalen', 'Ruhrgebiet', 'essen', 'Essen', 111000],
    ['Herne', 51.538, 7.216, 'DE-NW', 'Nordrhein-Westfalen', 'Ruhrgebiet', 'bochum', 'Bochum', 156000],
    ['Castrop-Rauxel', 51.556, 7.312, 'DE-NW', 'Nordrhein-Westfalen', 'Ruhrgebiet', 'dortmund', 'Dortmund', 75000],
    ['Hattingen', 51.399, 7.186, 'DE-NW', 'Nordrhein-Westfalen', 'Ruhrgebiet', 'essen', 'Essen', 56000],
    ['Witten', 51.443, 7.335, 'DE-NW', 'Nordrhein-Westfalen', 'Ruhrgebiet', 'bochum', 'Bochum', 96000],
    ['Sprockhövel', 51.350, 7.243, 'DE-NW', 'Nordrhein-Westfalen', 'Ruhrgebiet', 'bochum', 'Bochum', 24000],
    ['Ennepetal', 51.300, 7.367, 'DE-NW', 'Nordrhein-Westfalen', 'Ruhrgebiet', 'hagen', 'Hagen', 30000],
    ['Schwelm', 51.287, 7.295, 'DE-NW', 'Nordrhein-Westfalen', 'Ruhrgebiet', 'hagen', 'Hagen', 28000],
    ['Gevelsberg', 51.320, 7.339, 'DE-NW', 'Nordrhein-Westfalen', 'Ruhrgebiet', 'hagen', 'Hagen', 31000],
    ['Iserlohn', 51.374, 7.696, 'DE-NW', 'Nordrhein-Westfalen', 'Sauerland', 'dortmund', 'Dortmund', 92000],
    ['Lüdenscheid', 51.219, 7.628, 'DE-NW', 'Nordrhein-Westfalen', 'Sauerland', 'dortmund', 'Dortmund', 73000],
    ['Arnsberg', 51.396, 8.064, 'DE-NW', 'Nordrhein-Westfalen', 'Sauerland', 'dortmund', 'Dortmund', 74000],
    ['Meschede', 51.350, 8.283, 'DE-NW', 'Nordrhein-Westfalen', 'Sauerland', 'dortmund', 'Dortmund', 30000],
    ['Soest', 51.571, 8.106, 'DE-NW', 'Nordrhein-Westfalen', 'Westfalen', 'dortmund', 'Dortmund', 48000],
    ['Unna', 51.538, 7.689, 'DE-NW', 'Nordrhein-Westfalen', 'Ruhrgebiet', 'dortmund', 'Dortmund', 59000],
    ['Kamen', 51.593, 7.665, 'DE-NW', 'Nordrhein-Westfalen', 'Ruhrgebiet', 'dortmund', 'Dortmund', 44000],
    ['Ahlen', 51.763, 7.891, 'DE-NW', 'Nordrhein-Westfalen', 'Münsterland', 'muenster', 'Münster', 53000],
    ['Warendorf', 51.951, 7.988, 'DE-NW', 'Nordrhein-Westfalen', 'Münsterland', 'muenster', 'Münster', 38000],
    ['Minden', 52.289, 8.917, 'DE-NW', 'Nordrhein-Westfalen', 'Ostwestfalen', 'hanover', 'Hannover', 82000],
    ['Detmold', 51.938, 8.873, 'DE-NW', 'Nordrhein-Westfalen', 'Ostwestfalen', 'bielefeld', 'Bielefeld', 75000],
    ['Herford', 52.116, 8.671, 'DE-NW', 'Nordrhein-Westfalen', 'Ostwestfalen', 'bielefeld', 'Bielefeld', 66000],
    ['Rheine', 52.279, 7.437, 'DE-NW', 'Nordrhein-Westfalen', 'Münsterland', 'muenster', 'Münster', 76000],
    ['Ibbenbüren', 52.279, 7.717, 'DE-NW', 'Nordrhein-Westfalen', 'Münsterland', 'osnabrueck', 'Osnabrück', 51000],
    ['Greven', 52.093, 7.594, 'DE-NW', 'Nordrhein-Westfalen', 'Münsterland', 'muenster', 'Münster', 38000],
    ['Wesel', 51.658, 6.617, 'DE-NW', 'Nordrhein-Westfalen', 'Niederrhein', 'duesseldorf', 'Düsseldorf', 61000],
    ['Kleve', 51.789, 6.139, 'DE-NW', 'Nordrhein-Westfalen', 'Niederrhein', 'duesseldorf', 'Düsseldorf', 52000],
    ['Emmerich am Rhein', 51.833, 6.250, 'DE-NW', 'Nordrhein-Westfalen', 'Niederrhein', 'duesseldorf', 'Düsseldorf', 31000],
  ],
  bavaria: [
    ['Garmisch-Partenkirchen', 47.492, 11.096, 'DE-BY', 'Bayern', 'Alpen', 'munich', 'München', 27000, 1],
    ['Bad Tölz', 47.761, 11.558, 'DE-BY', 'Bayern', 'Alpen', 'munich', 'München', 18800, 1],
    ['Miesbach', 47.787, 11.833, 'DE-BY', 'Bayern', 'Alpen', 'munich', 'München', 11500],
    ['Tegernsee', 47.707, 11.758, 'DE-BY', 'Bayern', 'Alpen', 'munich', 'München', 4000, 1],
    ['Rosenheim', 47.856, 12.128, 'DE-BY', 'Bayern', 'Oberbayern', 'munich', 'München', 64000],
    ['Traunstein', 47.868, 12.643, 'DE-BY', 'Bayern', 'Oberbayern', 'munich', 'München', 21000],
    ['Freilassing', 47.840, 12.981, 'DE-BY', 'Bayern', 'Oberbayern', 'salzburg', 'Salzburg', 17000],
    ['Berchtesgaden', 47.631, 13.002, 'DE-BY', 'Bayern', 'Alpen', 'munich', 'München', 7800, 1],
    ['Mühldorf am Inn', 48.246, 12.524, 'DE-BY', 'Bayern', 'Oberbayern', 'munich', 'München', 19000],
    ['Altötting', 48.227, 12.677, 'DE-BY', 'Bayern', 'Oberbayern', 'munich', 'München', 13000, 1],
    ['Landshut', 48.537, 12.152, 'DE-BY', 'Bayern', 'Niederbayern', 'munich', 'München', 75000],
    ['Moosburg an der Isar', 48.470, 11.938, 'DE-BY', 'Bayern', 'Oberbayern', 'munich', 'München', 19000],
    ['Deggendorf', 48.833, 12.962, 'DE-BY', 'Bayern', 'Niederbayern', 'regensburg', 'Regensburg', 37000],
    ['Straubing', 48.881, 12.574, 'DE-BY', 'Bayern', 'Niederbayern', 'regensburg', 'Regensburg', 49000],
    ['Passau', 48.566, 13.431, 'DE-BY', 'Bayern', 'Niederbayern', 'regensburg', 'Regensburg', 53000],
    ['Cham', 49.223, 12.664, 'DE-BY', 'Bayern', 'Oberpfalz', 'regensburg', 'Regensburg', 17000],
    ['Schwandorf', 49.325, 12.110, 'DE-BY', 'Bayern', 'Oberpfalz', 'nuremberg', 'Nürnberg', 28000],
    ['Weiden in der Oberpfalz', 49.676, 12.177, 'DE-BY', 'Bayern', 'Oberpfalz', 'nuremberg', 'Nürnberg', 43000],
    ['Amberg', 49.442, 11.862, 'DE-BY', 'Bayern', 'Oberpfalz', 'nuremberg', 'Nürnberg', 42000],
    ['Neumarkt in der Oberpfalz', 49.280, 11.463, 'DE-BY', 'Bayern', 'Oberpfalz', 'nuremberg', 'Nürnberg', 40800],
    ['Ansbach', 49.301, 10.571, 'DE-BY', 'Bayern', 'Mittelfranken', 'nuremberg', 'Nürnberg', 42000],
    ['Rothenburg ob der Tauber', 49.378, 10.179, 'DE-BY', 'Bayern', 'Mittelfranken', 'nuremberg', 'Nürnberg', 11000, 1],
    ['Dinkelsbühl', 49.069, 10.320, 'DE-BY', 'Bayern', 'Mittelfranken', 'nuremberg', 'Nürnberg', 12000, 1],
    ['Donauwörth', 48.718, 10.778, 'DE-BY', 'Bayern', 'Schwaben', 'augsburg', 'Augsburg', 19000],
    ['Nördlingen', 48.851, 10.489, 'DE-BY', 'Bayern', 'Schwaben', 'augsburg', 'Augsburg', 21000, 1],
    ['Kempten', 47.728, 10.314, 'DE-BY', 'Bayern', 'Allgäu', 'munich', 'München', 69000],
    ['Memmingen', 47.987, 10.181, 'DE-BY', 'Bayern', 'Schwaben', 'augsburg', 'Augsburg', 45000],
    ['Lindau', 47.546, 9.684, 'DE-BY', 'Bayern', 'Allgäu', 'munich', 'München', 25000, 1],
    ['Kaufbeuren', 47.880, 10.622, 'DE-BY', 'Bayern', 'Schwaben', 'kempten', 'Kempten', 45000],
    ['Landsberg am Lech', 48.048, 10.873, 'DE-BY', 'Bayern', 'Oberbayern', 'munich', 'München', 29000],
  ],
  bw: [
    ['Heilbronn', 49.142, 9.218, 'DE-BW', 'Baden-Württemberg', 'Neckar', 'stuttgart', 'Stuttgart', 126000],
    ['Schwäbisch Hall', 49.112, 9.737, 'DE-BW', 'Baden-Württemberg', 'Hohenlohe', 'stuttgart', 'Stuttgart', 40000],
    ['Crailsheim', 49.134, 10.072, 'DE-BW', 'Baden-Württemberg', 'Hohenlohe', 'stuttgart', 'Stuttgart', 35000],
    ['Aalen', 48.837, 10.093, 'DE-BW', 'Baden-Württemberg', 'Ostwürttemberg', 'stuttgart', 'Stuttgart', 68000],
    ['Heidenheim an der Brenz', 48.676, 10.152, 'DE-BW', 'Baden-Württemberg', 'Ostwürttemberg', 'ulm', 'Ulm', 50000],
    ['Göppingen', 48.703, 9.652, 'DE-BW', 'Baden-Württemberg', 'Filstal', 'stuttgart', 'Stuttgart', 58000],
    ['Kirchheim unter Teck', 48.648, 9.452, 'DE-BW', 'Baden-Württemberg', 'Alb', 'stuttgart', 'Stuttgart', 41000],
    ['Nürtingen', 48.627, 9.340, 'DE-BW', 'Baden-Württemberg', 'Neckar', 'stuttgart', 'Stuttgart', 41000],
    ['Reutlingen', 48.491, 9.204, 'DE-BW', 'Baden-Württemberg', 'Neckar-Alb', 'stuttgart', 'Stuttgart', 116000],
    ['Tübingen', 48.521, 9.053, 'DE-BW', 'Baden-Württemberg', 'Neckar-Alb', 'stuttgart', 'Stuttgart', 90000],
    ['Balingen', 48.275, 8.855, 'DE-BW', 'Baden-Württemberg', 'Schwarzwald', 'stuttgart', 'Stuttgart', 34000],
    ['Rottweil', 48.168, 8.627, 'DE-BW', 'Baden-Württemberg', 'Schwarzwald', 'stuttgart', 'Stuttgart', 25000],
    ['Villingen-Schwenningen', 48.062, 8.458, 'DE-BW', 'Baden-Württemberg', 'Schwarzwald', 'freiburg', 'Freiburg', 86000],
    ['Donaueschingen', 47.955, 8.497, 'DE-BW', 'Baden-Württemberg', 'Baar', 'freiburg', 'Freiburg', 22000],
    ['Tuttlingen', 47.985, 8.818, 'DE-BW', 'Baden-Württemberg', 'Schwarzwald', 'stuttgart', 'Stuttgart', 36000],
    ['Singen', 47.759, 8.840, 'DE-BW', 'Baden-Württemberg', 'Bodensee', 'konstanz', 'Konstanz', 48000],
    ['Konstanz', 47.663, 9.176, 'DE-BW', 'Baden-Württemberg', 'Bodensee', 'stuttgart', 'Stuttgart', 85000, 1],
    ['Ravensburg', 47.782, 9.612, 'DE-BW', 'Baden-Württemberg', 'Bodensee', 'stuttgart', 'Stuttgart', 51000],
    ['Friedrichshafen', 47.654, 9.479, 'DE-BW', 'Baden-Württemberg', 'Bodensee', 'stuttgart', 'Stuttgart', 62000],
    ['Biberach an der Riß', 48.098, 9.787, 'DE-BW', 'Baden-Württemberg', 'Riß', 'ulm', 'Ulm', 34000],
    ['Ulm', 48.402, 9.987, 'DE-BW', 'Baden-Württemberg', 'Donau', 'stuttgart', 'Stuttgart', 126000],
    ['Lörrach', 47.614, 7.664, 'DE-BW', 'Baden-Württemberg', 'Markgräflerland', 'freiburg', 'Freiburg', 50000],
    ['Offenburg', 48.473, 7.945, 'DE-BW', 'Baden-Württemberg', 'Ortenau', 'freiburg', 'Freiburg', 61000],
    ['Lahr', 48.340, 7.874, 'DE-BW', 'Baden-Württemberg', 'Ortenau', 'freiburg', 'Freiburg', 47000],
    ['Baden-Baden', 48.761, 8.240, 'DE-BW', 'Baden-Württemberg', 'Baden', 'karlsruhe', 'Karlsruhe', 56000, 1],
    ['Rastatt', 48.857, 8.203, 'DE-BW', 'Baden-Württemberg', 'Baden', 'karlsruhe', 'Karlsruhe', 50000],
    ['Bruchsal', 49.124, 8.598, 'DE-BW', 'Baden-Württemberg', 'Kraichgau', 'karlsruhe', 'Karlsruhe', 45000],
  ],
  north: [
    ['Lüneburg', 53.250, 10.414, 'DE-NI', 'Niedersachsen', 'Lüneburg', 'hamburg', 'Hamburg', 77000],
    ['Uelzen', 52.965, 10.561, 'DE-NI', 'Niedersachsen', 'Lüneburg', 'hanover', 'Hannover', 34000],
    ['Soltau', 52.986, 9.843, 'DE-NI', 'Niedersachsen', 'Heide', 'hanover', 'Hannover', 22000],
    ['Rotenburg', 53.111, 9.404, 'DE-NI', 'Niedersachsen', 'Wümme', 'bremen', 'Bremen', 22000],
    ['Bremervörde', 53.484, 9.140, 'DE-NI', 'Niedersachsen', 'Elbe-Weser', 'bremen', 'Bremen', 19000],
    ['Cuxhaven', 53.867, 8.694, 'DE-NI', 'Niedersachsen', 'Nordsee', 'hamburg', 'Hamburg', 48000, 1],
    ['Wilhelmshaven', 53.517, 8.106, 'DE-NI', 'Niedersachsen', 'Jadebusen', 'bremen', 'Bremen', 76000],
    ['Emden', 53.367, 7.206, 'DE-NI', 'Niedersachsen', 'Ostfriesland', 'bremen', 'Bremen', 50000],
    ['Aurich', 53.469, 7.482, 'DE-NI', 'Niedersachsen', 'Ostfriesland', 'emden', 'Emden', 42000],
    ['Leer', 53.231, 7.461, 'DE-NI', 'Niedersachsen', 'Ostfriesland', 'emden', 'Emden', 35000],
    ['Papenburg', 53.077, 7.404, 'DE-NI', 'Niedersachsen', 'Emsland', 'bremen', 'Bremen', 38000],
    ['Cloppenburg', 52.847, 8.045, 'DE-NI', 'Niedersachsen', 'Oldenburg', 'osnabrueck', 'Osnabrück', 36000],
    ['Vechta', 52.726, 8.285, 'DE-NI', 'Niedersachsen', 'Oldenburg', 'osnabrueck', 'Osnabrück', 33000],
    ['Verden', 52.923, 9.234, 'DE-NI', 'Niedersachsen', 'Aller', 'bremen', 'Bremen', 27000],
    ['Walsrode', 52.861, 9.592, 'DE-NI', 'Niedersachsen', 'Heide', 'hanover', 'Hannover', 24000],
    ['Celle', 52.623, 10.081, 'DE-NI', 'Niedersachsen', 'Lüneburger Heide', 'hanover', 'Hannover', 70000],
    ['Gifhorn', 52.488, 10.546, 'DE-NI', 'Niedersachsen', 'Gifhorn', 'wolfsburg', 'Wolfsburg', 42000],
    ['Salzgitter', 52.150, 10.333, 'DE-NI', 'Niedersachsen', 'Südniedersachsen', 'hanover', 'Hannover', 104000],
    ['Goslar', 51.904, 10.428, 'DE-NI', 'Niedersachsen', 'Harz', 'hanover', 'Hannover', 51000, 1],
    ['Wolfenbüttel', 52.164, 10.541, 'DE-NI', 'Niedersachsen', 'Harz-Vorland', 'braunschweig', 'Braunschweig', 52000],
    ['Flensburg', 54.784, 9.439, 'DE-SH', 'Schleswig-Holstein', 'Nord', 'kiel', 'Kiel', 90000],
    ['Schleswig', 54.515, 9.549, 'DE-SH', 'Schleswig-Holstein', 'Schlei', 'kiel', 'Kiel', 25000],
    ['Husum', 54.476, 9.051, 'DE-SH', 'Schleswig-Holstein', 'Nordsee', 'kiel', 'Kiel', 22000, 1],
    ['Itzehoe', 53.925, 9.515, 'DE-SH', 'Schleswig-Holstein', 'Stör', 'hamburg', 'Hamburg', 32000],
    ['Neumünster', 54.071, 9.984, 'DE-SH', 'Schleswig-Holstein', 'Holstein', 'hamburg', 'Hamburg', 80000],
    ['Rendsburg', 54.303, 9.664, 'DE-SH', 'Schleswig-Holstein', 'MIT', 'kiel', 'Kiel', 29000],
    ['Eckernförde', 54.473, 9.836, 'DE-SH', 'Schleswig-Holstein', 'Ostsee', 'kiel', 'Kiel', 22000, 1],
    ['Heide', 54.196, 9.098, 'DE-SH', 'Schleswig-Holstein', 'Dithmarschen', 'hamburg', 'Hamburg', 21000],
  ],
  east: [
    ['Cottbus', 51.756, 14.333, 'DE-BB', 'Brandenburg', 'Lausitz', 'berlin', 'Berlin', 99000],
    ['Spremberg', 51.569, 14.378, 'DE-BB', 'Brandenburg', 'Lausitz', 'cottbus', 'Cottbus', 22000],
    ['Forst', 51.739, 14.637, 'DE-BB', 'Brandenburg', 'Lausitz', 'cottbus', 'Cottbus', 18000],
    ['Senftenberg', 51.525, 14.003, 'DE-BB', 'Brandenburg', 'Lausitz', 'cottbus', 'Cottbus', 24000],
    ['Hoyerswerda', 51.437, 14.247, 'DE-SN', 'Sachsen', 'Lausitz', 'dresden', 'Dresden', 33000],
    ['Kamenz', 51.270, 14.097, 'DE-SN', 'Sachsen', 'Oberlausitz', 'dresden', 'Dresden', 17000],
    ['Bischofswerda', 51.127, 14.179, 'DE-SN', 'Sachsen', 'Oberlausitz', 'dresden', 'Dresden', 11000],
    ['Zittau', 50.896, 14.807, 'DE-SN', 'Sachsen', 'Oberlausitz', 'dresden', 'Dresden', 27000],
    ['Freiberg', 50.910, 13.342, 'DE-SN', 'Sachsen', 'Mittelsachsen', 'dresden', 'Dresden', 41000],
    ['Döbeln', 51.122, 13.110, 'DE-SN', 'Sachsen', 'Mittelsachsen', 'leipzig', 'Leipzig', 24000],
    ['Mittweida', 50.986, 12.975, 'DE-SN', 'Sachsen', 'Mittelsachsen', 'chemnitz', 'Chemnitz', 14000],
    ['Glauchau', 50.819, 12.544, 'DE-SN', 'Sachsen', 'Zwickau', 'chemnitz', 'Chemnitz', 23000],
    ['Meerane', 50.846, 12.467, 'DE-SN', 'Sachsen', 'Zwickau', 'zwickau', 'Zwickau', 15000],
    ['Altenburg', 50.987, 12.433, 'DE-TH', 'Thüringen', 'Ostthüringen', 'leipzig', 'Leipzig', 33000],
    ['Zeitz', 51.049, 12.134, 'DE-ST', 'Sachsen-Anhalt', 'Burgenlandkreis', 'leipzig', 'Leipzig', 29000],
    ['Naumburg', 51.152, 11.810, 'DE-ST', 'Sachsen-Anhalt', 'Saale-Unstrut', 'leipzig', 'Leipzig', 33000],
    ['Weißenfels', 51.201, 11.968, 'DE-ST', 'Sachsen-Anhalt', 'Saale', 'leipzig', 'Leipzig', 40000],
    ['Merseburg', 51.354, 11.993, 'DE-ST', 'Sachsen-Anhalt', 'Saale', 'leipzig', 'Leipzig', 34000],
    ['Bernburg', 51.794, 11.737, 'DE-ST', 'Sachsen-Anhalt', 'Salzland', 'magdeburg', 'Magdeburg', 32000],
    ['Köthen', 51.751, 11.970, 'DE-ST', 'Sachsen-Anhalt', 'Anhalt', 'magdeburg', 'Magdeburg', 26000],
    ['Halberstadt', 51.896, 11.047, 'DE-ST', 'Sachsen-Anhalt', 'Harz', 'magdeburg', 'Magdeburg', 40000],
    ['Quedlinburg', 51.788, 11.150, 'DE-ST', 'Sachsen-Anhalt', 'Harz', 'magdeburg', 'Magdeburg', 24000, 1],
    ['Wernigerode', 51.835, 10.785, 'DE-ST', 'Sachsen-Anhalt', 'Harz', 'magdeburg', 'Magdeburg', 33000, 1],
    ['Nordhausen', 51.502, 10.791, 'DE-TH', 'Thüringen', 'Nordthüringen', 'leipzig', 'Leipzig', 42000],
    ['Sondershausen', 51.367, 10.870, 'DE-TH', 'Thüringen', 'Kyffhäuser', 'erfurt', 'Erfurt', 21000],
    ['Mühlhausen', 51.208, 10.452, 'DE-TH', 'Thüringen', 'Unstrut-Hainich', 'erfurt', 'Erfurt', 36000],
    ['Gotha', 50.948, 10.702, 'DE-TH', 'Thüringen', 'Mittelthüringen', 'erfurt', 'Erfurt', 46000],
    ['Eisenach', 50.975, 10.315, 'DE-TH', 'Thüringen', 'Wartburg', 'frankfurt', 'Frankfurt am Main', 43000],
    ['Suhl', 50.610, 10.693, 'DE-TH', 'Thüringen', 'Thüringer Wald', 'erfurt', 'Erfurt', 37000],
    ['Meiningen', 50.567, 10.415, 'DE-TH', 'Thüringen', 'Rhön', 'erfurt', 'Erfurt', 25000],
    ['Saalfeld', 50.648, 11.361, 'DE-TH', 'Thüringen', 'Saale-Orla', 'erfurt', 'Erfurt', 29000],
    ['Rudolstadt', 50.720, 11.340, 'DE-TH', 'Thüringen', 'Saale-Orla', 'erfurt', 'Erfurt', 25000],
  ],
};

const allRows = [];
for (const rows of Object.values(CLUSTERS)) {
  for (const row of rows) {
    const [name, lat, lng, bl, state, region, hubId, hubName, pop, tourism] = row;
    const id = slug(name);
    if (allRows.some((r) => r.id === id)) continue;
    allRows.push({ id, name, lat, lng, bundeslandId: bl, federalState: state, region, hubId, hubName, population: pop, tourism: !!tourism });
  }
}

const newDefs = [];
const enrichDefs = [];
for (const row of allRows) {
  if (existing.has(row.id)) enrichDefs.push(row);
  else newDefs.push(row);
}

console.log('Total requested:', allRows.length);
console.log('New tier-4 seeds:', newDefs.length);
console.log('Enrich only:', enrichDefs.length);

function emitDef(row, indent = '  ') {
  const lines = [
    `${indent}{`,
    `${indent}  id: ${JSON.stringify(row.id)},`,
    `${indent}  name: ${JSON.stringify(row.name)},`,
    `${indent}  lat: ${row.lat}, lng: ${row.lng},`,
    `${indent}  bundeslandId: ${JSON.stringify(row.bundeslandId)},`,
    `${indent}  federalState: ${JSON.stringify(row.federalState)},`,
    `${indent}  region: ${JSON.stringify(row.region)},`,
    `${indent}  nearestMajorCityId: ${JSON.stringify(row.hubId)},`,
    `${indent}  nearestMajorCity: ${JSON.stringify(row.hubName)},`,
    `${indent}  population: ${row.population},`,
  ];
  if (row.tourism) lines.push(`${indent}  tourism: true,`);
  lines.push(`${indent}},`);
  return lines.join('\n');
}

const outPath = path.join(root, 'features', 'map', 'data', 'germany', 'germanyLocalNodesRural.generated.ts');
const lines = [
  '/** Rural / village Tier-4 local nodes — generated */',
  'import type { RawLocalNodeDef } from \'./germanyLocalNodes.generated\';',
  '',
  'export const GERMANY_LOCAL_NODE_RURAL_DEFS: RawLocalNodeDef[] = [',
  ...newDefs.map((r) => emitDef(r)),
  '];',
  '',
  'export const GERMANY_LOCAL_NODE_RURAL_ENRICH: RawLocalNodeDef[] = [',
  ...enrichDefs.map((r) => emitDef(r)),
  '];',
  '',
];

fs.writeFileSync(outPath, lines.join('\n'));
console.log('Written', outPath);

// verify test cities
for (const testId of ['cochem', 'bruttig_fankel', 'garmisch_partenkirchen', 'wilhelmshaven', 'zittau']) {
  const inNew = newDefs.some((r) => r.id === testId);
  const inEnrich = enrichDefs.some((r) => r.id === testId);
  console.log(testId, inNew ? 'NEW' : inEnrich ? 'ENRICH' : 'MISSING');
}
