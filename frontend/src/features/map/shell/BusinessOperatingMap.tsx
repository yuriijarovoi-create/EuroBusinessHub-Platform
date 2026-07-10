import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { countries } from '@/data/countries';
import type { MapCountry } from '@shared/types';
import { MapEngineProvider, useMapEngine } from '../engine/MapEngine';
import { getMapCityById } from '../data/mapData';
import { EuropeBusinessMap } from '../components/EuropeBusinessMap';
import { LayerControlPanel } from '../components/LayerControlPanel';
import { MapNavigationBar } from '../components/MapNavigationBar';
import { MapSidebar } from './MapSidebar';
import { StatisticsPanel } from './StatisticsPanel';
import { EnterpriseActivityPanel } from './EnterpriseActivityPanel';
import { MapCommandWheel } from './MapCommandWheel';
import { mapSessionStore, useMapSessionSelector, useMapSessionStore } from '../store/mapSessionStore';
import { clearMapCityFocus, focusMapOnCity } from '../utils/mapCityNavigation';
import { getRoutesForMapView } from '../data/routeData';
import { type ActiveMapContext } from '../utils/mapLayerContext';
import styles from './BusinessOperatingMap.module.css';

export type BusinessOperatingMapMode = 'full' | 'hero' | 'embed';

interface BusinessOperatingMapProps {
  mode?: BusinessOperatingMapMode;
  focusCityId?: string;
  className?: string;
  /** MapEngineProvider is supplied by MapOSLayout */
  useExternalProvider?: boolean;
  onOpenWorkspace?: (city: import('../types/mapTypes').MapCityRecord) => void;
}

export function BusinessOperatingMapInner({
  mode = 'full',
  focusCityId,
  onOpenWorkspace,
}: Omit<BusinessOperatingMapProps, 'useExternalProvider' | 'className'>) {
  const { t } = useTranslation('map');
  const location = useLocation();
  const navigate = useNavigate();
  const session = useMapSessionStore();
  const pendingReturnRestore = useMapSessionSelector((s) => s.pendingReturnRestore);
  const returnRestoreMode = useMapSessionSelector((s) => s.returnRestoreMode);
  const { state, setLayers, selectCity, selectRoute, selectCountry, resetToEurope, loadMapData } =
    useMapEngine();

  const [isCommandPanelOpen, setIsCommandPanelOpen] = useState(true);
  const [layerPanelOpen, setLayerPanelOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(mode === 'full');
  const [activeMapContext, setActiveMapContextState] = useState<ActiveMapContext>(
    () => mapSessionStore.getState().activeMapContext,
  );

  const setActiveMapContext = useCallback((next: ActiveMapContext) => {
    setActiveMapContextState(next);
    mapSessionStore.patch({ activeMapContext: next });
  }, []);
  const selectedCountryCode = session.selectedCountryCode;

  const mapCountries = useMemo(() => countries as MapCountry[], []);

  const selectedCountry = useMemo(
    () => mapCountries.find((c) => c.code === selectedCountryCode) ?? null,
    [mapCountries, selectedCountryCode],
  );

  const sessionFocusCityId = useMapSessionSelector((s) => s.focusCityId);
  const effectiveFocusCityId = focusCityId ?? sessionFocusCityId;
  const isGeographicCityFocus = useMapSessionSelector((s) =>
    Boolean(s.focusCityId ?? s.selectedCityId),
  );
  const homeEuropeRequested = useMapSessionSelector((s) => s.homeFullEuropeOverview);

  useEffect(() => {
    if (isGeographicCityFocus || !homeEuropeRequested) return;
    selectCountry(null, null);
    selectCity(null, { fly: false, openWorkspace: false });
    selectRoute(null);
    resetToEurope(null);
  }, [
    isGeographicCityFocus,
    homeEuropeRequested,
    selectCountry,
    selectCity,
    selectRoute,
    resetToEurope,
  ]);

  useEffect(() => {
    loadMapData(selectedCountryCode);
  }, [loadMapData, selectedCountryCode]);

  useEffect(() => {
    if (!pendingReturnRestore || !returnRestoreMode) return;

    if (returnRestoreMode === 'fallback') {
      selectCountry(null, null);
      selectCity(null, { fly: false, openWorkspace: false });
      selectRoute(null);
      resetToEurope(null);
      return;
    }

    setLayers(session.layers);
    setActiveMapContext(session.activeMapContext);

    const country = session.selectedCountryCode
      ? mapCountries.find((c) => c.code === session.selectedCountryCode) ?? null
      : null;
    selectCountry(country, null);

    const cityId = session.infoCardCityId ?? session.selectedCityId;
    const city = cityId ? getMapCityById(cityId) ?? null : null;
    selectCity(city, { fly: false, openWorkspace: false });

    if (session.selectedRouteId) {
      const route =
        getRoutesForMapView(session.selectedCountryCode).find((r) => r.id === session.selectedRouteId) ?? null;
      selectRoute(route);
    } else {
      selectRoute(null);
    }
  }, [
    pendingReturnRestore,
    returnRestoreMode,
    session.layers,
    session.selectedCountryCode,
    session.infoCardCityId,
    session.selectedCityId,
    session.selectedRouteId,
    session.activeMapContext,
    mapCountries,
    selectCountry,
    selectCity,
    selectRoute,
    setLayers,
    setActiveMapContext,
    resetToEurope,
  ]);

  const handleCountrySelect = useCallback((country: MapCountry) => {
    mapSessionStore.patch({ selectedCountryCode: country.code });
    selectCountry(country, null);
  }, [selectCountry]);

  const exitCountryFocus = useCallback(() => {
    mapSessionStore.patch({
      selectedCountryCode: undefined,
      selectedBundeslandId: undefined,
      selectedCityId: null,
      infoCardCityId: null,
      infoCardCountryCode: null,
      selectedRouteId: null,
      focusCityId: undefined,
    });
    selectCountry(null, null);
    selectCity(null, { fly: false, openWorkspace: false });
    resetToEurope(null);
  }, [selectCountry, selectCity, resetToEurope]);

  const handleCitySelect = useCallback(
    (city: import('../types/mapTypes').MapCityRecord) => {
      selectCity(city, { fly: false, openWorkspace: false });
    },
    [selectCity],
  );

  const handleCitySearchSelect = useCallback(
    (city: import('../types/mapTypes').MapCityRecord) => {
      focusMapOnCity(city, { clearCountryFocus: true, source: 'search' });
      selectCountry(null, null);
      selectCity(city, { fly: false, openWorkspace: false });
      selectRoute(null);
    },
    [selectCity, selectCountry, selectRoute],
  );

  const resetGeographicFocus = useCallback(() => {
    mapSessionStore.patch({
      selectedCountryCode: undefined,
      selectedBundeslandId: undefined,
      homeFullEuropeOverview: true,
    });
    clearMapCityFocus();
    selectCountry(null, null);
    selectCity(null, { fly: false, openWorkspace: false });
    selectRoute(null);
    resetToEurope(null);
  }, [resetToEurope, selectCity, selectCountry, selectRoute]);

  const handleRouteSelect = useCallback(
    (route: import('../types/mapTypes').BusinessRouteDef) => {
      mapSessionStore.patch({ selectedRouteId: route.id });
      selectRoute(route);
    },
    [selectRoute],
  );

  const returnToMainEuropeMapView = useCallback(() => {
    const needsNavigation = location.pathname !== '/map' || session.viewMode === 'workspace';

    mapSessionStore.patch({
      viewMode: 'map',
      workspaceCityId: null,
      returnSnapshot: null,
      pendingReturnRestore: false,
      returnRestoreMode: null,
      selectedCountryCode: undefined,
      selectedBundeslandId: undefined,
      selectedCityId: null,
      infoCardCityId: null,
      infoCardCountryCode: null,
      selectedRouteId: null,
      focusCityId: undefined,
      homeFullEuropeOverview: true,
    });

    selectCountry(null, null);
    selectCity(null, { fly: false, openWorkspace: false });
    selectRoute(null);
    resetToEurope(null);

    if (needsNavigation) {
      navigate('/map', { replace: true });
    }
  }, [
    location.pathname,
    navigate,
    resetToEurope,
    selectCity,
    selectCountry,
    selectRoute,
    session.viewMode,
  ]);

  const showSidebars = mode === 'full';
  const showActivity = mode !== 'hero';
  const showNav = mode !== 'hero';

  return (
    <div
      className={`${styles.operatingRoot} ${mode === 'hero' ? styles.operatingRootHero : ''} ${mode === 'full' ? styles.operatingRootFullscreen : ''}`}
      aria-label={t('title')}
    >
      <div
        className={`${styles.operatingLayout} ${!showSidebars ? styles.operatingLayoutNoSidebars : ''} ${
          isGeographicCityFocus ? styles.geographicCityFocus : ''
        }`}
      >
        {showSidebars && (
          <div className={styles.desktopControlRail} aria-label={t('operating.mapControls', { defaultValue: 'Map controls' })}>
            <div className={styles.layerControlAnchor}>
              <button
                type="button"
                className={styles.layerControlBtn}
                onClick={() => setLayerPanelOpen((open) => !open)}
                aria-expanded={layerPanelOpen}
                aria-label={t('layers.title')}
              >
                ☰
              </button>
              {layerPanelOpen && (
                <div className={styles.layerControlPopover}>
                  <LayerControlPanel
                    layers={state.layers}
                    onChange={setLayers}
                    open
                    onClose={() => setLayerPanelOpen(false)}
                    panelClassName={styles.layerControlPanelDocked}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        <div className={`${styles.mapStage} ${!showSidebars ? styles.mapStageFull : ''}`}>
          <div className={styles.mapCanvasClip}>
            <EuropeBusinessMap
              countries={mapCountries}
              selectedCountryCode={selectedCountryCode}
              focusCityId={effectiveFocusCityId}
              onCountrySelect={handleCountrySelect}
              onExitCountryFocus={exitCountryFocus}
              onOpenWorkspace={onOpenWorkspace ?? (() => {})}
              onCitySelect={handleCitySelect}
              enterpriseShell
              onRouteSelect={handleRouteSelect}
              externalLayers={state.layers}
              activeMapContext={activeMapContext}
            />
          </div>
          <div className={styles.desktopOverlayControls}>
            {showNav && (
              <div className={styles.citySearchControl}>
                <MapNavigationBar
                  layoutClassName={styles.citySearchNav}
                  countryFocusActive={!!selectedCountryCode}
                  selectedCountry={selectedCountry}
                  onExitCountryFocus={exitCountryFocus}
                  selectedCityId={session.selectedCityId}
                  activeMapContext={activeMapContext}
                  onCitySearchSelect={handleCitySearchSelect}
                  onResetGeographicFocus={resetGeographicFocus}
                />
              </div>
            )}
            {showSidebars && (
              <>
                <MapSidebar
                  panelId="command-panel"
                  activeMapContext={activeMapContext}
                  onActiveMapContextChange={setActiveMapContext}
                  panelClassName={
                    isCommandPanelOpen ? styles.commandPanelOpen : styles.commandPanelClosed
                  }
                />
                <button
                  type="button"
                  className={`${styles.commandPanelToggle} ${
                    isCommandPanelOpen ? styles.commandPanelToggleOpen : styles.commandPanelToggleClosed
                  }`}
                  onClick={() => setIsCommandPanelOpen((open) => !open)}
                  aria-controls="command-panel"
                  aria-expanded={isCommandPanelOpen}
                  aria-label={
                    isCommandPanelOpen ? 'Hide command panel' : 'Show command panel'
                  }
                >
                  <svg
                    className={styles.commandPanelToggleIcon}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden
                  >
                    {isCommandPanelOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19 8 12l7-7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
                    )}
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {showSidebars && (
          <StatisticsPanel
            country={state.selectedCountry}
            city={state.selectedCity}
            route={state.selectedRoute}
            stats={state.liveStats}
            activeMapContext={activeMapContext}
            collapsed={!rightOpen}
            onToggle={() => setRightOpen((o) => !o)}
          />
        )}

        {showActivity && (
          <>
            <MapCommandWheel
              activeMapContext={activeMapContext}
              onActiveMapContextChange={setActiveMapContext}
              onReturnToMainMap={returnToMainEuropeMapView}
            />
            <EnterpriseActivityPanel activeMapContext={activeMapContext} />
          </>
        )}
      </div>
    </div>
  );
}

export function BusinessOperatingMap({
  mode = 'full',
  focusCityId,
  className = '',
  useExternalProvider = false,
  onOpenWorkspace,
}: BusinessOperatingMapProps) {
  const inner = (
    <div className={className}>
      <BusinessOperatingMapInner
        mode={mode}
        focusCityId={focusCityId}
        onOpenWorkspace={onOpenWorkspace}
      />
    </div>
  );

  if (useExternalProvider) {
    return inner;
  }

  return <MapEngineProvider onOpenWorkspace={onOpenWorkspace}>{inner}</MapEngineProvider>;
}
