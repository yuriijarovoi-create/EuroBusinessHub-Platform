import type { ModuleId } from '@shared/types';

export const businessModules: {
  id: ModuleId;
  icon: string;
  route: string;
  status: 'active' | 'coming-soon' | 'beta';
}[] = [
  { id: 'marketplace', icon: '🛒', route: '/module/marketplace', status: 'active' },
  { id: 'transport', icon: '🚚', route: '/module/transport', status: 'active' },
  { id: 'logistik', icon: '📦', route: '/module/logistik', status: 'active' },
  { id: 'unternehmen', icon: '🏢', route: '/module/unternehmen', status: 'active' },
  { id: 'jobs', icon: '💼', route: '/module/jobs', status: 'active' },
  { id: 'lager', icon: '🏭', route: '/module/lager', status: 'beta' },
  { id: 'partner', icon: '🤝', route: '/module/partner', status: 'active' },
  { id: 'digitale-produkte', icon: '💎', route: '/module/digitale-produkte', status: 'beta' },
  { id: 'akademie', icon: '🎓', route: '/module/akademie', status: 'active' },
  { id: 'ki', icon: '🤖', route: '/module/ki', status: 'active' },
];

export function getModuleById(id: ModuleId) {
  return businessModules.find((m) => m.id === id);
}
