/** Stage 2.2 — informational map layer context (no map filtering yet) */

export type LogisticsLayerId = 'road' | 'rail' | 'sea' | 'air' | 'river';

export type BusinessLayerId =
  | 'marketplace'
  | 'transport'
  | 'companies'
  | 'jobs'
  | 'warehouses'
  | 'businessServices'
  | 'partners'
  | 'academy'
  | 'digitalProducts'
  | 'ai'
  | 'events'
  | 'investments'
  | 'startups'
  | 'manufacturing'
  | 'agriculture'
  | 'construction'
  | 'medical'
  | 'tourism'
  | 'technology'
  | 'finance'
  | 'legal'
  | 'education';

export interface ActiveMapContext {
  logisticsLayer: LogisticsLayerId | null;
  businessLayer: BusinessLayerId | null;
}

export const DEFAULT_ACTIVE_MAP_CONTEXT: ActiveMapContext = {
  logisticsLayer: null,
  businessLayer: null,
};

export const LOGISTICS_LAYER_OPTIONS: Array<{
  id: LogisticsLayerId;
  labelKey: string;
  color: string;
}> = [
  { id: 'road', labelKey: 'layers.road', color: '#3b8ede' },
  { id: 'rail', labelKey: 'layers.rail', color: '#34c759' },
  { id: 'sea', labelKey: 'layers.sea', color: '#ff8c42' },
  { id: 'air', labelKey: 'layers.air', color: '#a78bfa' },
  { id: 'river', labelKey: 'layers.river', color: '#22d3ee' },
];

export const BUSINESS_LAYER_OPTIONS: Array<{ id: BusinessLayerId; labelKey: string }> = [
  { id: 'marketplace', labelKey: 'businessLayers.marketplace' },
  { id: 'transport', labelKey: 'businessLayers.transport' },
  { id: 'companies', labelKey: 'businessLayers.companies' },
  { id: 'jobs', labelKey: 'businessLayers.jobs' },
  { id: 'warehouses', labelKey: 'businessLayers.warehouses' },
  { id: 'businessServices', labelKey: 'businessLayers.businessServices' },
  { id: 'partners', labelKey: 'businessLayers.partners' },
  { id: 'academy', labelKey: 'businessLayers.academy' },
  { id: 'digitalProducts', labelKey: 'businessLayers.digitalProducts' },
  { id: 'ai', labelKey: 'businessLayers.ai' },
  { id: 'events', labelKey: 'businessLayers.events' },
  { id: 'investments', labelKey: 'businessLayers.investments' },
  { id: 'startups', labelKey: 'businessLayers.startups' },
  { id: 'manufacturing', labelKey: 'businessLayers.manufacturing' },
  { id: 'agriculture', labelKey: 'businessLayers.agriculture' },
  { id: 'construction', labelKey: 'businessLayers.construction' },
  { id: 'medical', labelKey: 'businessLayers.medical' },
  { id: 'tourism', labelKey: 'businessLayers.tourism' },
  { id: 'technology', labelKey: 'businessLayers.technology' },
  { id: 'finance', labelKey: 'businessLayers.finance' },
  { id: 'legal', labelKey: 'businessLayers.legal' },
  { id: 'education', labelKey: 'businessLayers.education' },
];

export function toggleLogisticsLayer(
  context: ActiveMapContext,
  layerId: LogisticsLayerId,
): ActiveMapContext {
  return {
    ...context,
    logisticsLayer: context.logisticsLayer === layerId ? null : layerId,
  };
}

export function toggleBusinessLayer(
  context: ActiveMapContext,
  layerId: BusinessLayerId,
): ActiveMapContext {
  return {
    ...context,
    businessLayer: context.businessLayer === layerId ? null : layerId,
  };
}

export function setBusinessLayer(
  context: ActiveMapContext,
  layerId: BusinessLayerId,
): ActiveMapContext {
  return {
    ...context,
    businessLayer: layerId,
  };
}

/** Mobile command center — one business layer at a time, logistics emphasis cleared. */
export function setMobileBusinessLayer(layerId: BusinessLayerId | null): ActiveMapContext {
  return {
    logisticsLayer: null,
    businessLayer: layerId,
  };
}

export function getLogisticsLayerLabel(
  layerId: LogisticsLayerId,
  translate: (key: string) => string,
): string {
  const entry = LOGISTICS_LAYER_OPTIONS.find((item) => item.id === layerId);
  return entry ? translate(entry.labelKey) : layerId;
}

export function getBusinessLayerLabel(
  layerId: BusinessLayerId,
  translate: (key: string) => string,
): string {
  const entry = BUSINESS_LAYER_OPTIONS.find((item) => item.id === layerId);
  return entry ? translate(entry.labelKey) : layerId;
}

export function isEuropeOverview(context: ActiveMapContext): boolean {
  return context.logisticsLayer === null && context.businessLayer === null;
}

export function hasLogisticsLayerEmphasis(context: ActiveMapContext): boolean {
  return context.logisticsLayer !== null;
}

export function hasBusinessLayerEmphasis(context: ActiveMapContext): boolean {
  return context.businessLayer !== null;
}
