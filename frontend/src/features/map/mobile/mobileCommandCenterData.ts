export type MobileRadialOrbitId =
  | 'layers'
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

export type MobileLayerSelectionId = Exclude<MobileRadialActionId, 'more'> | MobileMoreCategoryId;

export interface MobileRadialOrbitAction {
  id: MobileRadialOrbitId;
  icon: string;
  label: string;
  angle: number;
  toast: string;
}

export interface MobileMoreCategory {
  id: MobileMoreCategoryId;
  icon: string;
  title: string;
}

export const MOBILE_RADIAL_CENTER = {
  id: 'map' as const,
  icon: '🌍',
  label: 'Map',
  toast: 'Map view active',
};

const ORBIT_STEP = 360 / 7;

/** Seven orbit buttons — equal spacing on a true circle, starting from top. */
export const MOBILE_RADIAL_ORBIT: MobileRadialOrbitAction[] = [
  { id: 'layers', icon: '🗺', label: 'Layers', angle: -90, toast: 'Layer manager coming soon' },
  { id: 'transport', icon: '🚚', label: 'Transport', angle: -90 + ORBIT_STEP * 1, toast: 'Transport selected' },
  { id: 'jobs', icon: '💼', label: 'Jobs', angle: -90 + ORBIT_STEP * 2, toast: 'Jobs selected' },
  { id: 'companies', icon: '🏢', label: 'Companies', angle: -90 + ORBIT_STEP * 3, toast: 'Companies selected' },
  { id: 'warehouses', icon: '📦', label: 'Warehouses', angle: -90 + ORBIT_STEP * 4, toast: 'Warehouses selected' },
  { id: 'ai', icon: '🤖', label: 'AI', angle: -90 + ORBIT_STEP * 5, toast: 'AI Map Assistant coming soon' },
  { id: 'more', icon: '⚙', label: 'More', angle: -90 + ORBIT_STEP * 6, toast: 'More layers' },
];

export const MOBILE_MORE_CATEGORIES: MobileMoreCategory[] = [
  { id: 'marketplace', icon: '🛒', title: 'Marketplace' },
  { id: 'partners', icon: '🤝', title: 'Partners' },
  { id: 'academy', icon: '🎓', title: 'Academy' },
  { id: 'digital-products', icon: '💻', title: 'Digital Products' },
  { id: 'events', icon: '📅', title: 'Events' },
  { id: 'investments', icon: '💰', title: 'Investments' },
  { id: 'startups', icon: '🚀', title: 'Startups' },
  { id: 'manufacturing', icon: '🏭', title: 'Manufacturing' },
  { id: 'agriculture', icon: '🌾', title: 'Agriculture' },
  { id: 'construction', icon: '🏗', title: 'Construction' },
  { id: 'medical', icon: '🏥', title: 'Medical' },
  { id: 'tourism', icon: '🏖', title: 'Tourism' },
  { id: 'technology', icon: '💻', title: 'Technology' },
  { id: 'finance', icon: '💳', title: 'Finance' },
  { id: 'legal', icon: '⚖', title: 'Legal' },
  { id: 'education', icon: '🎓', title: 'Education' },
];
