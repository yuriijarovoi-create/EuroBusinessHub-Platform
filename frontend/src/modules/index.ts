import type { ModuleId } from '@shared/types';
import { routes } from '@/config';

export interface ModuleMeta {
  id: ModuleId;
  folder: string;
  apiPrefix: string;
  roles: string[];
}

const moduleRegistry: Record<ModuleId, ModuleMeta> = {
  dashboard: {
    id: 'dashboard',
    folder: 'dashboard',
    apiPrefix: '/api/v1/dashboard',
    roles: ['private', 'company'],
  },
  marketplace: {
    id: 'marketplace',
    folder: 'marketplace',
    apiPrefix: '/api/v1/marketplace',
    roles: ['seller', 'company', 'private'],
  },
  transport: {
    id: 'transport',
    folder: 'transport',
    apiPrefix: '/api/v1/transport',
    roles: ['transport-provider', 'company'],
  },
  logistik: {
    id: 'logistik',
    folder: 'logistics',
    apiPrefix: '/api/v1/logistics',
    roles: ['company', 'transport-provider'],
  },
  lager: {
    id: 'lager',
    folder: 'warehouses',
    apiPrefix: '/api/v1/warehouses',
    roles: ['warehouse-provider', 'company'],
  },
  unternehmen: {
    id: 'unternehmen',
    folder: 'companies',
    apiPrefix: '/api/v1/companies',
    roles: ['company', 'private'],
  },
  jobs: {
    id: 'jobs',
    folder: 'jobs',
    apiPrefix: '/api/v1/jobs',
    roles: ['company', 'private'],
  },
  services: {
    id: 'services',
    folder: 'services',
    apiPrefix: '/api/v1/services',
    roles: ['service-provider', 'company'],
  },
  partner: {
    id: 'partner',
    folder: 'partners',
    apiPrefix: '/api/v1/partners',
    roles: ['partner', 'company'],
  },
  'digitale-produkte': {
    id: 'digitale-produkte',
    folder: 'digital-products',
    apiPrefix: '/api/v1/digital-products',
    roles: ['seller', 'company'],
  },
  akademie: {
    id: 'akademie',
    folder: 'academy',
    apiPrefix: '/api/v1/academy',
    roles: ['private', 'company'],
  },
  ki: {
    id: 'ki',
    folder: 'ai-assistant',
    apiPrefix: '/api/v1/ai',
    roles: ['private', 'company', 'admin'],
  },
  analytics: {
    id: 'analytics',
    folder: 'analytics',
    apiPrefix: '/api/v1/analytics',
    roles: ['company', 'admin'],
  },
  payments: {
    id: 'payments',
    folder: 'payments',
    apiPrefix: '/api/v1/payments',
    roles: ['company', 'admin'],
  },
  admin: {
    id: 'admin',
    folder: 'admin',
    apiPrefix: '/api/v1/admin',
    roles: ['admin'],
  },
};

export function getModuleMeta(id: ModuleId): ModuleMeta | undefined {
  return moduleRegistry[id];
}

export function getAllModuleMeta(): ModuleMeta[] {
  return Object.values(moduleRegistry);
}

export const moduleRoutes = {
  dashboard: routes.dashboard,
  admin: routes.admin,
} as const;
