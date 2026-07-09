export interface MobileLayerGroup {
  id: string;
  title: string;
  items: string[];
}

export const MOBILE_LAYER_GROUPS: MobileLayerGroup[] = [
  {
    id: 'transport',
    title: 'Transport Layers',
    items: ['Road Transport', 'Rail', 'Air Cargo', 'Sea Freight', 'River'],
  },
  {
    id: 'business',
    title: 'Business Modules',
    items: ['Marketplace', 'Companies', 'Jobs', 'Warehouses', 'Partners'],
  },
  {
    id: 'services',
    title: 'Services',
    items: ['Legal', 'Finance', 'Medical', 'Education', 'Technology'],
  },
  {
    id: 'industries',
    title: 'Industries',
    items: ['Agriculture', 'Manufacturing', 'Construction', 'Tourism'],
  },
  {
    id: 'innovation',
    title: 'Innovation',
    items: ['AI', 'Startups', 'Digital Products', 'Academy', 'Investments'],
  },
];
