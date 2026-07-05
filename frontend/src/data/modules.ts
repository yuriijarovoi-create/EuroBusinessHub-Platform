import type { ModuleId, PlatformModule } from '@shared/types';
import { routes } from '@/config';

export const platformModules: PlatformModule[] = [
  { id: 'dashboard', icon: '📊', route: routes.dashboard, status: 'active', showOnHomepage: false, sidebarOrder: 0 },
  { id: 'marketplace', icon: '🛒', route: routes.module('marketplace'), status: 'active', showOnHomepage: true, sidebarOrder: 1 },
  { id: 'transport', icon: '🚚', route: routes.module('transport'), status: 'active', showOnHomepage: true, sidebarOrder: 2 },
  { id: 'logistik', icon: '📦', route: routes.module('logistik'), status: 'active', showOnHomepage: true, sidebarOrder: 3 },
  { id: 'lager', icon: '🏭', route: routes.module('lager'), status: 'beta', showOnHomepage: true, sidebarOrder: 4 },
  { id: 'unternehmen', icon: '🏢', route: routes.module('unternehmen'), status: 'active', showOnHomepage: true, sidebarOrder: 5 },
  { id: 'jobs', icon: '💼', route: routes.module('jobs'), status: 'active', showOnHomepage: true, sidebarOrder: 6 },
  { id: 'services', icon: '⚙️', route: routes.module('services'), status: 'beta', showOnHomepage: false, sidebarOrder: 7 },
  { id: 'partner', icon: '🤝', route: routes.module('partner'), status: 'active', showOnHomepage: true, sidebarOrder: 8 },
  { id: 'digitale-produkte', icon: '💎', route: routes.module('digitale-produkte'), status: 'beta', showOnHomepage: true, sidebarOrder: 9 },
  { id: 'akademie', icon: '🎓', route: routes.module('akademie'), status: 'active', showOnHomepage: true, sidebarOrder: 10 },
  { id: 'ki', icon: '🤖', route: routes.module('ki'), status: 'active', showOnHomepage: true, sidebarOrder: 11 },
  { id: 'analytics', icon: '📈', route: routes.module('analytics'), status: 'beta', showOnHomepage: false, sidebarOrder: 12 },
  { id: 'payments', icon: '💳', route: routes.module('payments'), status: 'beta', showOnHomepage: false, sidebarOrder: 13 },
  { id: 'admin', icon: '🛡️', route: routes.admin, status: 'coming-soon', showOnHomepage: false, sidebarOrder: 14 },
];

export const sidebarModules = [...platformModules].sort((a, b) => a.sidebarOrder - b.sidebarOrder);

export const homepageModules = platformModules.filter((m) => m.showOnHomepage !== false);

/** @deprecated Use platformModules */
export const businessModules = homepageModules;

export function getModuleById(id: ModuleId): PlatformModule | undefined {
  return platformModules.find((m) => m.id === id);
}

export function getSidebarModules(): PlatformModule[] {
  return sidebarModules;
}
