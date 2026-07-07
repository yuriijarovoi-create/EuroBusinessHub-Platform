import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, AttributionControl } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapCountry } from '@shared/types';
import {
  getTileUrlForTheme,
  TILE_ATTRIBUTION,
  EUROPE_CENTER,
  EUROPE_DEFAULT_ZOOM,
  EUROPE_MIN_ZOOM,
  EUROPE_MAX_ZOOM,
  EUROPE_BOUNDS,
  MAP_ZOOM_SNAP,
  MAP_ZOOM_DELTA,
  MAP_WHEEL_PX_PER_ZOOM,
} from '../../config/leafletConfig';
import { flyToFullEuropeOverview } from '../../utils/mapCameraSnapshot';
import { mapSessionStore } from '../../store/mapSessionStore';
import { getResolvedMapTheme, useMapThemeRevision } from '../../utils/mapThemeUtils';
import { LeafletMapProvider } from '../../context/LeafletMapContext';
import { CountryLayer } from './CountryLayer';
import { LeafletRouteLayer } from './LeafletRouteLayer';
import { LeafletPortLayer } from './LeafletPortLayer';
import { LeafletAirportLayer } from './LeafletAirportLayer';
import { LeafletHubHaloLayer } from './LeafletHubHaloLayer';
import { LeafletCityMarkers } from './LeafletCityMarkers';
import { LeafletCityTooltipLayer } from './LeafletCityHoverTooltip';
import { LeafletCountryInfoCard } from './LeafletCountryInfoCard';
import {
  MapInstanceCapture,
  LeafletFitEurope,
  LeafletCountryFocus,
  LeafletCityFocus,
  MapDestroyCleanup,
  MapCameraSync,
  LeafletWorkspaceReturnRestore,
} from './LeafletMapBridge';
import { CountryFocusExitBridge } from './CountryFocusExitBridge';
import { GermanyBundeslandLayer } from './GermanyBundeslandLayer';
import { GermanyCityLabels } from './GermanyCityLabels';
import { LeafletGermanyInfrastructureLayer } from './LeafletGermanyInfrastructureLayer';
import type { BusinessRouteDef, MapCityRecord, MapLayerState } from '../../types/mapTypes';
import styles from './RealEuropeMap.module.css';

interface RealEuropeMapProps {
  routes: BusinessRouteDef[];
  cities: MapCityRecord[];
  cityMap: Map<string, MapCityRecord>;
  /** All map cities — used for route endpoint coordinates only */
  routeCityMap: Map<string, MapCityRecord>;
  layers: MapLayerState;
  selectedCountryCode?: string;
  selectedBundeslandId?: string;
  selectedCityId?: string;
  hoveredCityId?: string | null;
  infoCardCityId?: string | null;
  infoCardCountryCode?: string | null;
  searchResultCityId?: string;
  countries: MapCountry[];
  onCountrySelect?: (country: MapCountry) => void;
  onBundeslandSelect?: (bundeslandId: string) => void;
  onCitySelect: (city: MapCityRecord) => void;
  onCityHover: (cityId: string) => void;
  onCityHoverLeave: () => void;
  onClearInfoCard: () => void;
  onMapBackgroundClick: () => void;
  onExitCountryFocus?: () => void;
  onCountryHover?: (isoCode: string | null) => void;
  onRouteSelect?: (route: BusinessRouteDef) => void;
  selectedRouteId?: string;
  onOpenWorkspace?: (city: MapCityRecord) => void;
  children?: React.ReactNode;
}

export const RealEuropeMap = memo(function RealEuropeMap({
  routes,
  cities,
  cityMap,
  routeCityMap,
  layers,
  selectedCountryCode,
  selectedBundeslandId,
  selectedCityId,
  hoveredCityId,
  infoCardCityId,
  infoCardCountryCode,
  searchResultCityId,
  countries,
  onCountrySelect,
  onBundeslandSelect,
  onCitySelect,
  onCityHover,
  onCityHoverLeave,
  onClearInfoCard,
  onMapBackgroundClick,
  onExitCountryFocus,
  onCountryHover,
  onRouteSelect,
  selectedRouteId,
  onOpenWorkspace,
  children,
}: RealEuropeMapProps) {
  const [leafletMap, setLeafletMap] = useState<LeafletMap | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const themeRev = useMapThemeRevision();
  const tileUrl = useMemo(
    () => getTileUrlForTheme(getResolvedMapTheme()),
    [themeRev],
  );

  useEffect(() => {
    setMapReady(true);
    return () => setMapReady(false);
  }, []);

  const countryByCode = useMemo(
    () => new Map(countries.map((c) => [c.code, c])),
    [countries],
  );

  const handleGeoCountry = useCallback(
    (iso: string) => {
      const country = countryByCode.get(iso);
      if (country) onCountrySelect?.(country);
    },
    [countryByCode, onCountrySelect],
  );

  const handleCountryHover = useCallback(
    (iso: string | null) => {
      setHoveredCountry(iso);
      onCountryHover?.(iso);
    },
    [onCountryHover],
  );

  const handleMapReady = useCallback((map: LeafletMap) => {
    setLeafletMap(map);
  }, []);

  const returnToEuropeOverview = useCallback(() => {
    if (leafletMap) {
      leafletMap.stop();
    }
    mapSessionStore.requestHomeFullEuropeOverview();
    if (onExitCountryFocus) {
      onExitCountryFocus();
      return;
    }
    if (leafletMap && mapSessionStore.consumeHomeFullEuropeOverview()) {
      flyToFullEuropeOverview(leafletMap);
    }
  }, [leafletMap, onExitCountryFocus]);

  const controls = useMemo(
    () => ({
      map: leafletMap,
      zoomIn: () => leafletMap?.zoomIn(),
      zoomOut: () => leafletMap?.zoomOut(),
      resetView: returnToEuropeOverview,
    }),
    [leafletMap, returnToEuropeOverview],
  );

  return (
    <LeafletMapProvider value={controls}>
      {children}
      {mapReady ? (
        <MapContainer
          key="europe-leaflet-map"
          className={styles.map}
          center={EUROPE_CENTER}
          zoom={EUROPE_DEFAULT_ZOOM}
          minZoom={EUROPE_MIN_ZOOM}
          maxZoom={EUROPE_MAX_ZOOM}
          zoomSnap={MAP_ZOOM_SNAP}
          zoomDelta={MAP_ZOOM_DELTA}
          wheelPxPerZoomLevel={MAP_WHEEL_PX_PER_ZOOM}
          maxBounds={EUROPE_BOUNDS}
          maxBoundsViscosity={0.85}
          scrollWheelZoom
          zoomControl={false}
          attributionControl={false}
        >
          <AttributionControl position="bottomright" prefix={false} />
          <TileLayer key={tileUrl} url={tileUrl} attribution={TILE_ATTRIBUTION} />
          <CountryLayer
            countries={countries}
            selectedCountryCode={selectedCountryCode}
            hoveredCountryCode={hoveredCountry ?? undefined}
            onCountrySelect={handleGeoCountry}
            onCountryHover={handleCountryHover}
            onExitCountryFocus={selectedCountryCode ? onExitCountryFocus : undefined}
          />
          {selectedCountryCode === 'DE' && (
            <GermanyBundeslandLayer
              active
              selectedBundeslandId={selectedBundeslandId}
              onSelect={onBundeslandSelect}
            />
          )}
          {layers.routes && (
            <>
              <LeafletHubHaloLayer
                cityMap={routeCityMap}
                hoveredCityId={hoveredCityId}
                selectedCityId={selectedCityId}
                selectedCountryCode={selectedCountryCode}
                searchResultCityId={searchResultCityId}
              />
              <LeafletRouteLayer
                routes={routes}
                cityMap={routeCityMap}
                selectedCountryCode={selectedCountryCode}
                selectedCityId={selectedCityId}
                hoveredCityId={hoveredCityId ?? undefined}
                hoveredCountryCode={hoveredCountry ?? undefined}
                selectedRouteId={selectedRouteId}
                onRouteSelect={onRouteSelect}
              />
              <LeafletPortLayer cityMap={routeCityMap} />
              <LeafletAirportLayer cityMap={routeCityMap} />
            </>
          )}
          {selectedCountryCode === 'DE' && (
            <LeafletGermanyInfrastructureLayer
              active
              layers={layers}
              onCitySelect={onCitySelect}
            />
          )}
          <LeafletCityMarkers
            cities={cities}
            selectedCityId={selectedCityId}
            hoveredCityId={hoveredCityId}
            searchResultCityId={searchResultCityId}
            onSelect={onCitySelect}
            onCityHover={onCityHover}
            onCityHoverLeave={onCityHoverLeave}
            onClearInfoCard={onClearInfoCard}
            onMapBackgroundClick={onMapBackgroundClick}
            countryFocusActive={!!selectedCountryCode}
            selectedCountryCode={selectedCountryCode}
          />
          <LeafletCityTooltipLayer
            infoCardCityId={infoCardCityId ?? null}
            cityMap={cityMap}
            layers={layers}
            onOpenWorkspace={onOpenWorkspace}
          />
          <LeafletCountryInfoCard
            infoCardCountryCode={infoCardCountryCode ?? null}
            countries={countries}
          />
          {selectedCountryCode === 'DE' && (
            <GermanyCityLabels
              active
              cities={cities}
              selectedCityId={selectedCityId}
              hoveredCityId={hoveredCityId ?? undefined}
              searchResultCityId={searchResultCityId}
            />
          )}
          <LeafletCityFocus cityId={searchResultCityId} cityMap={cityMap} countryCode={selectedCountryCode} />
          <LeafletFitEurope active={!selectedCountryCode} />
          <LeafletCountryFocus
            countryCode={selectedCountryCode}
            bundeslandId={selectedBundeslandId}
            cities={cities}
          />
          {onExitCountryFocus && (
            <CountryFocusExitBridge
              active={!!selectedCountryCode}
              onExit={onExitCountryFocus}
            />
          )}
          <MapInstanceCapture onReady={handleMapReady} />
          <MapCameraSync />
          <LeafletWorkspaceReturnRestore />
          <MapDestroyCleanup />
        </MapContainer>
      ) : (
        <div className={styles.map} aria-hidden />
      )}
    </LeafletMapProvider>
  );
});
