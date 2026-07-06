import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
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
import { getResolvedMapTheme, useMapThemeRevision } from '../../utils/mapThemeUtils';
import { LeafletMapProvider } from '../../context/LeafletMapContext';
import { EuropeGeoJsonLayer } from './EuropeGeoJsonLayer';
import { LeafletRouteLayer } from './LeafletRouteLayer';
import { LeafletCityMarkers } from './LeafletCityMarkers';
import { LeafletCityTooltipLayer } from './LeafletCityHoverTooltip';
import { MapInstanceCapture, LeafletFitEurope, LeafletCountryFocus, LeafletCityFocus } from './LeafletMapBridge';
import { GermanyBundeslandLayer } from './GermanyBundeslandLayer';
import { GermanyCityLabels } from './GermanyCityLabels';
import { LeafletGermanyInfrastructureLayer } from './LeafletGermanyInfrastructureLayer';
import type { BusinessRouteDef, MapCityRecord, MapLayerState } from '../../types/mapTypes';
import styles from './RealEuropeMap.module.css';

interface RealEuropeMapProps {
  routes: BusinessRouteDef[];
  cities: MapCityRecord[];
  cityMap: Map<string, MapCityRecord>;
  layers: MapLayerState;
  selectedCountryCode?: string;
  selectedBundeslandId?: string;
  selectedCityId?: string;
  activeTooltipId?: string | null;
  searchResultCityId?: string;
  countries: MapCountry[];
  onCountrySelect?: (country: MapCountry) => void;
  onBundeslandSelect?: (bundeslandId: string) => void;
  onCitySelect: (city: MapCityRecord) => void;
  onTooltipEnter: (cityId: string) => void;
  onTooltipLeave: () => void;
  onClearTooltip: () => void;
  onMapBackgroundClick: () => void;
  onCountryHover?: (isoCode: string | null) => void;
  children?: React.ReactNode;
}

export const RealEuropeMap = memo(function RealEuropeMap({
  routes,
  cities,
  cityMap,
  layers,
  selectedCountryCode,
  selectedBundeslandId,
  selectedCityId,
  activeTooltipId,
  searchResultCityId,
  countries,
  onCountrySelect,
  onBundeslandSelect,
  onCitySelect,
  onTooltipEnter,
  onTooltipLeave,
  onClearTooltip,
  onMapBackgroundClick,
  onCountryHover,
  children,
}: RealEuropeMapProps) {
  const [leafletMap, setLeafletMap] = useState<LeafletMap | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipEligibleIds, setTooltipEligibleIds] = useState<Set<string>>(() => new Set());
  const [spiderTooltipPositions, setSpiderTooltipPositions] = useState<Map<
    string,
    { lat: number; lng: number }
  > | null>(null);
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

  const handleVisibleIndividualsChange = useCallback((ids: Set<string>) => {
    setTooltipEligibleIds(ids);
  }, []);

  const handleSpiderTooltipPositionsChange = useCallback(
    (positions: Map<string, { lat: number; lng: number }> | null) => {
      setSpiderTooltipPositions(positions);
    },
    [],
  );

  const controls = useMemo(
    () => ({
      map: leafletMap,
      zoomIn: () => leafletMap?.zoomIn(),
      zoomOut: () => leafletMap?.zoomOut(),
      resetView: () =>
        leafletMap?.fitBounds(EUROPE_BOUNDS, { padding: [24, 24], maxZoom: EUROPE_DEFAULT_ZOOM }),
    }),
    [leafletMap],
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
          attributionControl
        >
          <TileLayer key={tileUrl} url={tileUrl} attribution={TILE_ATTRIBUTION} />
          <EuropeGeoJsonLayer
            selectedCountryCode={selectedCountryCode}
            hoveredCountryCode={hoveredCountry ?? undefined}
            onCountrySelect={handleGeoCountry}
            onCountryHover={handleCountryHover}
          />
          {selectedCountryCode === 'DE' && (
            <GermanyBundeslandLayer
              active
              selectedBundeslandId={selectedBundeslandId}
              onSelect={onBundeslandSelect}
            />
          )}
          {layers.routes && <LeafletRouteLayer routes={routes} cityMap={cityMap} />}
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
            activeTooltipId={activeTooltipId}
            searchResultCityId={searchResultCityId}
            onSelect={onCitySelect}
            onTooltipEnter={onTooltipEnter}
            onTooltipLeave={onTooltipLeave}
            onClearTooltip={onClearTooltip}
            onMapBackgroundClick={onMapBackgroundClick}
            onVisibleIndividualsChange={handleVisibleIndividualsChange}
            onSpiderTooltipPositionsChange={handleSpiderTooltipPositionsChange}
          />
          <LeafletCityTooltipLayer
            activeTooltipId={activeTooltipId ?? null}
            cityMap={cityMap}
            layers={layers}
            tooltipEligibleIds={tooltipEligibleIds}
            tooltipPositionOverrides={spiderTooltipPositions ?? undefined}
          />
          {selectedCountryCode === 'DE' && (
            <GermanyCityLabels
              active
              cities={cities}
              selectedCityId={selectedCityId}
              hoveredCityId={activeTooltipId ?? undefined}
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
          <MapInstanceCapture onReady={handleMapReady} />
        </MapContainer>
      ) : (
        <div className={styles.map} aria-hidden />
      )}
    </LeafletMapProvider>
  );
});
