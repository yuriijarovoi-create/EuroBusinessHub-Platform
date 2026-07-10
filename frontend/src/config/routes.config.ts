export const routes = {
  home: '/',
  map: '/map',
  modules: '/modules',
  module: (id: string) => `/module/${id}`,
  workspace: (cityId: string) => `/workspace/${cityId}`,
  workspaceCompanies: (cityId: string) => `/workspace/${cityId}/companies`,
  dashboard: '/dashboard',
  companyDashboard: '/company',
  admin: '/admin',
  login: '/auth/login',
  register: '/auth/register',
} as const;

export { getCityWorkspacePath } from '@/features/workspace/utils/getCityWorkspacePath';
