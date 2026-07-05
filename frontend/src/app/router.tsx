import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/shared/layout/AppShell';
import { HomePage } from '@/features/home/HomePage';
import { ModulesPage } from '@/features/modules/ModulesPage';
import { ModulePage } from '@/features/modules/ModulePage';
import { CityWorkspacePage } from '@/features/workspace/CityWorkspacePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'modules', element: <ModulesPage /> },
      { path: 'module/:moduleId', element: <ModulePage /> },
      { path: 'workspace/:cityId', element: <CityWorkspacePage /> },
    ],
  },
]);
