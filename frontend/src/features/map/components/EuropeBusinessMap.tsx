import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { isMobileViewport } from '../utils/cityVisibilityUtils';
import type { MapCountry } from '@shared/types';
import { DEFAULT_LAYER_STATE, type MapLayerState } from '../types/mapTypes';
import type { MapCityRecord } from '../types/mapTypes';
import {
  getDefaultHubCity,
  getFeaturedMapCities,
  getFeaturedInCountry,
  getMapCityById,
} from '../data/mapData';
import { CITY_BUNDESLAND_MAP } from '../data/germany/bundeslandData';
import {
  filterRoutesByLayers,
  getEuropeRoutes,
  getRoutesForCountry,
} from '../data/routeData';
import { RealEuropeMap } from './leaflet/RealEuropeMap';
import { MapControls } from './MapControls';
import { CityInfoPanel } from './CityInfoPanel';
import { GermanyCityInfoPanel } from './GermanyCityInfoPanel';
import { CountryInfoPanel } from './CountryInfoPanel';
import { BundeslandInfoPanel } from './BundeslandInfoPanel';
import { LayerControlPanel } from './LayerControlPanel';
import { ActivityBottomPanel } from './ActivityBottomPanel';
import styles from './EuropeBusinessMap.module.css';

interface EuropeBusinessMapProps {
  countries: MapCountry[];
  selectedCountryCode?: string;
  hubLabel?: string;
  focusCityId?: string;
  onCountrySelect?: (country: MapCountry) => void;
  onOpenWorkspace: (city: MapCityRecord) => void;
}

export function EuropeBusinessMap({
  countries,
  selectedCountryCode,
  focusCityId,
  onCountrySelect,
  onOpenWorkspace,
}: EuropeBusinessMapProps) {
  const [layers, setLayers] = useState<MapLayerState>(DEFAULT_LAYER_STATE);
  const [layerOpen, setLayerOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [countryPanelOpen, setCountryPanelOpen] = useState(true);
  const [selectedBundeslandId, setSelectedBundeslandId] = useState<string | undefined>();
  const [bundeslandPanelOpen, setBundeslandPanelOpen] = useState(false);
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const tooltipLeaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [panelCity, setPanelCity] = useState<MapCityRecord | null>(
    () => getDefaultHubCity() ?? null,
  );

  const selectedCountry = useMemo(
    () => countries.find((c) => c.code === selectedCountryCode) ?? null,
    [countries, selectedCountryCode],
  );

  const allCountryCities = useMemo(() => {
    if (selectedCountryCode) return getFeaturedInCountry(selectedCountryCode);
    return getFeaturedMapCities();
  }, [selectedCountryCode]);

  useEffect(() => {
    if (selectedCountryCode) setCountryPanelOpen(true);
    if (selectedCountryCode !== 'DE') {
      setSelectedBundeslandId(undefined);
      setBundeslandPanelOpen(false);
    }
  }, [selectedCountryCode]);

  const visibleCities = useMemo(() => {
    if (selectedCountryCode === 'DE' && selectedBundeslandId) {
      return allCountryCities.filter((c) => CITY_BUNDESLAND_MAP[c.id] === selectedBundeslandId);
    }
    return allCountryCities;
  }, [allCountryCities, selectedCountryCode, selectedBundeslandId]);

  const cityMap = useMemo(
    () => new Map(visibleCities.map((c) => [c.id, c])),
    [visibleCities],
  );

  const routes = useMemo(() => {
    const base = selectedCountryCode
      ? getRoutesForCountry(selectedCountryCode, visibleCities)
      : getEuropeRoutes();
    return filterRoutesByLayers(base, layers);
  }, [selectedCountryCode, visibleCities, layers]);

  const clearTooltipLeaveTimer = useCallback(() => {
    if (tooltipLeaveTimerRef.current) {
      clearTimeout(tooltipLeaveTimerRef.current);
      tooltipLeaveTimerRef.current = null;
    }
  }, []);

  const handleTooltipEnter = useCallback(
    (cityId: string) => {
      clearTooltipLeaveTimer();
      setActiveTooltipId(cityId);
    },
    [clearTooltipLeaveTimer],
  );

  const handleTooltipLeave = useCallback(() => {
    clearTooltipLeaveTimer();
    tooltipLeaveTimerRef.current = setTimeout(() => {
      setActiveTooltipId(null);
      tooltipLeaveTimerRef.current = null;
    }, 150);
  }, [clearTooltipLeaveTimer]);

  const clearActiveTooltip = useCallback(() => {
    clearTooltipLeaveTimer();
    setActiveTooltipId(null);
  }, [clearTooltipLeaveTimer]);

  const handleMapBackgroundClick = useCallback(() => {
    clearActiveTooltip();
    if (isMobileViewport()) {
      setPanelOpen(false);
    }
  }, [clearActiveTooltip]);

  useEffect(() => {
    return () => clearTooltipLeaveTimer();
  }, [clearTooltipLeaveTimer]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') clearActiveTooltip();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [clearActiveTooltip]);

  const handleSelect = useCallback((city: MapCityRecord) => {
    setPanelCity(city);
    setPanelOpen(true);
    setCountryPanelOpen(false);
    setBundeslandPanelOpen(false);
  }, []);

  useEffect(() => {
    if (!focusCityId) return;
    const city = getMapCityById(focusCityId);
    if (city) handleSelect(city);
  }, [focusCityId, handleSelect]);

  const handleCountryClose = useCallback(() => {
    setCountryPanelOpen(false);
  }, []);

  const handleBundeslandSelect = useCallback((id: string) => {
    setSelectedBundeslandId(id);
    setBundeslandPanelOpen(true);
    setCountryPanelOpen(false);
    setPanelOpen(false);
  }, []);

  const handleBundeslandClose = useCallback(() => {
    setSelectedBundeslandId(undefined);
    setBundeslandPanelOpen(false);
    if (selectedCountryCode) setCountryPanelOpen(true);
  }, [selectedCountryCode]);

  const isGermanyCity = panelCity?.countryCode === 'DE' && !!panelCity.germanyProfile;

  return (
    <div className={styles.stage}>
      <button
        type="button"
        className={styles.layerFab}
        onClick={() => setLayerOpen((o) => !o)}
        aria-expanded={layerOpen}
        aria-label="Ebenen"
      >
        ☰
      </button>

      <LayerControlPanel
        layers={layers}
        onChange={setLayers}
        open={layerOpen}
        onClose={() => setLayerOpen(false)}
      />

      <div className={styles.mapShell}>
        <RealEuropeMap
          routes={routes}
          cities={visibleCities}
          cityMap={cityMap}
          layers={layers}
          selectedCountryCode={selectedCountryCode}
          selectedBundeslandId={selectedBundeslandId}
          selectedCityId={panelCity?.id}
          activeTooltipId={activeTooltipId}
          searchResultCityId={focusCityId}
          countries={countries}
          onCountrySelect={onCountrySelect}
          onBundeslandSelect={handleBundeslandSelect}
          onCitySelect={handleSelect}
          onTooltipEnter={handleTooltipEnter}
          onTooltipLeave={handleTooltipLeave}
          onClearTooltip={clearActiveTooltip}
          onMapBackgroundClick={handleMapBackgroundClick}
        >
          <div className={styles.mapControlsSlot}>
            <MapControls />
          </div>
        </RealEuropeMap>
      </div>

      {selectedCountry && countryPanelOpen && !selectedBundeslandId && (
        <CountryInfoPanel
          country={selectedCountry}
          open={countryPanelOpen}
          onClose={handleCountryClose}
          onBundeslandSelect={selectedCountry.code === 'DE' ? handleBundeslandSelect : undefined}
          selectedBundeslandId={selectedBundeslandId}
        />
      )}

      {selectedBundeslandId && bundeslandPanelOpen && (
        <BundeslandInfoPanel
          bundeslandId={selectedBundeslandId}
          cities={allCountryCities}
          open={bundeslandPanelOpen}
          onClose={handleBundeslandClose}
        />
      )}

      {isGermanyCity && panelCity ? (
        <GermanyCityInfoPanel
          city={panelCity}
          open={panelOpen}
          onClose={() => {
            setPanelCity(getDefaultHubCity() ?? null);
            setPanelOpen(true);
            if (selectedBundeslandId) setBundeslandPanelOpen(true);
            else if (selectedCountryCode) setCountryPanelOpen(true);
          }}
          onToggle={() => setPanelOpen((o) => !o)}
          onOpenWorkspace={onOpenWorkspace}
        />
      ) : (
        <CityInfoPanel
          city={panelCity}
          open={panelOpen && (!selectedCountryCode || (!countryPanelOpen && !bundeslandPanelOpen))}
          onClose={() => {
            setPanelCity(getDefaultHubCity() ?? null);
            setPanelOpen(true);
            if (selectedBundeslandId) setBundeslandPanelOpen(true);
            else if (selectedCountryCode) setCountryPanelOpen(true);
          }}
          onToggle={() => setPanelOpen((o) => !o)}
          onOpenWorkspace={onOpenWorkspace}
        />
      )}

      <ActivityBottomPanel />
    </div>
  );
}
