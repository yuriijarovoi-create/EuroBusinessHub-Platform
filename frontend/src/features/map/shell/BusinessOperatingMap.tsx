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
import styles from './BusinessOperatingMap.module.css';

export type BusinessOperatingMapMode = 'full' | 'hero' | 'embed';

interface BusinessOperatingMapProps {
  mode?: BusinessOperatingMapMode;
  focusCityId?: string;
  className?: string;
  onOpenWorkspace?: (city: import('../types/mapTypes').MapCityRecord) => void;
}

function BusinessOperatingMapInner({
  mode = 'full',
  focusCityId,
  onOpenWorkspace,
}: BusinessOperatingMapProps) {
  const { t } = useTranslation('map');
  const { state, setLayers, setBusinessFilters, selectCity, selectRoute, selectCountry, loadMapData } = useMapEngine();
  const [leftOpen, setLeftOpen] = useState(mode === 'full');
  const [rightOpen, setRightOpen] = useState(mode === 'full');
  const [flyCityId, setFlyCityId] = useState<string | undefined>(focusCityId);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | undefined>();

  const mapCountries = useMemo(() => countries as MapCountry[], []);

  useEffect(() => {
    loadMapData(selectedCountryCode);
  }, [loadMapData, selectedCountryCode]);

  useEffect(() => {
    if (!focusCityId) return;
    setFlyCityId(focusCityId);
    const city = getMapCityById(focusCityId);
    if (city) setSelectedCountryCode(city.countryCode);
  }, [focusCityId]);

  const handleCountrySelect = useCallback((country: MapCountry) => {
    setSelectedCountryCode(country.code);
    selectCountry(country, null);
  }, [selectCountry]);

  const handleCityActivate = useCallback(
    (city: import('../types/mapTypes').MapCityRecord) => {
      setFlyCityId(city.id);
      selectCity(city, { fly: true, openWorkspace: true });
    },
    [selectCity],
  );

  const handleRouteSelect = useCallback(
    (route: import('../types/mapTypes').BusinessRouteDef) => {
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
        {showNav && <MapNavigationBar />}

        {showSidebars && (
          <MapSidebar
            layers={state.layers}
            businessFilters={state.businessFilters}
            onLayersChange={setLayers}
            onBusinessFiltersChange={setBusinessFilters}
            collapsed={!leftOpen}
            onToggle={() => setLeftOpen((o) => !o)}
          />
        )}

        <div className={`${styles.mapStage} ${!showSidebars ? styles.mapStageFull : ''}`}>
          <EuropeBusinessMap
            countries={mapCountries}
            selectedCountryCode={selectedCountryCode}
            focusCityId={flyCityId}
            onCountrySelect={handleCountrySelect}
            onOpenWorkspace={onOpenWorkspace ?? (() => {})}
            enterpriseShell
            onCityActivate={handleCityActivate}
            onRouteSelect={handleRouteSelect}
            externalLayers={state.layers}
          />
        </div>

        {showSidebars && (
          <StatisticsPanel
            country={state.selectedCountry}
            city={state.selectedCity}
            route={state.selectedRoute}
            stats={state.liveStats}
            collapsed={!rightOpen}
            onToggle={() => setRightOpen((o) => !o)}
          />
        )}

        {showActivity && <EnterpriseActivityPanel />}
      </div>
    </div>
  );
}

export function BusinessOperatingMap({
  mode = 'full',
  focusCityId,
  className = '',
  onOpenWorkspace,
}: BusinessOperatingMapProps) {
  return (
    <MapEngineProvider onOpenWorkspace={onOpenWorkspace}>
      <div className={className}>
        <BusinessOperatingMapInner
          mode={mode}
          focusCityId={focusCityId}
          onOpenWorkspace={onOpenWorkspace}
        />
      </div>
    </MapEngineProvider>
  );
}
