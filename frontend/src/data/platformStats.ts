import type { PlatformStat, DashboardMetric } from '@shared/types';

export const platformStats: PlatformStat[] = [
  { id: 'companies', labelKey: 'stats.companies', value: 12847, trend: 12.4 },
  { id: 'transportOrders', labelKey: 'stats.transportOrders', value: 3421, trend: 8.2 },
  { id: 'openJobs', labelKey: 'stats.openJobs', value: 1893, trend: 5.1 },
  { id: 'warehouses', labelKey: 'stats.warehouses', value: 456, trend: 3.7 },
  { id: 'marketplaceProducts', labelKey: 'stats.marketplaceProducts', value: 24108, trend: 15.3 },
  { id: 'users', labelKey: 'stats.users', value: 52341, trend: 18.9 },
  { id: 'partners', labelKey: 'stats.partners', value: 892, trend: 6.4 },
];

export const dashboardMetrics: DashboardMetric[] = [
  { id: 'marketplace', labelKey: 'dashboard.marketplace', value: '2.4M €', change: 14.2, icon: '🛒', route: '/module/marketplace', module: 'marketplace' },
  { id: 'transport', labelKey: 'dashboard.transport', value: 847, change: 9.1, icon: '🚚', route: '/module/transport', module: 'transport' },
  { id: 'jobs', labelKey: 'dashboard.jobs', value: 1893, change: 5.1, icon: '💼', route: '/module/jobs', module: 'jobs' },
  { id: 'companies', labelKey: 'dashboard.companies', value: '12.8K', change: 12.4, icon: '🏢', route: '/module/unternehmen', module: 'unternehmen' },
  { id: 'revenue', labelKey: 'dashboard.revenue', value: '486K €', change: 22.8, icon: '💰', route: '/module/payments', module: 'payments' },
  { id: 'deals', labelKey: 'dashboard.deals', value: 234, change: 11.5, icon: '🤝', route: '/module/partner', module: 'partner' },
  { id: 'subscriptions', labelKey: 'dashboard.subscriptions', value: 1247, change: 7.3, icon: '💳', route: '/module/payments', module: 'payments' },
  { id: 'analytics', labelKey: 'dashboard.analytics', value: '98.2%', change: 2.1, icon: '📈', route: '/module/analytics', module: 'analytics' },
];

export const heroCtaLinks = [
  { id: 'marketplace', route: '/module/marketplace', icon: '🛒' },
  { id: 'transport', route: '/module/transport', icon: '🚚' },
  { id: 'unternehmen', route: '/module/unternehmen', icon: '🏢' },
  { id: 'jobs', route: '/module/jobs', icon: '💼' },
] as const;
