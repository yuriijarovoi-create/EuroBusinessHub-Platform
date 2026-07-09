import type { BusinessLayerId } from '../utils/mapLayerContext';

export type MobileRadialOrbitId =
  | 'transport'
  | 'jobs'
  | 'companies'
  | 'warehouses'
  | 'ai'
  | 'more';

export type MobileRadialActionId = 'map' | MobileRadialOrbitId;

export type MobileMoreCategoryId =
  | 'marketplace'
  | 'partners'
  | 'academy'
  | 'digital-products'
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

export interface MobileRadialOrbitAction {
  id: MobileRadialOrbitId;
  icon: string;
  label: string;
  angle: number;
  layerId: BusinessLayerId | null;
}

export interface MobileMoreCategory {
  id: MobileMoreCategoryId;
  icon: string;
  title: string;
  layerId: BusinessLayerId;
}

export const MOBILE_RADIAL_CENTER = {
  id: 'map' as const,
  icon: '🌍',
  label: 'Map',
};

const ORBIT_STEP = 360 / 6;

/** Six orbit buttons — equal spacing on a true circle, starting from top. */
export const MOBILE_RADIAL_ORBIT: MobileRadialOrbitAction[] = [
  { id: 'transport', icon: '🚚', label: 'Transport', angle: -90, layerId: 'transport' },
  { id: 'jobs', icon: '💼', label: 'Jobs', angle: -90 + ORBIT_STEP, layerId: 'jobs' },
  { id: 'companies', icon: '🏢', label: 'Companies', angle: -90 + ORBIT_STEP * 2, layerId: 'companies' },
  { id: 'warehouses', icon: '📦', label: 'Warehouses', angle: -90 + ORBIT_STEP * 3, layerId: 'warehouses' },
  { id: 'ai', icon: '🤖', label: 'AI', angle: -90 + ORBIT_STEP * 4, layerId: null },
  { id: 'more', icon: '⚙', label: 'More', angle: -90 + ORBIT_STEP * 5, layerId: null },
];

export const MOBILE_MORE_CATEGORIES: MobileMoreCategory[] = [
  { id: 'marketplace', icon: '🛒', title: 'Marketplace', layerId: 'marketplace' },
  { id: 'partners', icon: '🤝', title: 'Partners', layerId: 'partners' },
  { id: 'academy', icon: '🎓', title: 'Academy', layerId: 'academy' },
  { id: 'digital-products', icon: '💻', title: 'Digital Products', layerId: 'digitalProducts' },
  { id: 'events', icon: '📅', title: 'Events', layerId: 'events' },
  { id: 'investments', icon: '💰', title: 'Investments', layerId: 'investments' },
  { id: 'startups', icon: '🚀', title: 'Startups', layerId: 'startups' },
  { id: 'manufacturing', icon: '🏭', title: 'Manufacturing', layerId: 'manufacturing' },
  { id: 'agriculture', icon: '🌾', title: 'Agriculture', layerId: 'agriculture' },
  { id: 'construction', icon: '🏗', title: 'Construction', layerId: 'construction' },
  { id: 'medical', icon: '🏥', title: 'Medical', layerId: 'medical' },
  { id: 'tourism', icon: '🏖', title: 'Tourism', layerId: 'tourism' },
  { id: 'technology', icon: '💻', title: 'Technology', layerId: 'technology' },
  { id: 'finance', icon: '💳', title: 'Finance', layerId: 'finance' },
  { id: 'legal', icon: '⚖', title: 'Legal', layerId: 'legal' },
  { id: 'education', icon: '🎓', title: 'Education', layerId: 'education' },
];

export const MOBILE_MORE_LAYER_IDS = new Set(
  MOBILE_MORE_CATEGORIES.map((category) => category.layerId),
);

export type MobileLayerSelectionId = BusinessLayerId | 'map';
