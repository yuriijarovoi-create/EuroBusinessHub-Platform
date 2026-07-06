import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapProvider } from '../context/MapContext';
import type { MapCityRecord } from '../types/mapTypes';
import styles from '../shell/BusinessOperatingMap.module.css';

const BusinessOperatingMap = lazy(() =>
  import('../shell/BusinessOperatingMap').then((m) => ({ default: m.BusinessOperatingMap })),
);

interface InteractiveEuropeMapProps {
  className?: string;
  focusCityId?: string;
  mode?: 'full' | 'embed';
}

function InteractiveEuropeMapInner({
  focusCityId,
  mode = 'full',
}: {
  focusCityId?: string;
  mode?: 'full' | 'embed';
}) {
  const { t } = useTranslation('map');
  const navigate = useNavigate();

  const handleWorkspace = (city: MapCityRecord) => {
    navigate(`/workspace/${city.id}`);
  };

  return (
    <div className={styles.interactiveRoot} aria-label={t('title')}>
      <Suspense fallback={<div className={styles.mapLoading}>{t('loading')}</div>}>
        <BusinessOperatingMap
          mode={mode}
          focusCityId={focusCityId}
          onOpenWorkspace={handleWorkspace}
        />
      </Suspense>
    </div>
  );
}

export function InteractiveEuropeMap({
  className = '',
  focusCityId,
  mode = 'full',
}: InteractiveEuropeMapProps) {
  return (
    <MapProvider>
      <div className={className}>
        <InteractiveEuropeMapInner focusCityId={focusCityId} mode={mode} />
      </div>
    </MapProvider>
  );
}
