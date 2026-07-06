import { Suspense, lazy, useCallback } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapEngineProvider } from '../engine/MapEngine';
import { mapSessionStore, useMapSessionStore } from '../store/mapSessionStore';
import type { MapCityRecord } from '../types/mapTypes';
import styles from './MapOSLayout.module.css';
import mapStyles from '../shell/BusinessOperatingMap.module.css';

const BusinessOperatingMap = lazy(() =>
  import('../shell/BusinessOperatingMap').then((m) => ({ default: m.BusinessOperatingMap })),
);

/**
 * Keeps a single Leaflet map instance alive while toggling map ↔ workspace views.
 */
export function MapOSLayout() {
  const { t } = useTranslation('map');
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const session = useMapSessionStore();
  const isWorkspace = location.pathname.startsWith('/workspace');
  const focusCityId =
    location.pathname === '/map' ? searchParams.get('city') ?? undefined : session.focusCityId;

  const handleOpenWorkspace = useCallback(
    (city: MapCityRecord) => {
      mapSessionStore.enterWorkspace(city.id);
      navigate(`/workspace/${city.id}`);
    },
    [navigate],
  );

  return (
    <MapEngineProvider onOpenWorkspace={handleOpenWorkspace}>
      <div className={styles.osRoot}>
        <div
          className={`${styles.mapPane} ${isWorkspace ? styles.mapPaneHidden : ''}`}
          aria-hidden={isWorkspace}
        >
          <Suspense fallback={<div className={mapStyles.mapLoading}>{t('loading')}</div>}>
            <BusinessOperatingMap
              mode="full"
              focusCityId={focusCityId}
              useExternalProvider
              onOpenWorkspace={handleOpenWorkspace}
            />
          </Suspense>
        </div>

        <div className={`${styles.workspacePane} ${isWorkspace ? styles.workspacePaneActive : ''}`}>
          <Outlet />
        </div>
      </div>
    </MapEngineProvider>
  );
}
