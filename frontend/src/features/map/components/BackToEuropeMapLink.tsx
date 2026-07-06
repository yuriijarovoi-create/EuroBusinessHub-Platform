import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { routes } from '@/config';
import { mapSessionStore } from '../store/mapSessionStore';

export function BackToEuropeMapLink({ className }: { className?: string }) {
  const { t } = useTranslation('workspace');
  const navigate = useNavigate();

  const handleBack = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      mapSessionStore.exitWorkspace();
      navigate(routes.map);
    },
    [navigate],
  );

  return (
    <a href={routes.map} className={className} onClick={handleBack}>
      ← {t('backToEuropeMap')}
    </a>
  );
}
