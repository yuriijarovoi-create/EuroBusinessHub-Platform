import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/layouts/AppShell';
import { MapOSLayout } from '@/features/map/layout/MapOSLayout';
import { HomePage, ModulesPage, ModulePage, CityWorkspacePage, DashboardPage, MapPage } from '@/pages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      {
        element: <MapOSLayout />,
        children: [
          { path: 'map', element: <MapPage /> },
          { path: 'workspace/:cityId', element: <CityWorkspacePage /> },
        ],
      },
      { path: 'modules', element: <ModulesPage /> },
      { path: 'module/:moduleId', element: <ModulePage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'admin', element: <ModulePage /> },
    ],
  },
]);
