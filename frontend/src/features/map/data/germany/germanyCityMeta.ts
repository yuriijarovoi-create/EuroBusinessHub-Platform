/** Per-city Germany digital-twin metadata — tier, population, industry (mock → API) */

export type GermanyCityTier = 1 | 2 | 3;

export interface GermanyCityMeta {
  tier: GermanyCityTier;
  population: number;
  mainIndustry: string;
  transportRole: string;
}

const T1 = (
  population: number,
  mainIndustry: string,
  transportRole: string,
): GermanyCityMeta => ({ tier: 1, population, mainIndustry, transportRole });

const T2 = (
  population: number,
  mainIndustry: string,
  transportRole: string,
): GermanyCityMeta => ({ tier: 2, population, mainIndustry, transportRole });

const T3 = (
  population: number,
  mainIndustry: string,
  transportRole: string,
): GermanyCityMeta => ({ tier: 3, population, mainIndustry, transportRole });

/** All mapped German cities — keyed by city id */
export const GERMANY_CITY_META: Record<string, GermanyCityMeta> = {
  // Tier 1
  berlin: T1(3645000, 'KI & Startups', 'Nationaler Innovations- & Logistikhub'),
  hamburg: T1(1841000, 'Hafen & Handel', 'Seehafen — Container & Schifffahrt'),
  munich: T1(1488000, 'Tech & Automotive', 'Luftfracht & Industriecluster'),
  frankfurt: T1(753000, 'Finanz & Logistik', 'FRA Air Cargo & Finanzplatz'),
  cologne: T1(1086000, 'Medien & Handel', 'Rhein-Logistik & Medien'),
  duesseldorf: T1(621000, 'Mode & Handel', 'NRW Wirtschaftszentrum'),
  stuttgart: T1(635000, 'Automotive', 'Automotive Valley Logistik'),
  leipzig: T1(593000, 'Distribution', 'DHL Hub LEJ & Cargo Airport'),

  // Tier 2
  dresden: T2(563000, 'Mikroelektronik', 'Elbe-Industriekorridor'),
  dortmund: T2(588000, 'Logistik & Energie', 'Ruhr Logistik Knoten'),
  essen: T2(583000, 'Industrie & Services', 'Ruhr Metropole Fracht'),
  bremen: T2(567000, 'Hafen & Aerospace', 'Bremen-Bremerhaven Hafen'),
  hanover: T2(535000, 'Messe & Logistik', 'Mitte-Deutschland Verteilung'),
  nuremberg: T2(518000, 'Industrie & Tech', 'Franken Logistik'),
  mannheim: T2(315000, 'Chemie & Logistik', 'Rhein-Neckar Hafen'),
  karlsruhe: T2(308000, 'IT & Forschung', 'Tech-Logistik Südwest'),
  bonn: T2(331000, 'Verwaltung & Services', 'Rhein-Sieg Business'),
  duisburg: T2(498000, 'Stahl & Hafen', 'Größter Binnenhafen EU'),
  muenster: T2(317000, 'Dienstleistung', 'Westfalen Distribution'),

  // Tier 3 — existing extras
  aachen: T3(249000, 'Forschung & Tech', 'Grenzüberschreitender Verkehr'),
  augsburg: T3(296000, 'Maschinenbau', 'A8 Industriekorridor'),
  erfurt: T3(214000, 'Optik & Elektronik', 'Thüringer Verteilung'),
  freiburg: T3(230000, 'Solar & Forschung', 'Oberrhein Logistik'),
  kiel: T3(247000, 'Marine & Hafen', 'Ostsee-Fracht'),
  luebeck: T3(217000, 'Hafen & Handel', 'Ostsee-Hafen'),
  magdeburg: T3(237000, 'Maschinenbau', 'Elbe Logistik'),
  mainz: T3(218000, 'Pharma & Medien', 'Rhein-Main Verteilung'),
  regensburg: T3(153000, 'Automotive Zulieferer', 'Donau-Industriekorridor'),
  rostock: T3(209000, 'Hafen & Tourismus', 'Ostseehafen'),
  saarbruecken: T3(180000, 'Automotive & Stahl', 'Saar-Logistik'),
  ulm: T3(126000, 'Medizintechnik', 'Donau-Autobahn Knoten'),
  wiesbaden: T3(278000, 'Finanz & Services', 'Rhein-Main Business'),

  // Tier 3 — new dense network
  bochum: T3(364000, 'Universität & Tech', 'Ruhr Bahn-Fracht'),
  wuppertal: T3(355000, 'Industrie & Chemie', 'Wupper-Rhein Korridor'),
  gelsenkirchen: T3(259000, 'Energie & Logistik', 'Ruhr Verteilung'),
  moenchengladbach: T3(261000, 'Textil & Handel', 'Niederrhein Logistik'),
  braunschweig: T3(248000, 'Automotive & Forschung', 'A2 Verteilzentrum'),
  chemnitz: T3(243000, 'Maschinenbau', 'Sachsen Industrie'),
  halle: T3(238000, 'Chemie & Biotech', 'Saale Logistik'),
  krefeld: T3(227000, 'Textil & Chemie', 'Niederrhein Hafen'),
  oberhausen: T3(211000, 'Handel & Logistik', 'Ruhr Shopping & Fracht'),
  kassel: T3(201000, 'Transport & Messe', 'Mitte-Deutschland Hub'),
  hagen: T3(188000, 'Stahl & Handel', 'Ruhr-Süd Logistik'),
  potsdam: T3(183000, 'Film & IT', 'Berlin-Brandenburg Korridor'),
  ludwigshafen: T3(172000, 'Chemie & BASF', 'Rhein Chemie-Logistik'),
  oldenburg: T3(170000, 'Landwirtschaft & Energie', 'Nordwest Verteilung'),
  leverkusen: T3(164000, 'Chemie & Pharma', 'Rhein Chemiepark'),
  osnabrueck: T3(165000, 'Logistik & Handel', 'A30 Verteilung'),
  solingen: T3(159000, 'Metall & Werkzeug', 'Bergisches Land'),
  heidelberg: T3(160000, 'Forschung & IT', 'Neckar Logistik'),
  darmstadt: T3(159000, 'Wissenschaft & Tech', 'Rhein-Main Tech'),
  ingolstadt: T3(139000, 'Automotive', 'Audi Supply Chain'),
  wolfsburg: T3(124000, 'Automotive', 'VW Logistikzentrum'),
  paderborn: T3(153000, 'IT & Maschinenbau', 'Ostwestfalen Hub'),
  offenbach: T3(131000, 'Design & Handel', 'Frankfurt Metro Logistik'),
  fuerth: T3(128000, 'Metall & Elektronik', 'Nürnberg Metro'),
  wuerzburg: T3(127000, 'Wein & Logistik', 'Main-Fracht'),
  heilbronn: T3(126000, 'Handel & Logistik', 'Neckar Distribution'),
  pforzheim: T3(125000, 'Schmuck & Tech', 'Schwarzwald Korridor'),
  goettingen: T3(118000, 'Forschung & Pharma', 'A7 Wissenschaft'),
  bottrop: T3(117000, 'Energie & Logistik', 'Ruhr Nord Fracht'),
  trier: T3(111000, 'Wein & Tourismus', 'Mosel Logistik'),
  recklinghausen: T3(111000, 'Handel & Kultur', 'Ruhr Mitte'),
  reutlingen: T3(116000, 'Textil & Tech', 'Schwäbische Alb'),
  koblenz: T3(114000, 'Logistik & Tourismus', 'Rhein-Mosel Knoten'),
  bremerhaven: T3(114000, 'Hafen & Automotive', 'Auto-Terminal Nordsee'),
  bergisch_gladbach: T3(111000, 'Handel & Pharma', 'Köln Metro Logistik'),
  jena: T3(111000, 'Optik & Forschung', 'Thüringer Tech-Korridor'),
  remscheid: T3(111000, 'Werkzeug & Metall', 'Bergisches Land'),
  erlangen: T3(113000, 'MedTech & IT', 'Siemens-Cluster Logistik'),
  moers: T3(103000, 'Logistik & Handel', 'Niederrhein Fracht'),
  siegen: T3(102000, 'Metall & Universität', 'Siegerland Logistik'),
  hildesheim: T3(101000, 'Automotive Zulieferer', 'A7 Industrie'),
  cottbus: T3(99000, 'Energie & Tech', 'Lausitz Logistik'),
  guetersloh: T3(100000, 'Medien & Logistik', 'Ostwestfalen Distribution'),
  kaiserslautern: T3(99000, 'IT & Forschung', 'Pfalz Tech-Logistik'),
  iserlohn: T3(92000, 'Metall & Handel', 'Sauerland Fracht'),
  schwerin: T3(96000, 'Verwaltung & Hafen', 'Mecklenburg Distribution'),
  zwickau: T3(87000, 'Automotive', 'Sachsen Auto-Korridor'),
};

export function getGermanyCityMeta(cityId: string): GermanyCityMeta {
  return (
    GERMANY_CITY_META[cityId] ?? {
      tier: 3,
      population: 100000,
      mainIndustry: 'Handel & Dienstleistung',
      transportRole: 'Regionale Verteilung',
    }
  );
}

export function getGermanyMapTier(cityId: string): GermanyCityTier {
  return getGermanyCityMeta(cityId).tier;
}
