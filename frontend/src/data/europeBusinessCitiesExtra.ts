import type { City, ModuleId } from '@shared/types';

type CitySeed = Omit<City, 'mapX' | 'mapY'> & { mapX?: number; mapY?: number };

function c(
  id: string,
  name: string,
  country: string,
  countryCode: string,
  lat: number,
  lng: number,
  businesses: number,
  activeModules: ModuleId[] = ['marketplace', 'transport'],
  isMajorHub?: boolean,
): CitySeed {
  return { id, name, country, countryCode, lat, lng, businesses, activeModules, isMajorHub };
}

/** Additional major European business cities — merged into cities.ts */
export const europeBusinessCitiesExtra: CitySeed[] = [
  // France — major business hubs
  c('lille', 'Lille', 'Frankreich', 'FR', 50.629, 3.057, 520, ['marketplace', 'logistik', 'jobs'], true),
  c('bordeaux', 'Bordeaux', 'Frankreich', 'FR', 44.837, -0.579, 440, ['marketplace', 'transport', 'partner'], true),
  c('toulouse', 'Toulouse', 'Frankreich', 'FR', 43.604, 1.444, 480, ['marketplace', 'transport', 'akademie'], true),
  c('nice', 'Nice', 'Frankreich', 'FR', 43.71, 7.262, 410, ['marketplace', 'partner', 'transport'], true),
  c('strasbourg', 'Straßburg', 'Frankreich', 'FR', 48.573, 7.753, 390, ['marketplace', 'partner', 'unternehmen'], true),
  c('nantes', 'Nantes', 'Frankreich', 'FR', 47.218, -1.554, 370, ['marketplace', 'transport', 'logistik'], true),
  c('lehavre', 'Le Havre', 'Frankreich', 'FR', 49.494, 0.107, 360, ['marketplace', 'transport', 'logistik', 'lager'], true),
  c('rouen', 'Rouen', 'Frankreich', 'FR', 49.443, 1.099, 310, ['marketplace', 'transport', 'logistik'], true),
  c('reims', 'Reims', 'Frankreich', 'FR', 49.258, 4.031, 280, ['marketplace', 'logistik', 'jobs'], true),
  c('metz', 'Metz', 'Frankreich', 'FR', 49.119, 6.176, 290, ['marketplace', 'transport', 'logistik'], true),
  c('dijon', 'Dijon', 'Frankreich', 'FR', 47.322, 5.041, 270, ['marketplace', 'transport', 'akademie'], true),
  c('clermont', 'Clermont-Ferrand', 'Frankreich', 'FR', 45.777, 3.087, 260, ['marketplace', 'unternehmen', 'transport'], true),
  c('montpellier', 'Montpellier', 'Frankreich', 'FR', 43.611, 3.877, 340, ['marketplace', 'transport', 'ki'], true),
  c('grenoble', 'Grenoble', 'Frankreich', 'FR', 45.188, 5.724, 320, ['marketplace', 'transport', 'ki'], true),
  // Spain
  c('valencia', 'Valencia', 'Spanien', 'ES', 39.47, -0.376, 560, ['marketplace', 'transport', 'logistik']),
  c('seville', 'Sevilla', 'Spanien', 'ES', 37.389, -5.984, 490, ['marketplace', 'akademie', 'partner']),
  c('bilbao', 'Bilbao', 'Spanien', 'ES', 43.263, -2.935, 420, ['marketplace', 'transport', 'lager']),
  c('malaga', 'Málaga', 'Spanien', 'ES', 36.721, -4.421, 380, ['marketplace', 'partner', 'services']),
  c('zaragoza', 'Saragossa', 'Spanien', 'ES', 41.648, -0.889, 340, ['marketplace', 'logistik', 'transport']),
  // Italy
  c('turin', 'Turin', 'Italien', 'IT', 45.07, 7.687, 620, ['marketplace', 'unternehmen', 'transport']),
  c('naples', 'Neapel', 'Italien', 'IT', 40.851, 14.268, 580, ['marketplace', 'transport', 'jobs']),
  c('bologna', 'Bologna', 'Italien', 'IT', 44.494, 11.343, 450, ['marketplace', 'akademie', 'logistik']),
  c('venice', 'Venedig', 'Italien', 'IT', 45.44, 12.316, 360, ['marketplace', 'partner', 'transport']),
  c('genoa', 'Genua', 'Italien', 'IT', 44.405, 8.946, 410, ['marketplace', 'transport', 'logistik'], true),
  c('florence', 'Florenz', 'Italien', 'IT', 43.769, 11.256, 390, ['marketplace', 'partner', 'digitale-produkte']),
  // Netherlands
  c('rotterdam', 'Rotterdam', 'Niederlande', 'NL', 51.924, 4.478, 680, ['marketplace', 'transport', 'logistik', 'lager'], true),
  c('eindhoven', 'Eindhoven', 'Niederlande', 'NL', 51.441, 5.47, 420, ['marketplace', 'unternehmen', 'ki']),
  c('utrecht', 'Utrecht', 'Niederlande', 'NL', 52.09, 5.122, 380, ['marketplace', 'jobs', 'akademie']),
  // Belgium
  c('antwerp', 'Antwerpen', 'Belgien', 'BE', 51.219, 4.402, 520, ['marketplace', 'transport', 'logistik'], true),
  c('ghent', 'Gent', 'Belgien', 'BE', 51.054, 3.717, 340, ['marketplace', 'partner', 'services']),
  c('liege', 'Lüttich', 'Belgien', 'BE', 50.633, 5.567, 310, ['marketplace', 'logistik', 'transport']),
  // Poland
  c('gdansk', 'Danzig', 'Polen', 'PL', 54.352, 18.646, 440, ['marketplace', 'transport', 'logistik']),
  c('poznan', 'Posen', 'Polen', 'PL', 52.406, 16.925, 410, ['marketplace', 'jobs', 'akademie']),
  c('wroclaw', 'Breslau', 'Polen', 'PL', 51.107, 17.038, 430, ['marketplace', 'unternehmen', 'transport']),
  c('lodz', 'Lodz', 'Polen', 'PL', 51.759, 19.456, 360, ['marketplace', 'logistik', 'lager']),
  // Czech Republic
  c('brno', 'Brünn', 'Tschechien', 'CZ', 49.195, 16.607, 320, ['marketplace', 'transport', 'akademie']),
  c('ostrava', 'Ostrava', 'Tschechien', 'CZ', 49.82, 18.262, 280, ['marketplace', 'logistik', 'lager']),
  // Austria
  c('linz', 'Linz', 'Österreich', 'AT', 48.306, 14.286, 290, ['marketplace', 'transport', 'partner']),
  c('graz', 'Graz', 'Österreich', 'AT', 47.071, 15.439, 310, ['marketplace', 'jobs', 'akademie']),
  c('salzburg', 'Salzburg', 'Österreich', 'AT', 47.809, 13.055, 260, ['marketplace', 'partner', 'services']),
  // Switzerland
  c('geneva', 'Genf', 'Schweiz', 'CH', 46.204, 6.143, 480, ['marketplace', 'partner', 'unternehmen'], true),
  c('basel', 'Basel', 'Schweiz', 'CH', 47.559, 7.588, 420, ['marketplace', 'transport', 'logistik']),
  // Portugal
  c('porto', 'Porto', 'Portugal', 'PT', 41.157, -8.629, 460, ['marketplace', 'transport', 'logistik']),
  // Romania
  c('cluj', 'Cluj-Napoca', 'Rumänien', 'RO', 46.771, 23.623, 340, ['marketplace', 'akademie', 'ki']),
  c('constanta', 'Konstanza', 'Rumänien', 'RO', 44.159, 28.634, 290, ['marketplace', 'transport', 'logistik']),
  // Bulgaria
  c('varna', 'Warna', 'Bulgarien', 'BG', 43.214, 27.915, 260, ['marketplace', 'transport', 'partner']),
  // Greece
  c('thessaloniki', 'Thessaloniki', 'Griechenland', 'GR', 40.64, 22.944, 380, ['marketplace', 'transport', 'logistik']),
  // Sweden
  c('gothenburg', 'Göteborg', 'Schweden', 'SE', 57.708, 11.974, 420, ['marketplace', 'transport', 'logistik']),
  c('malmo', 'Malmö', 'Schweden', 'SE', 55.605, 13.004, 360, ['marketplace', 'partner', 'jobs']),
  // Norway
  c('bergen', 'Bergen', 'Norwegen', 'NO', 60.391, 5.322, 280, ['marketplace', 'transport', 'logistik']),
  // Finland
  c('tampere', 'Tampere', 'Finnland', 'FI', 61.498, 23.761, 300, ['marketplace', 'unternehmen', 'ki']),
  // Ireland
  c('cork', 'Cork', 'Irland', 'IE', 51.898, -8.476, 290, ['marketplace', 'partner', 'transport']),
  // Lithuania
  c('kaunas', 'Kaunas', 'Litauen', 'LT', 54.898, 23.904, 240, ['marketplace', 'logistik', 'transport']),
  // Ukraine
  c('kharkiv', 'Charkiw', 'Ukraine', 'UA', 49.993, 36.230, 520, ['marketplace', 'transport', 'logistik', 'lager'], true),
  c('lviv', 'Lemberg', 'Ukraine', 'UA', 49.839, 24.03, 420, ['marketplace', 'transport', 'jobs'], true),
  c('odesa', 'Odessa', 'Ukraine', 'UA', 46.482, 30.724, 380, ['marketplace', 'transport', 'logistik'], true),
  c('dnipro', 'Dnipro', 'Ukraine', 'UA', 48.464, 35.046, 360, ['marketplace', 'logistik', 'lager'], true),
  c('izium', 'Isjum', 'Ukraine', 'UA', 49.209, 37.298, 280, ['marketplace', 'transport', 'logistik', 'lager'], true),
  // Turkey
  c('ankara', 'Ankara', 'Türkei', 'TR', 39.933, 32.860, 640, ['marketplace', 'transport', 'logistik', 'ki'], true),
  c('izmir', 'Izmir', 'Türkei', 'TR', 38.419, 27.129, 580, ['marketplace', 'transport', 'logistik'], true),
  c('bursa', 'Bursa', 'Türkei', 'TR', 40.188, 29.061, 420, ['marketplace', 'transport', 'lager'], true),
  // Balkans
  c('belgrade', 'Belgrad', 'Serbien', 'RS', 44.786, 20.448, 410, ['marketplace', 'transport', 'logistik']),
  c('zagreb', 'Zagreb', 'Kroatien', 'HR', 45.815, 15.982, 360, ['marketplace', 'transport', 'partner']),
  c('ljubljana', 'Ljubljana', 'Slowenien', 'SI', 46.056, 14.505, 290, ['marketplace', 'transport', 'jobs']),
  c('sarajevo', 'Sarajevo', 'Bosnien und Herzegowina', 'BA', 43.856, 18.413, 240, ['marketplace', 'transport', 'partner']),
];
