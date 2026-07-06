import type { MapCityMetrics } from '@shared/types';
import type { GermanyInfrastructure } from '../../types/germanyTypes';

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
  businessIndex?: number;
  infra?: Partial<GermanyInfrastructure>;
}

type M = GermanyCityEnrichment;

function b(c: number, j: number, w: number, t: number, m: number, a: number): M['metrics'] {
  return { companies: c, jobs: j, warehouses: w, transport: t, marketplace: m, aiScore: a };
}

/** Bundesland gap-fill enrichment — merged into GERMANY_CITY_ENRICHMENT (no duplicate cities) */
export const GERMANY_BUNDESLAENDER_ENRICHMENT: Record<string, M> = {
  // ── Nordrhein-Westfalen ──
  gelsenkirchen: { metrics: b(580, 220, 24, 148, 450, 71), logisticsScore: 79, businessIndex: 74, infra: { railwayCargoTerminal: 'Gelsenkirchen Hbf Güter', motorwayConnections: ['A2', 'A40', 'A42'], logisticsHubs: ['Ruhr Verteilung Gelsenkirchen'] } },
  moenchengladbach: { metrics: b(560, 210, 22, 142, 430, 70), logisticsScore: 78, businessIndex: 73, infra: { motorwayConnections: ['A4', 'A61'], logisticsHubs: ['Niederrhein Logistik'] } },
  krefeld: { metrics: b(540, 205, 20, 135, 410, 70), logisticsScore: 77, businessIndex: 72, infra: { inlandPort: 'Rheinhafen Krefeld', motorwayConnections: ['A57', 'A44'], logisticsHubs: ['Niederrhein Hafen'] } },
  oberhausen: { metrics: b(550, 215, 22, 140, 420, 71), logisticsScore: 78, businessIndex: 73, infra: { railwayCargoTerminal: 'Oberhausen Güterbahnhof', motorwayConnections: ['A2', 'A3', 'A40'], logisticsHubs: ['Ruhr Shopping & Fracht'] } },
  hagen: { metrics: b(520, 200, 20, 130, 400, 70), logisticsScore: 76, businessIndex: 72, infra: { motorwayConnections: ['A45', 'A46'], logisticsHubs: ['Ruhr-Süd Logistik'] } },
  hamm: { metrics: b(510, 195, 20, 155, 390, 71), logisticsScore: 80, businessIndex: 74, infra: { railwayCargoTerminal: 'Hamm Güterverkehrszentrum', motorwayConnections: ['A1', 'A2'], logisticsHubs: ['Hamm Logistikcluster — größter Güterbahnhof NRW'] } },
  muelheim_an_der_ruhr: { metrics: b(500, 190, 18, 125, 380, 69), logisticsScore: 76, businessIndex: 71, infra: { motorwayConnections: ['A40', 'A52'], logisticsHubs: ['Ruhr Mitte Fracht'] } },
  leverkusen: { metrics: b(570, 225, 24, 145, 440, 72), logisticsScore: 79, businessIndex: 74, infra: { industrialZones: ['Chemiepark Leverkusen'], motorwayConnections: ['A1', 'A3'], logisticsHubs: ['Rhein Chemiepark Logistik'] } },
  solingen: { metrics: b(480, 180, 16, 118, 360, 69), businessIndex: 70, infra: { motorwayConnections: ['A3', 'A46'], logisticsHubs: ['Bergisches Land Logistik'] } },
  herne: { metrics: b(530, 205, 20, 132, 405, 70), logisticsScore: 77, businessIndex: 72, infra: { motorwayConnections: ['A42', 'A43'], logisticsHubs: ['Ruhr Bochum-Herne Korridor'] } },
  neuss: { metrics: b(560, 215, 20, 138, 425, 72), logisticsScore: 78, businessIndex: 73, infra: { inlandPort: 'Rheinhafen Neuss', motorwayConnections: ['A57', 'A46'], logisticsHubs: ['Niederrhein Distribution'] } },
  recklinghausen: { metrics: b(490, 185, 18, 120, 375, 69), businessIndex: 70, infra: { motorwayConnections: ['A2', 'A43'], logisticsHubs: ['Ruhr Mitte'] } },
  bottrop: { metrics: b(470, 175, 16, 115, 360, 69), logisticsScore: 75, businessIndex: 70, infra: { motorwayConnections: ['A2', 'A31'], logisticsHubs: ['Ruhr Nord Fracht'] } },
  remscheid: { metrics: b(460, 170, 16, 110, 350, 68), businessIndex: 69, infra: { motorwayConnections: ['A1', 'A46'], logisticsHubs: ['Bergisches Land'] } },
  guetersloh: { metrics: b(500, 190, 18, 125, 385, 71), logisticsScore: 76, businessIndex: 72, infra: { motorwayConnections: ['A2', 'A33'], logisticsHubs: ['Ostwestfalen Distribution'] } },
  moers: { metrics: b(450, 165, 14, 108, 340, 68), businessIndex: 69, infra: { motorwayConnections: ['A40', 'A57'], logisticsHubs: ['Niederrhein Fracht'] } },

  // ── Bayern ──
  landshut: { metrics: b(480, 185, 18, 125, 370, 71), logisticsScore: 76, businessIndex: 72, infra: { motorwayConnections: ['A92', 'A93'], logisticsHubs: ['Niederbayern Logistik'] } },
  passau: { metrics: b(460, 175, 16, 118, 355, 70), businessIndex: 71, infra: { inlandPort: 'Donau Hafen Passau', motorwayConnections: ['A3'], logisticsHubs: ['Donau-Ost Logistik'] } },
  rosenheim: { metrics: b(490, 190, 18, 130, 380, 72), logisticsScore: 77, businessIndex: 73, infra: { motorwayConnections: ['A8', 'A93'], logisticsHubs: ['Oberbayern Süd Logistik'] } },
  schweinfurt: { metrics: b(440, 165, 14, 105, 330, 69), businessIndex: 70, infra: { motorwayConnections: ['A70', 'A71'], logisticsHubs: ['Main-Fracht Schweinfurt'] } },
  kempten: { metrics: b(470, 180, 16, 115, 350, 71), logisticsScore: 75, businessIndex: 71, infra: { motorwayConnections: ['A7', 'A96'], logisticsHubs: ['Allgäu Logistik'] } },

  // ── Baden-Württemberg ──
  tuebingen: { metrics: b(500, 195, 18, 115, 390, 76), techScore: 84, innovationScore: 86, businessIndex: 78, infra: { motorwayConnections: ['A8', 'B27'], logisticsHubs: ['Neckar-Alb Forschung Logistik'] } },
  ludwigsburg: { metrics: b(510, 200, 18, 125, 395, 73), logisticsScore: 77, businessIndex: 74, infra: { motorwayConnections: ['A81', 'B27'], logisticsHubs: ['Stuttgart Metro Logistik'] } },
  esslingen: { metrics: b(490, 190, 16, 120, 380, 74), techScore: 82, businessIndex: 75, infra: { motorwayConnections: ['A8', 'B10'], logisticsHubs: ['Neckar Industrie Esslingen'] } },
  konstanz: { metrics: b(480, 185, 16, 110, 370, 73), businessIndex: 73, infra: { inlandPort: 'Bodensee Hafen Konstanz', motorwayConnections: ['B33'], logisticsHubs: ['Bodensee Logistik'] } },
  baden_baden: { metrics: b(420, 160, 14, 95, 320, 72), businessIndex: 72, infra: { motorwayConnections: ['A5', 'B500'], logisticsHubs: ['Baden Kur & Business Services'] } },
  offenburg: { metrics: b(450, 170, 14, 108, 340, 71), logisticsScore: 74, businessIndex: 71, infra: { motorwayConnections: ['A5', 'A48'], logisticsHubs: ['Ortenau Logistik'] } },

  // ── Hessen ──
  hanau: { metrics: b(470, 180, 16, 120, 360, 71), logisticsScore: 76, businessIndex: 72, infra: { motorwayConnections: ['A3', 'A45'], logisticsHubs: ['Main-Kinzig Logistik'] } },
  marburg: { metrics: b(400, 155, 12, 95, 300, 73), innovationScore: 80, businessIndex: 74, infra: { motorwayConnections: ['A49', 'B3'], logisticsHubs: ['Universität & Pharma Logistik'] } },
  fulda: { metrics: b(420, 165, 14, 105, 315, 70), businessIndex: 71, infra: { motorwayConnections: ['A7', 'A66'], logisticsHubs: ['Osthessen Verteilung'] } },
  giessen: { metrics: b(430, 168, 14, 102, 320, 72), innovationScore: 78, businessIndex: 73, infra: { motorwayConnections: ['A5', 'A45'], logisticsHubs: ['Mittelhessen Logistik'] } },
  wetzlar: { metrics: b(410, 160, 12, 98, 305, 71), techScore: 79, businessIndex: 73, infra: { motorwayConnections: ['A45', 'B49'], logisticsHubs: ['Optik & Präzision Logistik'] } },
  ruesselsheim: { metrics: b(460, 175, 16, 118, 350, 72), logisticsScore: 77, businessIndex: 73, infra: { industrialZones: ['Opel Werk Rüsselsheim'], motorwayConnections: ['A60', 'A67'], logisticsHubs: ['Opel Supply Chain'] } },

  // ── Sachsen ──
  plauen: { metrics: b(400, 155, 12, 95, 295, 69), businessIndex: 70, infra: { motorwayConnections: ['A72', 'B173'], logisticsHubs: ['Vogtland Logistik'] } },
  goerlitz: { metrics: b(390, 150, 12, 92, 285, 69), businessIndex: 69, infra: { motorwayConnections: ['A4', 'B115'], logisticsHubs: ['Oberlausitz Grenzhandel'] } },
  freiberg: { metrics: b(410, 160, 14, 98, 310, 72), techScore: 80, innovationScore: 82, businessIndex: 74, infra: { motorwayConnections: ['A4', 'B101'], logisticsHubs: ['Silicon Saxony Mittelsachsen'] } },

  // ── Niedersachsen ──
  salzgitter: { metrics: b(520, 200, 22, 140, 400, 71), logisticsScore: 78, businessIndex: 73, infra: { industrialZones: ['Salzgitter AG Stahlwerk'], motorwayConnections: ['A39', 'A7'], logisticsHubs: ['Stahl Logistik Salzgitter'] } },
  celle: { metrics: b(440, 168, 14, 105, 330, 70), businessIndex: 71, infra: { motorwayConnections: ['A7', 'A37'], logisticsHubs: ['Lüneburger Heide Logistik'] } },
  lueneburg: { metrics: b(460, 175, 14, 108, 345, 71), logisticsScore: 75, businessIndex: 72, infra: { motorwayConnections: ['A39', 'B4'], logisticsHubs: ['Lüneburg Handel & Logistik'] } },

  // ── Rheinland-Pfalz ──
  ludwigshafen: { metrics: b(550, 215, 22, 145, 420, 74), logisticsScore: 80, businessIndex: 75, infra: { industrialZones: ['BASF Ludwigshafen'], motorwayConnections: ['A6', 'A650'], logisticsHubs: ['BASF Supply Chain', 'Rhein Chemie-Logistik'] } },
  worms: { metrics: b(430, 165, 14, 105, 325, 70), businessIndex: 71, infra: { inlandPort: 'Rhein Hafen Worms', motorwayConnections: ['A61', 'A63'], logisticsHubs: ['Rheinhessen Logistik'] } },
  speyer: { metrics: b(420, 160, 14, 100, 315, 70), businessIndex: 71, infra: { inlandPort: 'Rhein Hafen Speyer', motorwayConnections: ['A61', 'B39'], logisticsHubs: ['Technik Museum Logistik Umland'] } },
  neustadt_an_der_weinstrasse: { metrics: b(400, 155, 12, 98, 300, 71), businessIndex: 71, infra: { motorwayConnections: ['A65', 'B39'], logisticsHubs: ['Pfalz Wein & Logistik'] } },

  // ── Thüringen ──
  weimar: { metrics: b(400, 155, 12, 92, 300, 74), innovationScore: 82, businessIndex: 75, infra: { motorwayConnections: ['A4', 'B87'], logisticsHubs: ['Kultur & Forschung Logistik'] } },
  eisenach: { metrics: b(390, 150, 12, 90, 290, 71), businessIndex: 72, infra: { motorwayConnections: ['A4', 'B19'], logisticsHubs: ['Wartburg Logistik', 'Automotive Zulieferer'] } },
  gotha: { metrics: b(380, 145, 12, 88, 285, 70), businessIndex: 71, infra: { motorwayConnections: ['A4', 'B247'], logisticsHubs: ['Mittelthüringen Verteilung'] } },
  suhl: { metrics: b(360, 135, 10, 82, 270, 68), businessIndex: 69, infra: { motorwayConnections: ['A71', 'B62'], logisticsHubs: ['Thüringer Wald Logistik'] } },

  // ── Sachsen-Anhalt (alias ids — no duplicate cities) ──
  dessau_rosslau: { metrics: b(480, 185, 18, 125, 370, 72), logisticsScore: 76, innovationScore: 78, businessIndex: 74, infra: { industrialZones: ['Bauhaus Industrie Dessau'], motorwayConnections: ['A9', 'B185'], logisticsHubs: ['Anhalt Logistik', 'Bauhaus Design Services'] } },
  wittenberg: { metrics: b(400, 155, 12, 95, 300, 71), businessIndex: 71, infra: { motorwayConnections: ['A9', 'B2'], logisticsHubs: ['Elbe Logistik Wittenberg'] } },
  stendal: { metrics: b(380, 145, 12, 92, 285, 69), logisticsScore: 74, businessIndex: 70, infra: { railwayCargoTerminal: 'Stendal Güterverkehr', motorwayConnections: ['A2', 'B189'], logisticsHubs: ['Altmark Logistik', 'Stendal Verteilung'] } },

  // ── Brandenburg (alias id) ──
  brandenburg_havel: { metrics: b(450, 170, 14, 105, 335, 71), logisticsScore: 75, businessIndex: 72, infra: { inlandPort: 'Havel Hafen Brandenburg', motorwayConnections: ['A2', 'B1'], logisticsHubs: ['Havel Logistik', 'Berlin Umland Fracht'] } },
  frankfurt_oder: { metrics: b(400, 155, 12, 95, 295, 69), businessIndex: 70, infra: { motorwayConnections: ['A12', 'B112'], logisticsHubs: ['Oder Grenzhandel Logistik'] } },
  oranienburg: { metrics: b(380, 145, 10, 88, 280, 70), businessIndex: 70, infra: { motorwayConnections: ['A10', 'B96'], logisticsHubs: ['Berlin Nord Logistik'] } },
  eberswalde: { metrics: b(360, 135, 10, 82, 265, 68), businessIndex: 69, infra: { motorwayConnections: ['A11', 'B167'], logisticsHubs: ['Barnim Forst Logistik'] } },

  // ── Schleswig-Holstein ──
  neumuenster: { metrics: b(420, 160, 14, 105, 320, 70), logisticsScore: 75, businessIndex: 71, infra: { motorwayConnections: ['A7', 'A246'], logisticsHubs: ['Holstein Verteilung'] } },
  norderstedt: { metrics: b(400, 155, 12, 98, 305, 72), techScore: 76, businessIndex: 72, infra: { motorwayConnections: ['A7', 'B432'], logisticsHubs: ['Hamburg Metro Logistik'] } },

  // ── Mecklenburg-Vorpommern ──
  stralsund: { metrics: b(400, 155, 14, 115, 310, 71), logisticsScore: 77, businessIndex: 72, infra: { inlandPort: 'Ostseehafen Stralsund', motorwayConnections: ['A20', 'B96'], logisticsHubs: ['Ostsee Fähre & Fracht'] } },
  greifswald: { metrics: b(390, 150, 12, 108, 295, 73), innovationScore: 80, businessIndex: 74, infra: { inlandPort: 'Ostseehafen Greifswald', motorwayConnections: ['A20', 'B109'], logisticsHubs: ['Universität & Hafen Logistik'] } },
  wismar: { metrics: b(370, 140, 12, 105, 285, 70), logisticsScore: 76, businessIndex: 71, infra: { inlandPort: 'Ostseehafen Wismar', motorwayConnections: ['A20', 'B106'], logisticsHubs: ['Hansestadt Hafen Logistik'] } },
};
