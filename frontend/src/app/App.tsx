import { RouterProvider } from 'react-router-dom';
import { useDocumentLanguage } from '@/i18n/useDocumentLanguage';
import { router } from './router';

function AppShellWithI18n() {
  useDocumentLanguage();
  return <RouterProvider router={router} />;
}

export function App() {
  return <AppShellWithI18n />;
}
