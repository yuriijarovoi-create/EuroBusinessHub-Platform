import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { countries } from '@/data/countries';
import type { MapCountry } from '@shared/types';
import { MapEngineProvider, useMapEngine } from '../engine/MapEngine';
import { getMapCityById } from '../data/mapData';
import { EuropeBusinessMap } from '../components/EuropeBusinessMap';
import { MapNavigationBar } from '../components/MapNavigationBar';
import { MapSidebar } from './MapSidebar';
import { StatisticsPanel } from './StatisticsPanel';
import { EnterpriseActivityPanel } from './EnterpriseActivityPanel';
import { MapCommandWheel } from './MapCommandWheel';
import { mapSessionStore, useMapSessionSelector, useMapSessionStore } from '../store/mapSessionStore';
import { getRoutesForMapView } from '../data/routeData';
import { DEFAULT_ACTIVE_MAP_CONTEXT, type ActiveMapContext } from '../utils/mapLayerContext';
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
  const session = useMapSessionStore();
  const pendingReturnRestore = useMapSessionSelector((s) => s.pendingReturnRestore);
  const returnRestoreMode = useMapSessionSelector((s) => s.returnRestoreMode);
  const { state, setLayers, selectCity, selectRoute, selectCountry, resetToEurope, loadMapData } =
    useMapEngine();

  const [leftOpen, setLeftOpen] = useState(mode === 'full');
  const [rightOpen, setRightOpen] = useState(mode === 'full');
  const [activeMapContext, setActiveMapContext] = useState<ActiveMapContext>(DEFAULT_ACTIVE_MAP_CONTEXT);
  const selectedCountryCode = session.selectedCountryCode;

  const mapCountries = useMemo(() => countries as MapCountry[], []);

  const selectedCountry = useMemo(
    () => mapCountries.find((c) => c.code === selectedCountryCode) ?? null,
    [mapCountries, selectedCountryCode],
  );

  useEffect(() => {
    if (focusCityId) {
      mapSessionStore.patch({ focusCityId });
      const city = getMapCityById(focusCityId);
      if (city) {
        mapSessionStore.patch({
          selectedCountryCode: city.countryCode,
          selectedCityId: focusCityId,
          infoCardCityId: focusCityId,
        });
      }
    }
  }, [focusCityId]);

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
    mapCountries,
    selectCountry,
    selectCity,
    selectRoute,
    setLayers,
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

  const handleRouteSelect = useCallback(
    (route: import('../types/mapTypes').BusinessRouteDef) => {
      mapSessionStore.patch({ selectedRouteId: route.id });
      selectRoute(route);
    },
    [selectRoute],
  );

  const showSidebars = mode === 'full';
  const showActivity = mode !== 'hero';
  const showNav = mode !== 'hero';

  return (
    <div
      className={`${styles.operatingRoot} ${mode === 'hero' ? styles.operatingRootHero : ''} ${mode === 'full' ? styles.operatingRootFullscreen : ''}`}
      aria-label={t('title')}
    >
      <div className={`${styles.operatingLayout} ${!showSidebars ? styles.operatingLayoutNoSidebars : ''}`}>
        {showNav && (
          <MapNavigationBar
            countryFocusActive={!!selectedCountryCode}
            selectedCountry={selectedCountry}
            onExitCountryFocus={exitCountryFocus}
          />
        )}

        {showSidebars && (
          <MapSidebar
            activeMapContext={activeMapContext}
            onActiveMapContextChange={setActiveMapContext}
            collapsed={!leftOpen}
            onToggle={() => setLeftOpen((o) => !o)}
          />
        )}

        <div className={`${styles.mapStage} ${!showSidebars ? styles.mapStageFull : ''}`}>
          <EuropeBusinessMap
            countries={mapCountries}
            selectedCountryCode={selectedCountryCode}
            focusCityId={focusCityId}
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
