import type { MapCityMetrics } from '@shared/types';
import type { GermanyInfrastructure } from '../../types/germanyTypes';

type MetricsSlice = Pick<
  MapCityMetrics,
  'companies' | 'jobs' | 'warehouses' | 'transport' | 'marketplace' | 'aiScore'
>;

export interface RheinlandPfalzEnrichment {
  metrics: MetricsSlice;
  logisticsScore?: number;
  tourismScore?: number;
  techScore?: number;
  innovationScore?: number;
  businessIndex?: number;
  infra?: Partial<GermanyInfrastructure>;
}

function b(c: number, j: number, w: number, t: number, m: number, a: number): MetricsSlice {
  return { companies: c, jobs: j, warehouses: w, transport: t, marketplace: m, aiScore: a };
}

/** Rheinland-Pfalz enrichment — merges over existing (no duplicate cities) */
export const GERMANY_RHEINLAND_PFALZ_ENRICHMENT: Record<string, RheinlandPfalzEnrichment> = {
  // ── Main business cities (enrich) ──
  mainz: {
    metrics: b(680, 280, 26, 175, 540, 78),
    logisticsScore: 82,
    tourismScore: 68,
    businessIndex: 80,
    infra: {
      airports: ['Frankfurt Airport (FRA) — 30 km'],
      railwayCargoTerminal: 'Mainz Hafen Cargo',
      inlandPort: 'Rhein Hafen Mainz',
      motorwayConnections: ['A60', 'A63', 'A66'],
      industrialZones: ['ZDF Medienpark', 'Mainz Pharma Cluster'],
      logisticsHubs: ['Landeshauptstadt Services', 'Rhein-Main Verwaltung & Medien'],
    },
  },
  ludwigshafen: {
    metrics: b(620, 240, 28, 165, 510, 76),
    logisticsScore: 85,
    businessIndex: 79,
    infra: {
      industrialZones: ['BASF Ludwigshafen — größtes Chemiewerk der Welt'],
      inlandPort: 'Rhein Hafen Ludwigshafen',
      motorwayConnections: ['A6', 'A650', 'B37'],
      logisticsHubs: ['BASF Supply Chain', 'Chemiepark Rhein-Neckar'],
    },
  },
  koblenz: {
    metrics: b(520, 200, 20, 155, 400, 74),
    logisticsScore: 84,
    tourismScore: 76,
    businessIndex: 78,
    infra: {
      railwayCargoTerminal: 'Koblenz Güterbahnhof',
      inlandPort: 'Rhein-Mosel Hafen Koblenz',
      motorwayConnections: ['A3', 'A48', 'A61', 'B9'],
      logisticsHubs: ['Deutsches Eck Logistik', 'Regionaler Mittelrhein Hub'],
    },
  },
  trier: {
    metrics: b(480, 185, 16, 125, 380, 73),
    logisticsScore: 72,
    tourismScore: 88,
    innovationScore: 78,
    businessIndex: 77,
    infra: {
      railwayCargoTerminal: 'Trier Güterbahnhof',
      motorwayConnections: ['A1', 'A48', 'A602'],
      logisticsHubs: ['Universität Trier Services', 'Mosel Tourismus & Wein'],
    },
  },
  kaiserslautern: {
    metrics: b(500, 195, 18, 130, 390, 76),
    techScore: 82,
    logisticsScore: 74,
    innovationScore: 80,
    businessIndex: 78,
    infra: {
      airports: ['Saarbrücken Airport (SCN) — 70 km'],
      railwayCargoTerminal: 'Kaiserslautern Hbf Güter',
      motorwayConnections: ['A6', 'A62', 'A63'],
      logisticsHubs: ['TU Kaiserslautern Tech', 'US Business Ecosystem Pfalz'],
    },
  },
  worms: {
    metrics: b(450, 170, 14, 115, 340, 71),
    logisticsScore: 76,
    tourismScore: 72,
    businessIndex: 73,
    infra: { inlandPort: 'Rhein Hafen Worms', motorwayConnections: ['A61', 'A63'], logisticsHubs: ['Rheinhessen Logistik'] },
  },
  neuwied: {
    metrics: b(440, 165, 14, 108, 330, 70),
    logisticsScore: 74,
    businessIndex: 72,
    infra: { inlandPort: 'Rhein Hafen Neuwied', motorwayConnections: ['A3', 'A48'], logisticsHubs: ['Mittelrhein Verteilung'] },
  },
  speyer: {
    metrics: b(430, 165, 14, 105, 325, 71),
    tourismScore: 80,
    logisticsScore: 72,
    businessIndex: 73,
    infra: { inlandPort: 'Rhein Hafen Speyer', logisticsHubs: ['Dom & Technik Museum Logistik'] },
  },
  bad_kreuznach: {
    metrics: b(420, 160, 12, 100, 315, 70),
    tourismScore: 78,
    logisticsScore: 70,
    businessIndex: 72,
    infra: { logisticsHubs: ['Nahe Wein & Kur Logistik'], motorwayConnections: ['A61', 'B41'] },
  },
  frankenthal: {
    metrics: b(410, 155, 12, 98, 310, 69),
    logisticsScore: 73,
    businessIndex: 71,
    infra: { motorwayConnections: ['A6', 'A61'], logisticsHubs: ['Pfalz Industrie Frankenthal'] },
  },
  landau_pfalz: {
    metrics: b(400, 155, 12, 95, 305, 70),
    tourismScore: 74,
    logisticsScore: 71,
    businessIndex: 71,
    infra: { motorwayConnections: ['A65', 'B38'], logisticsHubs: ['Südpfalz Verteilung'] },
  },
  pirmasens: {
    metrics: b(390, 150, 12, 92, 295, 68),
    logisticsScore: 70,
    businessIndex: 69,
    infra: { logisticsHubs: ['Westpfalz Schuh & Industrie'] },
  },
  zweibruecken: {
    metrics: b(370, 140, 10, 88, 280, 67),
    logisticsScore: 72,
    businessIndex: 69,
    infra: { airports: ['Zweibrücken Airport'], logisticsHubs: ['US Air Base Logistik Umland'] },
  },
  andernach: {
    metrics: b(400, 155, 12, 102, 310, 70),
    logisticsScore: 73,
    tourismScore: 70,
    businessIndex: 71,
    infra: { inlandPort: 'Rhein Hafen Andernach', logisticsHubs: ['Vulkan Eifel Fracht'] },
  },
  idar_oberstein: {
    metrics: b(380, 145, 10, 90, 290, 69),
    businessIndex: 70,
    infra: { logisticsHubs: ['Edelstein & Schmuck Handwerk'] },
  },
  bingen: {
    metrics: b(400, 155, 12, 105, 315, 71),
    tourismScore: 82,
    logisticsScore: 74,
    businessIndex: 73,
    infra: { inlandPort: 'Rhein Hafen Bingen', logisticsHubs: ['Mäuseturm Mosel-Rhein Logistik'] },
  },
  ingelheim: {
    metrics: b(390, 150, 12, 100, 305, 72),
    logisticsScore: 74,
    businessIndex: 72,
    infra: { industrialZones: ['Boehringer Ingelheim'], logisticsHubs: ['Pharma Logistik Ingelheim'] },
  },
  mayen: {
    metrics: b(370, 140, 10, 92, 285, 69),
    logisticsScore: 72,
    businessIndex: 70,
    infra: { logisticsHubs: ['Maifeld Vulkanstein Logistik'] },
  },
  lahnstein: {
    metrics: b(350, 130, 10, 88, 270, 68),
    tourismScore: 75,
    logisticsScore: 71,
    businessIndex: 70,
    infra: { inlandPort: 'Lahn-Mosel Hafen Lahnstein', logisticsHubs: ['Burg Lahneck Tourismus'] },
  },
  germersheim: {
    metrics: b(360, 135, 12, 125, 280, 71),
    logisticsScore: 82,
    businessIndex: 74,
    infra: {
      inlandPort: 'Rheinhafen Germersheim',
      railwayCargoTerminal: 'Germersheim Güterbahnhof',
      motorwayConnections: ['A61', 'B9'],
      logisticsHubs: ['Rhein-Logistik Germersheim', 'Binnenschifffahrt Korridor'],
    },
  },

  // ── Mosel hub & towns (enrich) ──
  cochem: {
    metrics: b(340, 125, 8, 95, 265, 72),
    tourismScore: 92,
    logisticsScore: 74,
    businessIndex: 76,
    infra: { inlandPort: 'Mosel Hafen Cochem', logisticsHubs: ['Mosel Wein & Tourismus Hub', 'Reichsburg Services'] },
  },
  wittlich: {
    metrics: b(420, 160, 14, 135, 330, 71),
    logisticsScore: 80,
    businessIndex: 74,
    infra: { industrialZones: ['Wittlich Gewerbepark'], logisticsHubs: ['Mosel Regionale Industrie & Logistik'] },
  },
  zell_an_der_mosel: {
    metrics: b(300, 110, 6, 75, 240, 68),
    tourismScore: 85,
    logisticsScore: 68,
    infra: { logisticsHubs: ['Zeller Schwarze Katz Wein Logistik'] },
  },
  traben_trarbach: {
    metrics: b(320, 120, 8, 82, 255, 69),
    tourismScore: 86,
    logisticsScore: 70,
    infra: { logisticsHubs: ['Mosel Mittelgebirge Tourismus'] },
  },
  bernkastel_kues: {
    metrics: b(330, 125, 8, 80, 260, 70),
    tourismScore: 90,
    logisticsScore: 69,
    infra: { logisticsHubs: ['Bernkastel Wein & Kur'] },
  },
  mendig: {
    metrics: b(310, 115, 8, 78, 245, 67),
    logisticsScore: 68,
    infra: { logisticsHubs: ['Mendig Vulkanpark Logistik'] },
  },

  // ── Eifel (enrich) ──
  daun: {
    metrics: b(340, 125, 8, 85, 255, 68),
    tourismScore: 78,
    logisticsScore: 68,
    infra: { logisticsHubs: ['Vulkaneifel Tourismus & Landwirtschaft'] },
  },
  gerolstein: {
    metrics: b(330, 120, 8, 82, 250, 67),
    logisticsScore: 70,
    infra: { railwayCargoTerminal: 'Gerolstein Güterbahnhof', logisticsHubs: ['Eifel Bahn-Logistik'] },
  },
  pruem: {
    metrics: b(320, 118, 8, 78, 242, 67),
    logisticsScore: 68,
    infra: { logisticsHubs: ['Westeifel Verteilung'] },
  },
  bitburg: {
    metrics: b(350, 130, 10, 88, 268, 69),
    logisticsScore: 72,
    infra: { logisticsHubs: ['Bitburger Brauerei Logistik', 'US Air Base Umland'] },
  },

  // ── New Tier-4 villages ──
  treis_karden: { metrics: b(280, 100, 6, 70, 220, 65), tourismScore: 82, logisticsScore: 62, infra: { logisticsHubs: ['Mosel Wein Dorf Services'] } },
  kaisersesch: { metrics: b(290, 105, 6, 72, 228, 66), logisticsScore: 65, infra: { logisticsHubs: ['Kaisersesch Regional'] } },
  alf: { metrics: b(260, 95, 5, 62, 205, 64), tourismScore: 80, logisticsScore: 58, infra: { logisticsHubs: ['Alf Mosel Tourismus'] } },
  senheim: { metrics: b(250, 90, 4, 58, 195, 63), tourismScore: 78, logisticsScore: 55, infra: { logisticsHubs: ['Senheim Wein Dorf'] } },
  bullay: { metrics: b(270, 98, 5, 65, 210, 64), tourismScore: 76, logisticsScore: 60, infra: { logisticsHubs: ['Bullay Doppelstockbrücke Logistik'] } },
  klotten: { metrics: b(255, 92, 4, 60, 200, 63), tourismScore: 84, logisticsScore: 56, infra: { logisticsHubs: ['Klotten Freizeit & Mosel'] } },
  mueden: { metrics: b(248, 88, 4, 58, 192, 62), tourismScore: 75, logisticsScore: 55, infra: { logisticsHubs: ['Müden Mosel Dorf'] } },
  pommern: { metrics: b(245, 88, 4, 56, 190, 62), tourismScore: 74, logisticsScore: 54, infra: { logisticsHubs: ['Pommern Mosel'] } },
  moselkern: { metrics: b(252, 90, 4, 59, 198, 63), tourismScore: 77, logisticsScore: 56, infra: { logisticsHubs: ['Moselkern Wein & Handwerk'] } },
  adenau: { metrics: b(275, 100, 5, 68, 215, 65), tourismScore: 82, logisticsScore: 62, infra: { logisticsHubs: ['Nürburgring Event Logistik'] } },
  bad_neuenahr_ahrweiler: { metrics: b(360, 135, 10, 90, 275, 70), tourismScore: 80, logisticsScore: 68, infra: { logisticsHubs: ['Ahr Wein & Kur Logistik'] } },
  sinzig: { metrics: b(320, 118, 8, 80, 248, 67), logisticsScore: 66, infra: { logisticsHubs: ['Sinzig Rhein Logistik'] } },
  remagen: { metrics: b(315, 115, 8, 78, 245, 68), tourismScore: 79, logisticsScore: 65, infra: { logisticsHubs: ['Ludendorff-Brücke Museum Logistik'] } },
  polch: { metrics: b(300, 110, 6, 74, 235, 66), logisticsScore: 64, infra: { logisticsHubs: ['Maifeld Polch Verteilung'] } },
  ulmen: { metrics: b(270, 98, 5, 64, 212, 64), tourismScore: 76, logisticsScore: 58, infra: { logisticsHubs: ['Ulmen Maare Tourismus'] } },
  kelberg: { metrics: b(255, 92, 4, 60, 200, 63), tourismScore: 74, logisticsScore: 55, infra: { logisticsHubs: ['Hohe Acht Eifel Logistik'] } },
};
