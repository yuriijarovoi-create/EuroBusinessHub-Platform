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
  isMajorHub?: boolean,
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
    isMajorHub: isMajorHub ?? mapTier === 1,
  };
}

/** 18 Germany business hubs (Tier 2–3) */
export const germanyCitiesExtra: Seed[] = [
  de('dresden', 'Dresden', 51.051, 13.738, 380, 2, ['marketplace', 'transport', 'akademie']),
  de('essen', 'Essen', 51.455, 7.011, 520, 2, ['marketplace', 'logistik', 'lager']),
  de('mannheim', 'Mannheim', 49.487, 8.466, 440, 2, ['marketplace', 'transport', 'unternehmen']),
  de('karlsruhe', 'Karlsruhe', 49.007, 8.404, 410, 2, ['marketplace', 'ki', 'digitale-produkte']),
  de('bonn', 'Bonn', 50.737, 7.098, 360, 2, ['marketplace', 'partner', 'services']),
  de('aachen', 'Aachen', 50.776, 6.083, 320, 3, ['marketplace', 'akademie', 'transport']),
  de('kiel', 'Kiel', 54.323, 10.139, 290, 3, ['marketplace', 'transport', 'logistik']),
  de('rostock', 'Rostock', 54.092, 12.140, 310, 3, ['marketplace', 'transport', 'lager']),
  de('magdeburg', 'Magdeburg', 52.120, 11.627, 280, 3, ['marketplace', 'logistik', 'jobs']),
  de('erfurt', 'Erfurt', 50.978, 11.029, 260, 3, ['marketplace', 'akademie', 'partner']),
  de('mainz', 'Mainz', 49.992, 8.247, 340, 3, ['marketplace', 'transport', 'services']),
  de('wiesbaden', 'Wiesbaden', 50.078, 8.239, 330, 3, ['marketplace', 'partner', 'unternehmen']),
  de('saarbruecken', 'Saarbrücken', 49.240, 6.996, 270, 3, ['marketplace', 'transport', 'logistik']),
  de('freiburg', 'Freiburg im Breisgau', 47.999, 7.842, 300, 3, ['marketplace', 'akademie', 'ki']),
  de('ulm', 'Ulm', 48.402, 9.987, 290, 3, ['marketplace', 'unternehmen', 'transport']),
  de('regensburg', 'Regensburg', 49.013, 12.102, 310, 3, ['marketplace', 'logistik', 'transport']),
  de('augsburg', 'Augsburg', 48.371, 10.898, 350, 3, ['marketplace', 'transport', 'lager']),
  de('luebeck', 'Lübeck', 53.866, 10.687, 280, 3, ['marketplace', 'transport', 'logistik']),
];
