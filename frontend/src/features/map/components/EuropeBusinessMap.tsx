import { useCallback, useMemo, useState, useEffect } from 'react';
import { isMobileViewport } from '../utils/cityVisibilityUtils';
import {
  filterCitiesByBusinessLayer,
  filterRoutesByBusinessLayer,
  getMobileBusinessLayerFilter,
  shouldShowMobileLogisticsOverlays,
} from '../utils/mapBusinessLayerFilter';
import type { MapCountry } from '@shared/types';
import type { MapLayerState } from '../types/mapTypes';
import type { MapCityRecord } from '../types/mapTypes';
import {
  getDefaultHubCity,
  getFeaturedMapCities,
  getFeaturedInCountry,
  getMapCityById,
  getAllMapCities,
} from '../data/mapData';
import { CITY_BUNDESLAND_MAP } from '../data/germany/bundeslandData';
import {
  filterRoutesByLayers,
  getRoutesForMapView,
} from '../data/routeData';
import type { BusinessRouteDef } from '../types/mapTypes';
import { RealEuropeMap } from './leaflet/RealEuropeMap';
import { CountryFocusBackButton } from './CountryFocusBackButton';
import { MapControls } from './MapControls';
import { CityInfoPanel } from './CityInfoPanel';
import { GermanyCityInfoPanel } from './GermanyCityInfoPanel';
import { CountryInfoPanel } from './CountryInfoPanel';
import { BundeslandInfoPanel } from './BundeslandInfoPanel';
import { RouteInfoPanel } from './RouteInfoPanel';
import { LayerControlPanel } from './LayerControlPanel';
import { ActivityBottomPanel } from './ActivityBottomPanel';
import { mapSessionStore, useMapSessionStore } from '../store/mapSessionStore';
import type { ActiveMapContext } from '../utils/mapLayerContext';
import { DEFAULT_ACTIVE_MAP_CONTEXT } from '../utils/mapLayerContext';
import styles from './EuropeBusinessMap.module.css';

interface EuropeBusinessMapProps {
  countries: MapCountry[];
  selectedCountryCode?: string;
  hubLabel?: string;
  focusCityId?: string;
  onCountrySelect?: (country: MapCountry) => void;
  onExitCountryFocus?: () => void;
  onOpenWorkspace: (city: MapCityRecord) => void;
  /** Enterprise shell — hide legacy panels; select only, no auto-navigate */
  enterpriseShell?: boolean;
  onCitySelect?: (city: MapCityRecord) => void;
  /** @deprecated use onCitySelect */
  onCityActivate?: (city: MapCityRecord) => void;
  onRouteSelect?: (route: BusinessRouteDef) => void;
  externalLayers?: MapLayerState;
  activeMapContext?: ActiveMapContext;
}

export function EuropeBusinessMap({
  countries,
  selectedCountryCode,
  focusCityId,
  onCountrySelect,
  onExitCountryFocus,
  onOpenWorkspace,
  enterpriseShell = false,
  onCitySelect,
  onCityActivate,
  onRouteSelect: onRouteSelectExternal,
  externalLayers,
  activeMapContext = DEFAULT_ACTIVE_MAP_CONTEXT,
}: EuropeBusinessMapProps) {
  const session = useMapSessionStore();
  const [layers, setLayers] = useState<MapLayerState>(externalLayers ?? session.layers);
  const [layerOpen, setLayerOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [countryPanelOpen, setCountryPanelOpen] = useState(true);
  const [bundeslandPanelOpen, setBundeslandPanelOpen] = useState(false);
  const [hoveredCityId, setHoveredCityId] = useState<string | null>(null);
  const [routePanelOpen, setRoutePanelOpen] = useState(true);

  const infoCardCityId = session.infoCardCityId;
  const infoCardCountryCode = session.infoCardCountryCode;
  const selectedBundeslandId = session.selectedBundeslandId;

  const panelCity = useMemo(() => {
    if (session.selectedCityId) {
      return getMapCityById(session.selectedCityId) ?? null;
    }
    return getDefaultHubCity() ?? null;
  }, [session.selectedCityId]);

  useEffect(() => {
    if (externalLayers) setLayers(externalLayers);
  }, [externalLayers]);

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
      mapSessionStore.patch({ selectedBundeslandId: undefined });
      setBundeslandPanelOpen(false);
    }
  }, [selectedCountryCode]);

  const visibleCities = useMemo(() => {
    let cities = allCountryCities;
    if (selectedCountryCode === 'DE' && selectedBundeslandId) {
      cities = allCountryCities.filter((c) => CITY_BUNDESLAND_MAP[c.id] === selectedBundeslandId);
    }

    const mobileLayer = getMobileBusinessLayerFilter(activeMapContext);
    if (mobileLayer) {
      cities = filterCitiesByBusinessLayer(cities, mobileLayer, session.selectedCityId);
    }

    return cities;
  }, [
    allCountryCities,
    selectedCountryCode,
    selectedBundeslandId,
    activeMapContext,
    session.selectedCityId,
  ]);

  const cityMap = useMemo(
    () => new Map(visibleCities.map((c) => [c.id, c])),
    [visibleCities],
  );

  /** Full city index for route geometry — endpoints may lie outside visible country */
  const routeCityMap = useMemo(
    () => new Map(getAllMapCities().map((c) => [c.id, c])),
    [],
  );

  const routes = useMemo(() => {
    const base = getRoutesForMapView(selectedCountryCode);
    let filtered = filterRoutesByLayers(base, layers);
    const mobileLayer = getMobileBusinessLayerFilter(activeMapContext);
    if (mobileLayer) {
      filtered = filterRoutesByBusinessLayer(filtered, mobileLayer);
    }
    return filtered;
  }, [selectedCountryCode, layers, activeMapContext]);

  const showLogisticsOverlays = useMemo(
    () => shouldShowMobileLogisticsOverlays(activeMapContext),
    [activeMapContext],
  );

  const selectedRoute = useMemo(() => {
    if (!session.selectedRouteId) return null;
    return routes.find((route) => route.id === session.selectedRouteId) ?? null;
  }, [session.selectedRouteId, routes]);

  const clearInfoCard = useCallback(() => {
    mapSessionStore.patch({ infoCardCityId: null, infoCardCountryCode: null });
  }, []);

  const handleExitCountryFocus = useCallback(() => {
    mapSessionStore.patch({
      selectedBundeslandId: undefined,
      infoCardCountryCode: null,
      infoCardCityId: null,
      selectedRouteId: null,
    });
    setBundeslandPanelOpen(false);
    setHoveredCityId(null);
    onExitCountryFocus?.();
  }, [onExitCountryFocus]);

  const handleCityHover = useCallback((cityId: string) => {
    setHoveredCityId(cityId);
  }, []);

  const handleCityHoverLeave = useCallback(() => {
    setHoveredCityId(null);
  }, []);

  const handleMapBackgroundClick = useCallback(() => {
    if (selectedCountryCode && onExitCountryFocus) {
      handleExitCountryFocus();
      return;
    }
    clearInfoCard();
    setHoveredCityId(null);
    mapSessionStore.patch({ selectedRouteId: null });
    if (isMobileViewport()) {
      setPanelOpen(false);
      setRoutePanelOpen(false);
    }
  }, [selectedCountryCode, onExitCountryFocus, handleExitCountryFocus, clearInfoCard]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (selectedCountryCode && onExitCountryFocus) {
        handleExitCountryFocus();
        return;
      }
      clearInfoCard();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedCountryCode, onExitCountryFocus, handleExitCountryFocus, clearInfoCard]);

  const handleCountryPick = useCallback(
    (country: MapCountry) => {
      mapSessionStore.patch({ infoCardCountryCode: country.code, infoCardCityId: null });
      onCountrySelect?.(country);
    },
    [onCountrySelect],
  );

  const handleSelect = useCallback(
    (city: MapCityRecord) => {
      mapSessionStore.patch({
        infoCardCityId: city.id,
        infoCardCountryCode: null,
        selectedCityId: city.id,
        selectedRouteId: null,
      });
      if (enterpriseShell) {
        (onCitySelect ?? onCityActivate)?.(city);
        return;
      }
      setPanelOpen(true);
      setCountryPanelOpen(false);
      setBundeslandPanelOpen(false);
    },
    [enterpriseShell, onCitySelect, onCityActivate],
  );

  const handleRouteSelect = useCallback(
    (route: BusinessRouteDef) => {
      mapSessionStore.patch({ selectedRouteId: route.id });
      if (enterpriseShell && onRouteSelectExternal) {
        onRouteSelectExternal(route);
        return;
      }
      setRoutePanelOpen(true);
      setCountryPanelOpen(false);
      setBundeslandPanelOpen(false);
      setPanelOpen(false);
    },
    [enterpriseShell, onRouteSelectExternal],
  );

  useEffect(() => {
    if (!focusCityId) return;
    const city = getMapCityById(focusCityId);
    if (city) handleSelect(city);
  }, [focusCityId, handleSelect]);

  const handleCountryClose = useCallback(() => {
    setCountryPanelOpen(false);
  }, []);

  const handleBundeslandSelect = useCallback((id: string) => {
    mapSessionStore.patch({ selectedBundeslandId: id });
    setBundeslandPanelOpen(true);
    setCountryPanelOpen(false);
    setPanelOpen(false);
  }, []);

  const handleBundeslandClose = useCallback(() => {
    mapSessionStore.patch({ selectedBundeslandId: undefined });
    setBundeslandPanelOpen(false);
    if (selectedCountryCode) setCountryPanelOpen(true);
  }, [selectedCountryCode]);

  const isGermanyCity = panelCity?.countryCode === 'DE' && !!panelCity.germanyProfile;

  return (
    <div className={styles.stage}>
      {!enterpriseShell && (
        <>
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
        </>
      )}

      <div className={styles.mapShell}>
        {onExitCountryFocus && (
          <CountryFocusBackButton
            active={!!selectedCountryCode}
            onClick={handleExitCountryFocus}
          />
        )}
        <RealEuropeMap
          routes={routes}
          cities={visibleCities}
          cityMap={cityMap}
          routeCityMap={routeCityMap}
          layers={layers}
          selectedCountryCode={selectedCountryCode}
          selectedBundeslandId={selectedBundeslandId}
          selectedCityId={panelCity?.id}
          hoveredCityId={hoveredCityId}
          infoCardCityId={infoCardCityId}
          infoCardCountryCode={infoCardCountryCode}
          searchResultCityId={focusCityId}
          countries={countries}
          onCountrySelect={handleCountryPick}
          onBundeslandSelect={handleBundeslandSelect}
          onCitySelect={handleSelect}
          onCityHover={handleCityHover}
          onCityHoverLeave={handleCityHoverLeave}
          onClearInfoCard={clearInfoCard}
          onMapBackgroundClick={handleMapBackgroundClick}
          onExitCountryFocus={onExitCountryFocus ? handleExitCountryFocus : undefined}
          onRouteSelect={handleRouteSelect}
          selectedRouteId={selectedRoute?.id}
          onOpenWorkspace={onOpenWorkspace}
          activeMapContext={activeMapContext}
          showLogisticsOverlays={showLogisticsOverlays}
        >
          <div className={styles.mapControlsSlot}>
            <MapControls
              countryFocusActive={!!selectedCountryCode}
              onExitCountryFocus={onExitCountryFocus ? handleExitCountryFocus : undefined}
            />
          </div>
        </RealEuropeMap>
      </div>

      {!enterpriseShell && selectedCountry && countryPanelOpen && !selectedBundeslandId && (
        <CountryInfoPanel
          country={selectedCountry}
          open={countryPanelOpen}
          onClose={handleCountryClose}
          onBundeslandSelect={selectedCountry.code === 'DE' ? handleBundeslandSelect : undefined}
          selectedBundeslandId={selectedBundeslandId}
        />
      )}

      {!enterpriseShell && selectedBundeslandId && bundeslandPanelOpen && (
        <BundeslandInfoPanel
          bundeslandId={selectedBundeslandId}
          cities={allCountryCities}
          open={bundeslandPanelOpen}
          onClose={handleBundeslandClose}
        />
      )}

      {!enterpriseShell && (selectedRoute ? (
        <RouteInfoPanel
          route={selectedRoute}
          cityMap={routeCityMap}
          open={routePanelOpen}
          onClose={() => {
            mapSessionStore.patch({ selectedRouteId: null });
            setRoutePanelOpen(true);
            if (selectedBundeslandId) setBundeslandPanelOpen(true);
            else if (selectedCountryCode) setCountryPanelOpen(true);
            else setPanelOpen(true);
          }}
          onToggle={() => setRoutePanelOpen((o) => !o)}
        />
      ) : isGermanyCity && panelCity ? (
        <GermanyCityInfoPanel
          city={panelCity}
          open={panelOpen}
          onClose={() => {
            mapSessionStore.patch({ selectedCityId: getDefaultHubCity()?.id ?? null, infoCardCityId: null });
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
            mapSessionStore.patch({ selectedCityId: getDefaultHubCity()?.id ?? null, infoCardCityId: null });
            setPanelOpen(true);
            if (selectedBundeslandId) setBundeslandPanelOpen(true);
            else if (selectedCountryCode) setCountryPanelOpen(true);
          }}
          onToggle={() => setPanelOpen((o) => !o)}
          onOpenWorkspace={onOpenWorkspace}
        />
      ))}

      {!enterpriseShell && <ActivityBottomPanel />}
    </div>
  );
}
