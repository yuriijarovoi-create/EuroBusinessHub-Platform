import { Suspense, lazy, useCallback, useLayoutEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapEngineProvider } from '../engine/MapEngine';
import { mapSessionStore, useMapSessionStore } from '../store/mapSessionStore';
import type { MapCityRecord } from '../types/mapTypes';
import { saveLastMapContext } from '../utils/lastMapContext';
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
    location.pathname === '/map'
      ? session.focusCityId ?? searchParams.get('city') ?? undefined
      : session.focusCityId;

  const handleOpenWorkspace = useCallback(
    (city: MapCityRecord) => {
      const session = mapSessionStore.getState();
      const stored = saveLastMapContext(city, session);
      mapSessionStore.setCamera({
        center: { lat: stored.center.lat, lng: stored.center.lng },
        zoom: stored.zoom,
      });
      mapSessionStore.enterWorkspace(city.id);
      navigate(`/workspace/${city.id}`);
    },
    [navigate],
  );

  const wasWorkspaceRef = useRef(isWorkspace);
  useLayoutEffect(() => {
    const returnedToMap = wasWorkspaceRef.current && !isWorkspace;
    wasWorkspaceRef.current = isWorkspace;

    if (!returnedToMap || typeof window === 'undefined') return;

    // Desktop: after workspace pane leaves flow, remeasure map shell + Leaflet canvas.
    if (window.matchMedia('(min-width: 769px)').matches) {
      window.dispatchEvent(new Event('resize'));
    }
  }, [isWorkspace]);

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
