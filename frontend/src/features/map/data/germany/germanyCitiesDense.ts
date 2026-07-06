import type { City, ModuleId } from '@shared/types';

type Seed = Omit<City, 'mapX' | 'mapY'> & { mapX?: number; mapY?: number };

function de(
  id: string,
  name: string,
  lat: number,
  lng: number,
  businesses: number,
  mapTier: 1 | 2 | 3,
  modules: ModuleId[] = ['marketplace', 'transport', 'logistik'],
): Seed {
  return {
    id,
    name,
    country: 'Deutschland',
    countryCode: 'DE',
    lat,
    lng,
    businesses,
    activeModules: modules,
    mapTier,
    isMajorHub: mapTier === 1,
  };
}

/** 49 additional Germany cities — dense business network (Tier 3 unless noted) */
export const germanyCitiesDense: Seed[] = [
  // Tier 2 additions
  de('duisburg', 'Duisburg', 51.434, 6.762, 470, 2, ['marketplace', 'logistik', 'lager', 'transport']),
  de('muenster', 'Münster', 51.961, 7.626, 380, 2, ['marketplace', 'transport', 'partner']),
  de('bielefeld', 'Bielefeld', 52.020, 8.532, 380, 2, ['marketplace', 'logistik', 'unternehmen']),

  // Ruhr & NRW cluster
  de('bochum', 'Bochum', 51.481, 7.216, 260, 3, ['marketplace', 'transport', 'jobs']),
  de('wuppertal', 'Wuppertal', 51.256, 7.151, 250, 3, ['marketplace', 'logistik', 'transport']),
  de('gelsenkirchen', 'Gelsenkirchen', 51.517, 7.086, 240, 3, ['marketplace', 'lager', 'transport']),
  de('moenchengladbach', 'Mönchengladbach', 51.181, 6.442, 230, 3, ['marketplace', 'transport', 'logistik']),
  de('krefeld', 'Krefeld', 51.339, 6.585, 220, 3, ['marketplace', 'logistik', 'unternehmen']),
  de('oberhausen', 'Oberhausen', 51.496, 6.852, 210, 3, ['marketplace', 'transport', 'lager']),
  de('bottrop', 'Bottrop', 51.523, 6.928, 180, 3, ['marketplace', 'transport', 'logistik']),
  de('recklinghausen', 'Recklinghausen', 51.614, 7.198, 175, 3, ['marketplace', 'jobs', 'transport']),
  de('remscheid', 'Remscheid', 51.179, 7.189, 170, 3, ['marketplace', 'unternehmen', 'transport']),
  de('moers', 'Moers', 51.451, 6.626, 165, 3, ['marketplace', 'logistik', 'transport']),
  de('bergisch_gladbach', 'Bergisch Gladbach', 50.992, 7.127, 190, 3, ['marketplace', 'partner', 'services']),
  de('solingen', 'Solingen', 51.171, 7.084, 185, 3, ['marketplace', 'transport', 'unternehmen']),
  de('hagen', 'Hagen', 51.367, 7.463, 200, 3, ['marketplace', 'logistik', 'lager']),
  de('iserlohn', 'Iserlohn', 51.374, 7.696, 155, 3, ['marketplace', 'transport', 'jobs']),
  de('siegen', 'Siegen', 50.875, 8.024, 160, 3, ['marketplace', 'akademie', 'transport']),
  de('osnabrueck', 'Osnabrück', 52.279, 8.047, 240, 3, ['marketplace', 'logistik', 'transport']),
  de('paderborn', 'Paderborn', 51.718, 8.757, 195, 3, ['marketplace', 'transport', 'ki']),
  de('guetersloh', 'Gütersloh', 51.906, 8.385, 180, 3, ['marketplace', 'logistik', 'partner']),
  de('leverkusen', 'Leverkusen', 51.045, 6.986, 210, 3, ['marketplace', 'unternehmen', 'logistik']),

  // Northern Germany
  de('braunschweig', 'Braunschweig', 52.269, 10.521, 280, 3, ['marketplace', 'transport', 'akademie']),
  de('oldenburg', 'Oldenburg', 53.143, 8.214, 220, 3, ['marketplace', 'logistik', 'transport']),
  de('hildesheim', 'Hildesheim', 52.151, 9.951, 170, 3, ['marketplace', 'transport', 'jobs']),
  de('wolfsburg', 'Wolfsburg', 52.422, 10.787, 230, 3, ['marketplace', 'logistik', 'unternehmen']),
  de('bremerhaven', 'Bremerhaven', 53.539, 8.581, 200, 3, ['marketplace', 'transport', 'lager']),
  de('wilhelmshaven', 'Wilhelmshaven', 53.517, 8.106, 280, 3, ['marketplace', 'transport', 'lager', 'logistik']),
  de('schwerin', 'Schwerin', 53.635, 11.401, 165, 3, ['marketplace', 'transport', 'partner']),

  // Eastern Germany
  de('chemnitz', 'Chemnitz', 50.832, 12.925, 270, 3, ['marketplace', 'unternehmen', 'transport']),
  de('halle', 'Halle (Saale)', 51.482, 11.970, 260, 3, ['marketplace', 'akademie', 'logistik']),
  de('potsdam', 'Potsdam', 52.391, 13.065, 250, 3, ['marketplace', 'ki', 'digitale-produkte']),
  de('cottbus', 'Cottbus', 51.756, 14.333, 160, 3, ['marketplace', 'transport', 'logistik']),
  de('zwickau', 'Zwickau', 50.718, 12.496, 150, 3, ['marketplace', 'transport', 'unternehmen']),
  de('jena', 'Jena', 50.928, 11.586, 185, 3, ['marketplace', 'ki', 'akademie']),

  // Central & Southern Germany
  de('kassel', 'Kassel', 51.312, 9.480, 240, 3, ['marketplace', 'logistik', 'transport']),
  de('goettingen', 'Göttingen', 51.541, 9.936, 175, 3, ['marketplace', 'akademie', 'transport']),
  de('ludwigshafen', 'Ludwigshafen', 49.477, 8.435, 220, 3, ['marketplace', 'logistik', 'unternehmen']),
  de('heidelberg', 'Heidelberg', 49.398, 8.672, 210, 3, ['marketplace', 'ki', 'services']),
  de('darmstadt', 'Darmstadt', 49.872, 8.651, 205, 3, ['marketplace', 'ki', 'akademie']),
  de('offenbach', 'Offenbach am Main', 50.095, 8.776, 190, 3, ['marketplace', 'transport', 'services']),
  de('ingolstadt', 'Ingolstadt', 48.766, 11.426, 225, 3, ['marketplace', 'logistik', 'unternehmen']),
  de('fuerth', 'Fürth', 49.477, 10.989, 180, 3, ['marketplace', 'transport', 'partner']),
  de('wuerzburg', 'Würzburg', 49.794, 9.929, 185, 3, ['marketplace', 'akademie', 'transport']),
  de('erlangen', 'Erlangen', 49.598, 11.004, 195, 3, ['marketplace', 'ki', 'unternehmen']),
  de('heilbronn', 'Heilbronn', 49.142, 9.218, 175, 3, ['marketplace', 'logistik', 'transport']),
  de('pforzheim', 'Pforzheim', 48.892, 8.694, 170, 3, ['marketplace', 'unternehmen', 'transport']),
  de('reutlingen', 'Reutlingen', 48.491, 9.204, 165, 3, ['marketplace', 'transport', 'jobs']),
  de('trier', 'Trier', 49.749, 6.637, 180, 3, ['marketplace', 'transport', 'partner']),
  de('koblenz', 'Koblenz', 50.356, 7.594, 175, 3, ['marketplace', 'logistik', 'transport']),
  de('kaiserslautern', 'Kaiserslautern', 49.444, 7.769, 170, 3, ['marketplace', 'akademie', 'transport']),

  // Saarland cluster — regional business towns (Tier 3)
  de('neunkirchen', 'Neunkirchen', 49.344, 7.175, 165, 3, ['marketplace', 'transport', 'logistik']),
  de('homburg', 'Homburg', 49.326, 7.339, 155, 3, ['marketplace', 'transport', 'jobs']),
  de('voelklingen', 'Völklingen', 49.252, 6.859, 150, 3, ['marketplace', 'logistik', 'transport']),
  de('saarlouis', 'Saarlouis', 49.314, 6.752, 140, 3, ['marketplace', 'transport', 'logistik']),
  de('sankt_ingbert', 'Sankt Ingbert', 49.277, 7.117, 145, 3, ['marketplace', 'transport', 'unternehmen']),
  de('merzig', 'Merzig', 49.443, 6.638, 125, 3, ['marketplace', 'transport', 'logistik']),
  de('st_wendel', 'St. Wendel', 49.467, 7.169, 115, 3, ['marketplace', 'transport', 'jobs']),
  de('dillingen_saar', 'Dillingen/Saar', 49.355, 6.728, 110, 3, ['marketplace', 'logistik', 'transport']),
  de('lebach', 'Lebach', 49.411, 6.910, 105, 3, ['marketplace', 'transport', 'jobs']),
  de('ottweiler', 'Ottweiler', 49.404, 7.163, 95, 3, ['marketplace', 'transport', 'jobs']),
  de('blieskastel', 'Blieskastel', 49.237, 7.257, 100, 3, ['marketplace', 'logistik', 'transport']),

  // Sachsen-Anhalt — missing from Bundesland list
  de('stendal', 'Stendal', 52.606, 11.858, 120, 3, ['marketplace', 'transport', 'logistik']),

  // Rheinland-Pfalz — regional business cities (Tier 3)
  de('frankenthal', 'Frankenthal', 49.534, 8.354, 155, 3, ['marketplace', 'transport', 'logistik']),
  de('ingelheim', 'Ingelheim am Rhein', 49.97, 8.058, 145, 3, ['marketplace', 'unternehmen', 'transport']),
  de('lahnstein', 'Lahnstein', 50.301, 7.608, 115, 3, ['marketplace', 'transport', 'partner']),
  de('germersheim', 'Germersheim', 49.215, 8.364, 125, 3, ['marketplace', 'logistik', 'transport']),
];
