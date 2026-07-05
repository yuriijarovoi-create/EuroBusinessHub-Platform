import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/layouts/AppShell';
import { HomePage, ModulesPage, ModulePage, CityWorkspacePage, DashboardPage, MapPage } from '@/pages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'map', element: <MapPage /> },
      { path: 'modules', element: <ModulesPage /> },
      { path: 'module/:moduleId', element: <ModulePage /> },
      { path: 'workspace/:cityId', element: <CityWorkspacePage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'admin', element: <ModulePage /> },
    ],
  },
]);
