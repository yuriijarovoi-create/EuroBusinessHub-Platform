/** API route registry — maps to frontend module apiPrefix values */

export const apiRoutes = {
  v1: {
    auth: '/api/v1/auth',
    users: '/api/v1/users',
    companies: '/api/v1/companies',
    marketplace: '/api/v1/marketplace',
    transport: '/api/v1/transport',
    logistics: '/api/v1/logistics',
    warehouses: '/api/v1/warehouses',
    jobs: '/api/v1/jobs',
    partners: '/api/v1/partners',
    digitalProducts: '/api/v1/digital-products',
    academy: '/api/v1/academy',
    ai: '/api/v1/ai',
    search: '/api/v1/search',
    notifications: '/api/v1/notifications',
    payments: '/api/v1/payments',
  },
} as const;
