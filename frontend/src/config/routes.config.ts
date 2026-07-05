export const routes = {
  home: '/',
  map: '/map',
  modules: '/modules',
  module: (id: string) => `/module/${id}`,
  workspace: (cityId: string) => `/workspace/${cityId}`,
  dashboard: '/dashboard',
  companyDashboard: '/company',
  admin: '/admin',
  login: '/auth/login',
  register: '/auth/register',
} as const;
