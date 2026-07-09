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
  label: string;
  color: string;
}> = [
  { id: 'road', label: 'Road transport', color: '#3b8ede' },
  { id: 'rail', label: 'Rail', color: '#34c759' },
  { id: 'sea', label: 'Sea freight', color: '#ff8c42' },
  { id: 'air', label: 'Air cargo', color: '#a78bfa' },
  { id: 'river', label: 'River', color: '#22d3ee' },
];

export const BUSINESS_LAYER_OPTIONS: Array<{ id: BusinessLayerId; label: string }> = [
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'transport', label: 'Transport' },
  { id: 'companies', label: 'Companies' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'warehouses', label: 'Warehouses' },
  { id: 'businessServices', label: 'Business Services' },
  { id: 'partners', label: 'Partners' },
  { id: 'academy', label: 'Academy' },
  { id: 'digitalProducts', label: 'Digital Products' },
  { id: 'ai', label: 'AI' },
  { id: 'events', label: 'Events' },
  { id: 'investments', label: 'Investments' },
  { id: 'startups', label: 'Startups' },
  { id: 'manufacturing', label: 'Manufacturing' },
  { id: 'agriculture', label: 'Agriculture' },
  { id: 'construction', label: 'Construction' },
  { id: 'medical', label: 'Medical' },
  { id: 'tourism', label: 'Tourism' },
  { id: 'technology', label: 'Technology' },
  { id: 'finance', label: 'Finance' },
  { id: 'legal', label: 'Legal' },
  { id: 'education', label: 'Education' },
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

export function getLogisticsLayerLabel(layerId: LogisticsLayerId): string {
  return LOGISTICS_LAYER_OPTIONS.find((entry) => entry.id === layerId)?.label ?? layerId;
}

export function getBusinessLayerLabel(layerId: BusinessLayerId): string {
  return BUSINESS_LAYER_OPTIONS.find((entry) => entry.id === layerId)?.label ?? layerId;
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
