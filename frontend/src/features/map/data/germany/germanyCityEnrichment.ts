import type { MapCityMetrics } from '@shared/types';
import type { GermanyInfrastructure } from '../../types/germanyTypes';
import { GERMANY_BUNDESLAENDER_ENRICHMENT } from './germanyBundeslandEnrichment';
import { GERMANY_RHEINLAND_PFALZ_ENRICHMENT } from './germanyRheinlandPfalzEnrichment';
import { GERMANY_SAARLAND_ENRICHMENT } from './germanySaarlandEnrichment';
import { GERMANY_HESSEN_ENRICHMENT } from './germanyHessenEnrichment';
import { GERMANY_BW_ENRICHMENT } from './germanyBadenWuerttembergEnrichment';

type MetricsSlice = Pick<
  MapCityMetrics,
  'companies' | 'jobs' | 'warehouses' | 'transport' | 'marketplace' | 'aiScore'
>;

export interface GermanyCityEnrichment {
  metrics: MetricsSlice;
  logisticsScore?: number;
  techScore?: number;
  financeScore?: number;
  innovationScore?: number;
  sustainabilityScore?: number;
  gdpEstimateBillionEur?: number;
  /** Composite 0–100 business ecosystem score */
  businessIndex?: number;
  /** 0–100 tourism / hospitality score */
  tourismScore?: number;
  infra?: Partial<GermanyInfrastructure>;
}

function biz(
  companies: number,
  jobs: number,
  warehouses: number,
  transport: number,
  marketplace: number,
  aiScore: number,
): MetricsSlice {
  return { companies, jobs, warehouses, transport, marketplace, aiScore };
}

/** Curated business + logistics data for mapped German cities (mock → API) */
export const GERMANY_CITY_ENRICHMENT: Record<string, GermanyCityEnrichment> = {
  // ── Tier 2 regional hubs ──
  dortmund: {
    metrics: biz(890, 420, 48, 285, 720, 78),
    logisticsScore: 86,
    gdpEstimateBillionEur: 28,
    infra: {
      airports: ['Dortmund Airport (DTM)'],
      railwayCargoTerminal: 'Dortmund Hbf Güterverkehr',
      motorwayConnections: ['A1', 'A2', 'A40', 'A45'],
      logisticsHubs: ['Ruhr Logistics Corridor', 'Dortmund Distribution Park'],
    },
  },
  essen: {
    metrics: biz(920, 380, 52, 265, 680, 76),
    logisticsScore: 84,
    gdpEstimateBillionEur: 26,
    infra: {
      railwayCargoTerminal: 'Essen West Güterbahnhof',
      motorwayConnections: ['A40', 'A42', 'A52'],
      logisticsHubs: ['Ruhr Metropole Fracht', 'Essen Logistikzentrum'],
    },
  },
  bremen: {
    metrics: biz(780, 350, 44, 310, 640, 75),
    logisticsScore: 88,
    gdpEstimateBillionEur: 24,
    infra: {
      airports: ['Bremen Airport (BRE)'],
      railwayCargoTerminal: 'Bremen Neustadt Cargo Terminal',
      inlandPort: 'Bremen Industrial Port',
      motorwayConnections: ['A1', 'A27', 'A281'],
      logisticsHubs: ['Bremen-Bremerhaven Port Complex', 'Überseehafen Bremen'],
    },
  },
  dresden: {
    metrics: biz(820, 360, 38, 195, 590, 77),
    techScore: 82,
    innovationScore: 84,
    gdpEstimateBillionEur: 22,
    infra: {
      airports: ['Dresden Airport (DRS)'],
      railwayCargoTerminal: 'Dresden Friedrichstadt Freight',
      inlandPort: 'Elbe Port Dresden',
      motorwayConnections: ['A4', 'A13', 'A17'],
      logisticsHubs: ['Elbe-Industriekorridor', 'Silicon Saxony Logistics'],
    },
  },
  nuremberg: {
    metrics: biz(850, 340, 36, 205, 610, 79),
    techScore: 80,
    gdpEstimateBillionEur: 24,
    infra: {
      airports: ['Nuremberg Airport (NUE)'],
      railwayCargoTerminal: 'Nürnberg Hafen Cargo',
      motorwayConnections: ['A3', 'A6', 'A9', 'A73'],
      logisticsHubs: ['Franken Logistik', 'Nürnberg Messe Cargo'],
    },
  },
  duisburg: {
    metrics: biz(980, 410, 62, 380, 740, 82),
    logisticsScore: 94,
    gdpEstimateBillionEur: 27,
    infra: {
      airports: ['Düsseldorf Airport (DUS) — 25 km'],
      railwayCargoTerminal: 'Duisburg Hbf Container Terminal',
      inlandPort: 'Duisburg Inland Port — Größter Binnenhafen Europas',
      motorwayConnections: ['A3', 'A40', 'A42', 'A59'],
      logisticsHubs: ['Duisport Logistikcluster', 'Ruhrort Container Terminal'],
    },
  },
  muenster: {
    metrics: biz(720, 280, 32, 175, 520, 72),
    gdpEstimateBillionEur: 18,
    infra: {
      airports: ['Münster Osnabrück Airport (FMO)'],
      railwayCargoTerminal: 'Münster Güterverkehrszentrum',
      motorwayConnections: ['A1', 'A43'],
      logisticsHubs: ['Westfalen Distribution Hub'],
    },
  },
  bielefeld: {
    metrics: biz(760, 295, 34, 168, 550, 74),
    logisticsScore: 79,
    gdpEstimateBillionEur: 19,
    infra: {
      airports: ['Paderborn Lippstadt (PAD) — 45 km'],
      railwayCargoTerminal: 'Bielefeld Ost Güterbahnhof',
      motorwayConnections: ['A2', 'A33'],
      logisticsHubs: ['Ostwestfalen-Lippe Logistik', 'Bielefeld Handwerk Cluster'],
    },
  },

  // ── Tier 3 business cities ──
  bochum: {
    metrics: biz(640, 240, 28, 155, 480, 70),
    logisticsScore: 78,
    infra: {
      railwayCargoTerminal: 'Bochum Langendreer Freight',
      motorwayConnections: ['A40', 'A43'],
      logisticsHubs: ['Ruhr Bahn-Fracht Bochum'],
    },
  },
  wuppertal: {
    metrics: biz(620, 230, 26, 148, 460, 69),
    logisticsScore: 77,
    infra: {
      railwayCargoTerminal: 'Wuppertal-Vohwinkel Cargo',
      motorwayConnections: ['A1', 'A46'],
      logisticsHubs: ['Wupper-Rhein Korridor'],
    },
  },
  karlsruhe: {
    metrics: biz(710, 310, 30, 190, 580, 81),
    techScore: 88,
    innovationScore: 86,
    infra: {
      airports: ['Karlsruhe/Baden-Baden (FKB)'],
      railwayCargoTerminal: 'Karlsruhe Güterbahnhof',
      motorwayConnections: ['A5', 'A8', 'A65'],
      logisticsHubs: ['Tech-Logistik Südwest', 'Rhein-Neckar Cargo'],
    },
  },
  mannheim: {
    metrics: biz(740, 320, 34, 210, 600, 80),
    logisticsScore: 83,
    infra: {
      airports: ['Frankfurt Airport (FRA) — 65 km'],
      railwayCargoTerminal: 'Mannheim Hafen Cargo Terminal',
      inlandPort: 'Rhein-Neckar Hafen Mannheim',
      motorwayConnections: ['A6', 'A61', 'A656'],
      logisticsHubs: ['Rhein-Neckar Logistik', 'Chemiepark Cargo'],
    },
  },
  augsburg: {
    metrics: biz(680, 260, 28, 165, 520, 74),
    infra: {
      airports: ['Munich Airport (MUC) — 60 km'],
      railwayCargoTerminal: 'Augsburg Oberhausen Freight',
      motorwayConnections: ['A8', 'A99'],
      logisticsHubs: ['A8 Industriekorridor Augsburg'],
    },
  },
  wiesbaden: {
    metrics: biz(650, 270, 26, 175, 540, 73),
    financeScore: 78,
    infra: {
      airports: ['Frankfurt Airport (FRA) — 25 km'],
      railwayCargoTerminal: 'Wiesbaden Ost Cargo',
      motorwayConnections: ['A3', 'A66'],
      logisticsHubs: ['Rhein-Main Business Belt'],
    },
  },
  freiburg: {
    metrics: biz(590, 220, 22, 130, 440, 76),
    innovationScore: 82,
    infra: {
      airports: ['EuroAirport Basel-Mulhouse-Freiburg (BSL)'],
      railwayCargoTerminal: 'Freiburg Güterverkehr',
      motorwayConnections: ['A5'],
      logisticsHubs: ['Oberrhein Logistik', 'Solar Valley Distribution'],
    },
  },
  aachen: {
    metrics: biz(560, 210, 20, 125, 420, 75),
    techScore: 84,
    infra: {
      airports: ['Maastricht Aachen Airport (MST)'],
      railwayCargoTerminal: 'Aachen West Freight',
      motorwayConnections: ['A4', 'A44'],
      logisticsHubs: ['Grenzüberschreitender Eifel-Logistik'],
    },
  },
  magdeburg: {
    metrics: biz(580, 230, 26, 160, 450, 72),
    logisticsScore: 80,
    infra: {
      airports: ['Magdeburg-Cochstedt (CSO)'],
      railwayCargoTerminal: 'Magdeburg Rothensee Hafen',
      inlandPort: 'Elbe Hafen Magdeburg',
      motorwayConnections: ['A2', 'A14'],
      logisticsHubs: ['Elbe Logistik Magdeburg'],
    },
  },
  kiel: {
    metrics: biz(520, 195, 22, 185, 390, 71),
    logisticsScore: 79,
    infra: {
      airports: ['Kiel Airport (KEL)'],
      railwayCargoTerminal: 'Kiel Schwedenkai Cargo',
      inlandPort: 'Kiel Canal Logistics / Ostseehafen',
      motorwayConnections: ['A7', 'A215'],
      logisticsHubs: ['Ostsee-Fracht Kiel', 'Nord-Ostsee-Kanal Hub'],
    },
  },
  rostock: {
    metrics: biz(540, 200, 24, 220, 410, 73),
    logisticsScore: 82,
    infra: {
      airports: ['Rostock-Laage (RLG)'],
      railwayCargoTerminal: 'Rostock Seehafen Cargo Terminal',
      inlandPort: 'Rostock Port — Ostsee Deep Water Terminal',
      motorwayConnections: ['A19', 'A20'],
      logisticsHubs: ['Rostock Port Logistics', 'Ferry Terminal Cargo'],
    },
  },
  luebeck: {
    metrics: biz(510, 185, 20, 195, 380, 72),
    logisticsScore: 81,
    infra: {
      airports: ['Lübeck Airport (LBC)'],
      railwayCargoTerminal: 'Lübeck Skandinavienkai Freight',
      inlandPort: 'Lübeck Port — Ostsee Handelshafen',
      motorwayConnections: ['A1', 'A20', 'A226'],
      logisticsHubs: ['Lübeck Port Logistics', 'Skandinavienkai Ferry Cargo'],
    },
  },
  erfurt: {
    metrics: biz(480, 190, 18, 120, 360, 74),
    innovationScore: 80,
    infra: {
      airports: ['Erfurt-Weimar Airport (ERF)'],
      railwayCargoTerminal: 'Erfurt Güterverkehrszentrum',
      motorwayConnections: ['A4', 'A71'],
      logisticsHubs: ['Thüringer Verteilung', 'Optik-Cluster Logistik'],
    },
  },
  chemnitz: {
    metrics: biz(560, 220, 24, 140, 430, 73),
    infra: {
      airports: ['Dresden Airport (DRS) — 80 km'],
      railwayCargoTerminal: 'Chemnitz Küchwald Freight',
      motorwayConnections: ['A4', 'A72'],
      logisticsHubs: ['Sachsen Industrie Logistik'],
    },
  },
  koblenz: {
    metrics: biz(470, 175, 18, 135, 350, 71),
    infra: {
      airports: ['Frankfurt-Hahn (HHN) — 65 km'],
      railwayCargoTerminal: 'Koblenz Güterbahnhof',
      inlandPort: 'Rhein-Mosel Hafen Koblenz',
      motorwayConnections: ['A3', 'A48', 'A61'],
      logisticsHubs: ['Rhein-Mosel Logistik Knoten'],
    },
  },
  mainz: {
    metrics: biz(620, 250, 24, 165, 490, 75),
    infra: {
      airports: ['Frankfurt Airport (FRA) — 30 km'],
      railwayCargoTerminal: 'Mainz Hafen Cargo',
      inlandPort: 'Rhein Hafen Mainz',
      motorwayConnections: ['A60', 'A63'],
      logisticsHubs: ['Rhein-Main Verteilung', 'Pharma Logistik Mainz'],
    },
  },
  saarbruecken: {
    metrics: biz(520, 195, 18, 135, 380, 74),
    logisticsScore: 78,
    innovationScore: 72,
    businessIndex: 75,
    infra: {
      airports: ['Saarbrücken Airport (SCN)'],
      railwayCargoTerminal: 'Saarbrücken Hbf Freight',
      motorwayConnections: ['A1', 'A6', 'A620', 'A8'],
      industrialZones: ['Saarstahl Industrie', 'Europaviertel Gewerbepark'],
      logisticsHubs: ['Saar-Logistik', 'Automotive Zulieferer Hub', 'SCN Cargo'],
    },
  },
  braunschweig: {
    metrics: biz(580, 225, 26, 155, 440, 74),
    infra: {
      airports: ['Hannover Airport (HAJ) — 60 km'],
      railwayCargoTerminal: 'Braunschweig Güterverkehrszentrum',
      motorwayConnections: ['A2', 'A39'],
      logisticsHubs: ['A2 Verteilzentrum', 'Automotive Forschung Logistik'],
    },
  },
  wolfsburg: {
    metrics: biz(520, 210, 22, 145, 400, 72),
    logisticsScore: 81,
    infra: {
      airports: ['Hannover Airport (HAJ) — 90 km'],
      railwayCargoTerminal: 'Wolfsburg VW Güterbahnhof',
      motorwayConnections: ['A2', 'A39'],
      logisticsHubs: ['VW Logistikzentrum Wolfsburg', 'Autostadt Supply Chain'],
    },
  },
  ulm: {
    metrics: biz(490, 185, 18, 120, 370, 73),
    infra: {
      airports: ['Memmingen (FMM) — 60 km'],
      railwayCargoTerminal: 'Ulm Güterbahnhof',
      motorwayConnections: ['A7', 'A8'],
      logisticsHubs: ['Donau-Autobahn Knoten', 'Medizintechnik Logistik'],
    },
  },
  regensburg: {
    metrics: biz(530, 200, 20, 130, 390, 72),
    infra: {
      airports: ['Munich Airport (MUC) — 80 km'],
      railwayCargoTerminal: 'Regensburg Hafen Cargo',
      inlandPort: 'Donau Hafen Regensburg',
      motorwayConnections: ['A3', 'A93'],
      logisticsHubs: ['Donau-Industriekorridor'],
    },
  },
  ingolstadt: {
    metrics: biz(560, 215, 22, 140, 420, 74),
    logisticsScore: 80,
    infra: {
      airports: ['Munich Airport (MUC) — 70 km'],
      railwayCargoTerminal: 'Ingolstadt Nord Freight',
      motorwayConnections: ['A9', 'A93'],
      logisticsHubs: ['Audi Supply Chain Hub', 'Ingolstadt Logistikpark'],
    },
  },
  heidelberg: {
    metrics: biz(540, 220, 20, 135, 410, 77),
    techScore: 85,
    infra: {
      airports: ['Frankfurt Airport (FRA) — 80 km'],
      railwayCargoTerminal: 'Heidelberg Güterverkehr',
      motorwayConnections: ['A5', 'A656'],
      logisticsHubs: ['Neckar Logistik', 'Life Science Distribution'],
    },
  },
  darmstadt: {
    metrics: biz(530, 215, 20, 130, 400, 78),
    techScore: 86,
    innovationScore: 88,
    infra: {
      airports: ['Frankfurt Airport (FRA) — 25 km'],
      railwayCargoTerminal: 'Darmstadt-Kranichstein Cargo',
      motorwayConnections: ['A5', 'A67'],
      logisticsHubs: ['Rhein-Main Tech Logistik', 'Merck Pharma Cargo'],
    },
  },
  potsdam: {
    metrics: biz(500, 200, 18, 115, 380, 76),
    techScore: 82,
    infra: {
      airports: ['Berlin Brandenburg (BER) — 35 km'],
      railwayCargoTerminal: 'Potsdam Güterverkehr',
      motorwayConnections: ['A10', 'A115'],
      logisticsHubs: ['Berlin-Brandenburg Korridor', 'Film & IT Logistik'],
    },
  },
  oldenburg: {
    metrics: biz(460, 175, 18, 145, 350, 71),
    infra: {
      airports: ['Bremen Airport (BRE) — 50 km'],
      railwayCargoTerminal: 'Oldenburg Güterbahnhof',
      motorwayConnections: ['A1', 'A28', 'A29'],
      logisticsHubs: ['Nordwest Verteilung', 'Landwirtschaft Logistik'],
    },
  },
  osnabrueck: {
    metrics: biz(550, 210, 22, 150, 420, 73),
    logisticsScore: 78,
    infra: {
      airports: ['Münster Osnabrück Airport (FMO)'],
      railwayCargoTerminal: 'Osnabrück Hbf Güterverkehr',
      motorwayConnections: ['A1', 'A30', 'A33'],
      logisticsHubs: ['A30 Verteilung', 'Osnabrück Logistikpark'],
    },
  },
  trier: {
    metrics: biz(420, 160, 14, 110, 320, 70),
    infra: {
      airports: ['Luxembourg Airport (LUX) — 40 km'],
      railwayCargoTerminal: 'Trier Güterbahnhof',
      motorwayConnections: ['A1', 'A48', 'A602'],
      logisticsHubs: ['Mosel Logistik', 'Wein & Tourismus Distribution'],
    },
  },
  jena: {
    metrics: biz(440, 175, 16, 105, 330, 75),
    techScore: 83,
    innovationScore: 85,
    infra: {
      airports: ['Leipzig Halle Airport (LEJ) — 80 km'],
      railwayCargoTerminal: 'Jena Saalepark Cargo',
      motorwayConnections: ['A4', 'A9'],
      logisticsHubs: ['Thüringer Tech-Korridor', 'Optik Logistik Jena'],
    },
  },
  kassel: {
    metrics: biz(570, 225, 24, 165, 440, 74),
    logisticsScore: 79,
    infra: {
      airports: ['Kassel Calden (KSF)'],
      railwayCargoTerminal: 'Kassel Bettenhausen Freight',
      motorwayConnections: ['A7', 'A44', 'A49'],
      logisticsHubs: ['Mitte-Deutschland Hub', 'Kassel Messe Logistik'],
    },
  },
  goettingen: {
    metrics: biz(430, 165, 16, 105, 320, 74),
    innovationScore: 81,
    infra: {
      airports: ['Hannover Airport (HAJ) — 90 km'],
      railwayCargoTerminal: 'Göttingen Güterverkehr',
      motorwayConnections: ['A7', 'A38'],
      logisticsHubs: ['A7 Wissenschaft Logistik', 'Forschung & Pharma Distribution'],
    },
  },
  halle: {
    metrics: biz(560, 220, 24, 175, 430, 73),
    logisticsScore: 80,
    infra: {
      airports: ['Leipzig Halle Airport (LEJ) — 25 km'],
      railwayCargoTerminal: 'Halle Saale Cargo Terminal',
      motorwayConnections: ['A9', 'A14'],
      logisticsHubs: ['Leipzig/Halle Cargo Korridor', 'Chemie Logistik Halle'],
    },
  },
  paderborn: {
    metrics: biz(480, 185, 18, 125, 360, 73),
    techScore: 79,
    infra: {
      airports: ['Paderborn Lippstadt Airport (PAD)'],
      railwayCargoTerminal: 'Paderborn Güterbahnhof',
      motorwayConnections: ['A33', 'A44'],
      logisticsHubs: ['Ostwestfalen IT Hub', 'Paderborn Logistik'],
    },
  },
  bonn: {
    metrics: biz(680, 290, 26, 180, 560, 76),
    financeScore: 74,
    infra: {
      airports: ['Köln/Bonn Airport Cargo (CGN) — 20 km'],
      railwayCargoTerminal: 'Bonn Beuel Güterverkehr',
      motorwayConnections: ['A59', 'A555', 'A565'],
      logisticsHubs: ['Rhein-Sieg Business', 'UN & Verwaltung Services'],
    },
  },

  // ── Major logistics hubs (enriched tier-1 / port cities) ──
  hamburg: {
    metrics: biz(2100, 680, 88, 520, 1680, 88),
    logisticsScore: 99,
    gdpEstimateBillionEur: 62,
    infra: {
      airports: ['Hamburg Airport (HAM)'],
      railwayCargoTerminal: 'HHLA Rail Terminal Hamburg',
      inlandPort: 'Port of Hamburg — Europas drittgrößter Seehafen',
      motorwayConnections: ['A1', 'A7', 'A24', 'A255'],
      industrialZones: ['Wilhelmsburg Logistics Park', 'Veddel Cargo'],
      logisticsHubs: ['Hamburg Port Logistics', 'Container Terminal Altenwerder', 'HHLA CTA'],
    },
  },
  bremerhaven: {
    metrics: biz(620, 230, 32, 340, 480, 76),
    logisticsScore: 90,
    infra: {
      airports: ['Bremerhaven Airport (BRV)'],
      railwayCargoTerminal: 'Bremerhaven Imsumer Deich Cargo',
      inlandPort: 'Bremerhaven Container Terminal — Auto & Kühlfracht',
      motorwayConnections: ['A27', 'B212'],
      logisticsHubs: ['Auto Terminal Bremerhaven', 'NTB North Sea Terminal'],
    },
  },
  wilhelmshaven: {
    metrics: biz(380, 145, 28, 295, 310, 74),
    logisticsScore: 89,
    infra: {
      airports: ['Wilhelmshaven-Mariensiel (WVN)'],
      railwayCargoTerminal: 'Wilhelmshaven JadeWeserPort Rail Terminal',
      inlandPort: 'JadeWeserPort Wilhelmshaven — Tiefwasserhafen',
      motorwayConnections: ['A29', 'B210'],
      logisticsHubs: ['JadeWeserPort Logistics', 'Niedersachsen Deep Sea Hub'],
    },
  },
  frankfurt: {
    metrics: biz(1850, 620, 72, 480, 1520, 92),
    financeScore: 98,
    logisticsScore: 94,
    gdpEstimateBillionEur: 78,
    infra: {
      airports: ['Frankfurt Airport Cargo (FRA) — Europas größter Air Cargo Hub'],
      railwayCargoTerminal: 'Frankfurt Main Cargo Terminal / Gateway Gardens',
      inlandPort: 'Main River Port Frankfurt',
      motorwayConnections: ['A3', 'A5', 'A66', 'A661'],
      logisticsHubs: ['FRA Air Cargo Hub', 'Cargo City Süd', 'Rhine-Main Logistics Cluster'],
    },
  },
  leipzig: {
    metrics: biz(920, 380, 42, 360, 780, 84),
    logisticsScore: 92,
    gdpEstimateBillionEur: 32,
    infra: {
      airports: ['Leipzig/Halle Airport (LEJ) — DHL European Hub'],
      railwayCargoTerminal: 'Leipzig Messe Cargo Terminal',
      motorwayConnections: ['A9', 'A14', 'A38'],
      logisticsHubs: ['DHL Hub LEJ', 'Leipzig/Halle Cargo Hub', 'Amazon Fulfilment Leipzig'],
    },
  },
  cologne: {
    metrics: biz(1180, 450, 46, 290, 920, 82),
    logisticsScore: 89,
    gdpEstimateBillionEur: 48,
    businessIndex: 84,
    infra: {
      airports: ['Köln/Bonn Airport Cargo (CGN)'],
      railwayCargoTerminal: 'Köln Eifeltor Freight Terminal',
      inlandPort: 'Rhine Port Cologne',
      motorwayConnections: ['A1', 'A3', 'A4', 'A57'],
      logisticsHubs: ['CGN Air Cargo', 'Rhine Logistics Cologne', 'Köln/Bonn Cargo Airport'],
    },
  },

  // ── Tier 1 national hubs (enrichment only — seeds unchanged) ──
  berlin: {
    metrics: biz(2400, 820, 95, 410, 1920, 91),
    techScore: 91,
    innovationScore: 96,
    logisticsScore: 86,
    businessIndex: 91,
    gdpEstimateBillionEur: 68,
    infra: {
      airports: ['Berlin Brandenburg (BER)'],
      railwayCargoTerminal: 'Südkreuz / Westhafen Cargo',
      inlandPort: 'Westhafen Inland Port',
      motorwayConnections: ['A10', 'A100', 'A113', 'A115'],
      industrialZones: ['Adlershof Science Park', 'TXL Innovation Hub'],
      logisticsHubs: ['Berlin Hub — EuroBusinessHub HQ', 'Spree Logistics Belt'],
    },
  },
  munich: {
    metrics: biz(1980, 680, 78, 340, 1580, 89),
    techScore: 94,
    logisticsScore: 85,
    innovationScore: 88,
    businessIndex: 89,
    gdpEstimateBillionEur: 71,
    infra: {
      airports: ['Munich Airport (MUC)'],
      railwayCargoTerminal: 'Munich East Freight Yard',
      motorwayConnections: ['A8', 'A9', 'A99'],
      industrialZones: ['Freimann Industrial', 'Automotive Cluster'],
      logisticsHubs: ['MUC Cargo City', 'Bavaria Tech Logistics'],
    },
  },
  stuttgart: {
    metrics: biz(1420, 520, 52, 280, 1120, 85),
    techScore: 88,
    logisticsScore: 82,
    innovationScore: 84,
    businessIndex: 85,
    gdpEstimateBillionEur: 52,
    infra: {
      airports: ['Stuttgart Airport (STR)'],
      railwayCargoTerminal: 'Kornwestheim Freight',
      motorwayConnections: ['A8', 'A81', 'A831'],
      industrialZones: ['Automotive Valley', 'Neckar Industrial'],
      logisticsHubs: ['Mercedes-Benz Logistics', 'Porsche Supply Chain'],
    },
  },
  duesseldorf: {
    metrics: biz(1280, 480, 44, 265, 980, 83),
    financeScore: 85,
    logisticsScore: 86,
    businessIndex: 84,
    gdpEstimateBillionEur: 44,
    infra: {
      airports: ['Düsseldorf Airport (DUS)'],
      railwayCargoTerminal: 'Düsseldorf Hafen Cargo',
      inlandPort: 'Rhein Hafen Düsseldorf',
      motorwayConnections: ['A3', 'A44', 'A46', 'A57'],
      logisticsHubs: ['NRW Wirtschaftszentrum', 'Rhein-Ruhr Air Cargo'],
    },
  },
  hanover: {
    metrics: biz(1050, 420, 40, 245, 860, 80),
    logisticsScore: 84,
    businessIndex: 81,
    gdpEstimateBillionEur: 22,
    infra: {
      airports: ['Hannover Airport (HAJ)'],
      railwayCargoTerminal: 'Hannover Messe Cargo Terminal',
      motorwayConnections: ['A2', 'A7', 'A37'],
      logisticsHubs: ['Mitte-Deutschland Verteilung', 'Hannover Messe Logistik'],
    },
  },

  // ── Stage 2 regional cities (enrichment only) ──
  heilbronn: {
    metrics: biz(520, 195, 20, 128, 400, 72),
    logisticsScore: 76,
    businessIndex: 74,
    infra: {
      airports: ['Stuttgart Airport (STR) — 50 km'],
      railwayCargoTerminal: 'Heilbronn Cargo Terminal',
      motorwayConnections: ['A6', 'A81'],
      logisticsHubs: ['Neckar Distribution', 'Heilbronn Logistikpark'],
    },
  },
  wuerzburg: {
    metrics: biz(480, 180, 18, 118, 370, 71),
    logisticsScore: 75,
    businessIndex: 73,
    infra: {
      airports: ['Nuremberg Airport (NUE) — 90 km'],
      railwayCargoTerminal: 'Würzburg Hafen Cargo',
      inlandPort: 'Main Hafen Würzburg',
      motorwayConnections: ['A3', 'A7', 'A70'],
      logisticsHubs: ['Main-Fracht Würzburg', 'Wein & Logistik'],
    },
  },
  erlangen: {
    metrics: biz(510, 200, 18, 115, 390, 78),
    techScore: 87,
    innovationScore: 86,
    businessIndex: 82,
    infra: {
      airports: ['Nuremberg Airport (NUE) — 15 km'],
      railwayCargoTerminal: 'Erlangen Güterverkehr',
      motorwayConnections: ['A3', 'A73'],
      logisticsHubs: ['Siemens-Cluster Logistik', 'MedTech Distribution Erlangen'],
    },
  },
  fuerth: {
    metrics: biz(460, 175, 16, 108, 350, 70),
    businessIndex: 71,
    infra: {
      airports: ['Nuremberg Airport (NUE) — 10 km'],
      railwayCargoTerminal: 'Fürth Güterbahnhof',
      motorwayConnections: ['A73', 'A3'],
      logisticsHubs: ['Nürnberg Metro Logistik', 'Metall & Elektronik Hub'],
    },
  },
  reutlingen: {
    metrics: biz(540, 210, 20, 125, 410, 74),
    techScore: 80,
    businessIndex: 76,
    infra: {
      airports: ['Stuttgart Airport (STR) — 35 km'],
      railwayCargoTerminal: 'Reutlingen Güterverkehr',
      motorwayConnections: ['A8', 'A81'],
      logisticsHubs: ['Neckar-Alb Logistik', 'Textil & Tech Distribution'],
    },
  },
  offenbach: {
    metrics: biz(490, 190, 18, 120, 380, 73),
    financeScore: 72,
    businessIndex: 74,
    infra: {
      airports: ['Frankfurt Airport (FRA) — 15 km'],
      railwayCargoTerminal: 'Offenbach Hafen Cargo',
      motorwayConnections: ['A3', 'A661'],
      logisticsHubs: ['Frankfurt Metro Logistik', 'Design & Handel Distribution'],
    },
  },
  pforzheim: {
    metrics: biz(450, 170, 16, 110, 340, 71),
    businessIndex: 72,
    infra: {
      airports: ['Karlsruhe/Baden-Baden (FKB) — 40 km'],
      railwayCargoTerminal: 'Pforzheim Güterbahnhof',
      motorwayConnections: ['A8', 'A65'],
      logisticsHubs: ['Schwarzwald Korridor', 'Schmuck & Tech Logistik'],
    },
  },
  hildesheim: {
    metrics: biz(470, 180, 18, 125, 360, 72),
    logisticsScore: 76,
    businessIndex: 74,
    infra: {
      airports: ['Hannover Airport (HAJ) — 30 km'],
      railwayCargoTerminal: 'Hildesheim Güterverkehr',
      motorwayConnections: ['A7', 'A2'],
      logisticsHubs: ['A7 Industrie Logistik', 'Automotive Zulieferer Hub'],
    },
  },
  cottbus: {
    metrics: biz(440, 165, 16, 105, 330, 71),
    logisticsScore: 74,
    businessIndex: 72,
    infra: {
      airports: ['Berlin Brandenburg (BER) — 110 km'],
      railwayCargoTerminal: 'Cottbus Güterbahnhof',
      motorwayConnections: ['A15', 'A13'],
      logisticsHubs: ['Lausitz Logistik', 'Energie & Tech Distribution'],
    },
  },
  schwerin: {
    metrics: biz(400, 150, 14, 95, 300, 69),
    logisticsScore: 73,
    businessIndex: 70,
    infra: {
      airports: ['Rostock-Laage (RLG) — 60 km'],
      railwayCargoTerminal: 'Schwerin Güterverkehr',
      motorwayConnections: ['A14', 'A24'],
      logisticsHubs: ['Mecklenburg Distribution', 'Schweriner See Logistik'],
    },
  },
  zwickau: {
    metrics: biz(430, 165, 16, 108, 320, 70),
    businessIndex: 71,
    infra: {
      airports: ['Leipzig Halle Airport (LEJ) — 100 km'],
      railwayCargoTerminal: 'Zwickau Güterbahnhof',
      motorwayConnections: ['A4', 'A72'],
      logisticsHubs: ['Sachsen Auto-Korridor', 'Automotive Zulieferer Logistik'],
    },
  },
  siegen: {
    metrics: biz(420, 160, 14, 100, 310, 70),
    businessIndex: 71,
    infra: {
      airports: ['Cologne Bonn Airport (CGN) — 80 km'],
      railwayCargoTerminal: 'Siegen Güterverkehr',
      motorwayConnections: ['A45', 'A4'],
      logisticsHubs: ['Siegerland Logistik', 'Metall & Universität Services'],
    },
  },
  kaiserslautern: {
    metrics: biz(410, 155, 14, 98, 305, 72),
    techScore: 78,
    businessIndex: 73,
    infra: {
      airports: ['Saarbrücken Airport (SCN) — 70 km'],
      railwayCargoTerminal: 'Kaiserslautern Güterbahnhof',
      motorwayConnections: ['A6', 'A62'],
      logisticsHubs: ['Pfalz Tech-Logistik', 'IT & Forschung Distribution'],
    },
  },
  gera: {
    metrics: biz(380, 140, 12, 88, 280, 68),
    businessIndex: 69,
    infra: {
      airports: ['Leipzig Halle Airport (LEJ) — 70 km'],
      railwayCargoTerminal: 'Gera Güterverkehr',
      motorwayConnections: ['A4', 'A9'],
      logisticsHubs: ['Ostthüringen Logistik', 'Textil & Industrie Services'],
    },
  },
  bayreuth: {
    metrics: biz(370, 135, 12, 85, 270, 69),
    businessIndex: 69,
    infra: {
      airports: ['Nuremberg Airport (NUE) — 90 km'],
      railwayCargoTerminal: 'Bayreuth Güterverkehr',
      motorwayConnections: ['A9', 'A70'],
      logisticsHubs: ['Franken Nord Logistik', 'Kultur & Handwerk Services'],
    },
  },
  bamberg: {
    metrics: biz(390, 145, 12, 90, 285, 70),
    businessIndex: 70,
    infra: {
      airports: ['Nuremberg Airport (NUE) — 60 km'],
      railwayCargoTerminal: 'Bamberg Güterverkehr',
      motorwayConnections: ['A70', 'A73'],
      logisticsHubs: ['Oberfranken Logistik', 'Brau & Handwerk Distribution'],
    },
  },
  flensburg: {
    metrics: biz(400, 150, 14, 120, 295, 71),
    logisticsScore: 78,
    businessIndex: 73,
    infra: {
      airports: ['Sonderborg (SGD) — 50 km'],
      railwayCargoTerminal: 'Flensburg Hafen Cargo',
      inlandPort: 'Flensburg Förde Hafen',
      motorwayConnections: ['A7', 'B200'],
      logisticsHubs: ['Ostsee Nord Logistik', 'Grenzhandel Dänemark'],
    },
  },
  neubrandenburg: {
    metrics: biz(360, 130, 12, 82, 265, 68),
    businessIndex: 68,
    infra: {
      airports: ['Rostock-Laage (RLG) — 50 km'],
      railwayCargoTerminal: 'Neubrandenburg Güterverkehr',
      motorwayConnections: ['A20', 'B96'],
      logisticsHubs: ['Mecklenburg Seenplatte Logistik', 'Landwirtschaft Distribution'],
    },
  },

  // ── Saarland regional towns (new) ──
  neunkirchen: {
    metrics: biz(420, 165, 14, 118, 330, 71),
    logisticsScore: 76,
    businessIndex: 73,
    infra: {
      airports: ['Saarbrücken Airport (SCN) — 25 km'],
      railwayCargoTerminal: 'Neunkirchen-Wiebelskirchen Güterbahnhof',
      motorwayConnections: ['A8', 'B41'],
      industrialZones: ['Neunkirchen Stahlwerk', 'Saar-Nahe Gewerbepark'],
      logisticsHubs: ['Saar-Nahe Logistik', 'Neunkirchen Industrie'],
    },
  },
  homburg: {
    metrics: biz(390, 150, 12, 105, 310, 70),
    innovationScore: 74,
    businessIndex: 72,
    infra: {
      airports: ['Saarbrücken Airport (SCN) — 20 km'],
      railwayCargoTerminal: 'Homburg Hbf Güterverkehr',
      motorwayConnections: ['A6', 'A8', 'B40'],
      logisticsHubs: ['Westpfalz Distribution', 'Universität Services'],
    },
  },
  voelklingen: {
    metrics: biz(380, 145, 14, 112, 300, 69),
    logisticsScore: 75,
    businessIndex: 71,
    infra: {
      airports: ['Saarbrücken Airport (SCN) — 15 km'],
      railwayCargoTerminal: 'Völklingen Güterbahnhof',
      motorwayConnections: ['A620', 'B51'],
      industrialZones: ['Völklinger Hütte UNESCO', 'Saarstahl Industrie'],
      logisticsHubs: ['Saar-Industriekorridor', 'Stahl Logistik Völklingen'],
    },
  },
  saarlouis: {
    metrics: biz(400, 155, 14, 125, 320, 72),
    logisticsScore: 77,
    businessIndex: 74,
    infra: {
      airports: ['Saarbrücken Airport (SCN) — 35 km'],
      railwayCargoTerminal: 'Saarlouis Dillingen Cargo',
      motorwayConnections: ['A8', 'A620', 'B26'],
      industrialZones: ['Ford Saarlouis Werk', 'Roden Saar Gewerbepark'],
      logisticsHubs: ['Ford Supply Chain Saarlouis', 'Grenzhandel Frankreich'],
    },
  },
  sankt_ingbert: {
    metrics: biz(370, 140, 12, 98, 295, 71),
    techScore: 76,
    businessIndex: 73,
    infra: {
      airports: ['Saarbrücken Airport (SCN) — 10 km'],
      railwayCargoTerminal: 'St. Ingbert Güterverkehr',
      motorwayConnections: ['A8', 'A620'],
      logisticsHubs: ['Saar Mitte Fracht', 'IT & Business Services'],
    },
  },
  merzig: {
    metrics: biz(340, 130, 10, 92, 275, 68),
    businessIndex: 70,
    infra: {
      airports: ['Saarbrücken Airport (SCN) — 40 km'],
      railwayCargoTerminal: 'Merzig Güterbahnhof',
      motorwayConnections: ['A8', 'B51'],
      logisticsHubs: ['Saargau Verteilung', 'Wein & Logistik Merzig'],
    },
  },
  st_wendel: {
    metrics: biz(320, 125, 10, 88, 260, 67),
    businessIndex: 69,
    infra: {
      airports: ['Saarbrücken Airport (SCN) — 45 km'],
      railwayCargoTerminal: 'St. Wendel Güterverkehr',
      motorwayConnections: ['A62', 'B41'],
      logisticsHubs: ['Nord-Saar Logistik', 'Handwerk Cluster'],
    },
  },
  dillingen_saar: {
    metrics: biz(310, 120, 10, 95, 250, 68),
    logisticsScore: 74,
    businessIndex: 70,
    infra: {
      airports: ['Saarbrücken Airport (SCN) — 30 km'],
      railwayCargoTerminal: 'Dillingen Saarhütten Cargo',
      motorwayConnections: ['A8', 'B26'],
      industrialZones: ['Saarhütten Stahlwerk', 'Dillingen Industrie'],
      logisticsHubs: ['Saarlouis Industrie', 'Stahl Logistik'],
    },
  },
  lebach: {
    metrics: biz(290, 115, 8, 82, 240, 66),
    businessIndex: 68,
    infra: {
      airports: ['Saarbrücken Airport (SCN) — 35 km'],
      railwayCargoTerminal: 'Lebach Güterverkehr',
      motorwayConnections: ['A62', 'B420'],
      logisticsHubs: ['Saar-Ost Distribution', 'Landwirtschaft Logistik'],
    },
  },
  ottweiler: {
    metrics: biz(270, 105, 8, 78, 225, 65),
    businessIndex: 67,
    infra: {
      airports: ['Saarbrücken Airport (SCN) — 20 km'],
      railwayCargoTerminal: 'Ottweiler Güterbahnhof',
      motorwayConnections: ['A8', 'B41'],
      logisticsHubs: ['Neunkirchen Umland Logistik', 'Handwerk Services'],
    },
  },
  blieskastel: {
    metrics: biz(285, 110, 8, 85, 235, 66),
    businessIndex: 68,
    infra: {
      airports: ['Saarbrücken Airport (SCN) — 30 km'],
      railwayCargoTerminal: 'Blieskastel Güterverkehr',
      motorwayConnections: ['A6', 'A8', 'B423'],
      logisticsHubs: ['Bliesgau Fracht', 'Grenzregion Logistik'],
    },
  },

  ...GERMANY_BUNDESLAENDER_ENRICHMENT,

  ...GERMANY_RHEINLAND_PFALZ_ENRICHMENT,

  ...GERMANY_SAARLAND_ENRICHMENT,

  ...GERMANY_HESSEN_ENRICHMENT,

  ...GERMANY_BW_ENRICHMENT,
};

export function getGermanyCityEnrichment(cityId: string): GermanyCityEnrichment | undefined {
  return GERMANY_CITY_ENRICHMENT[cityId];
}
