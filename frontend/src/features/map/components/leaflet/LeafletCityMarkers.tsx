import { memo, useEffect, useMemo } from 'react';
import { Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import type { MapCityRecord, MapLayerState } from '../../types/mapTypes';
import { DEFAULT_HUB_ID } from '../../data/mapData';
import { useLeafletMapViewport } from '../../hooks/useLeafletMapViewport';
import {
  getCityDisplayTier,
  getVisibleCityNodes,
  type CityDisplayTier,
} from '../../utils/cityVisibilityUtils';

interface LeafletCityMarkersProps {
  cities: MapCityRecord[];
  selectedCityId?: string;
  hoveredCityId?: string;
  searchResultCityId?: string;
  layers: MapLayerState;
  onSelect: (city: MapCityRecord) => void;
  onHover: (city: MapCityRecord | null) => void;
}

function createCityIcon(
  city: MapCityRecord,
  isSelected: boolean,
  isHub: boolean,
  displayTier: CityDisplayTier,
) {
  const size = isHub ? 32 : displayTier === 1 ? 28 : displayTier === 2 ? 22 : displayTier === 3 ? 16 : 14;
  const anchor = size / 2;

  const cls = [
    'ebh-marker',
    isHub ? 'ebh-marker-hub' : '',
    displayTier === 1 ? 'ebh-marker-tier1' : '',
    displayTier === 2 ? 'ebh-marker-tier2' : '',
    displayTier === 3 ? 'ebh-marker-tier3' : '',
    displayTier === 4 ? 'ebh-marker-tier4' : '',
    isSelected ? 'ebh-marker-selected' : '',
    displayTier >= 3 && !isHub ? 'ebh-marker-small' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return L.divIcon({
    className: 'ebh-marker-wrap',
    html: `<div class="${cls}"><span class="ebh-marker-core"></span><span class="ebh-marker-pulse"></span></div>`,
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
  });
}

export const LeafletCityMarkers = memo(function LeafletCityMarkers({
  cities,
  selectedCityId,
  hoveredCityId,
  searchResultCityId,
  layers,
  onSelect,
  onHover,
}: LeafletCityMarkersProps) {
  const { t } = useTranslation('map');
  const map = useMap();
  const { zoom, isMobile } = useLeafletMapViewport();

  useEffect(() => {
    const handler = () => onHover(null);
    map.on('click', handler);
    return () => {
      map.off('click', handler);
    };
  }, [map, onHover]);

  const visibleCities = useMemo(
    () => getVisibleCityNodes(cities, zoom, selectedCityId, hoveredCityId, searchResultCityId, isMobile),
    [cities, zoom, selectedCityId, hoveredCityId, searchResultCityId, isMobile],
  );

  const markers = useMemo(
    () =>
      visibleCities.map((city) => {
        const isHub = city.id === DEFAULT_HUB_ID;
        const isSelected = city.id === selectedCityId || city.id === hoveredCityId;
        const displayTier = getCityDisplayTier(city);
        const icon = createCityIcon(city, isSelected, isHub, displayTier);

        return (
          <Marker
            key={city.id}
            position={[city.lat, city.lng]}
            icon={icon}
            zIndexOffset={
              isHub ? 1000 : isSelected ? 500 : displayTier === 1 ? 250 : displayTier === 2 ? 120 : 0
            }
            eventHandlers={{
              click: (e) => {
                L.DomEvent.stopPropagation(e);
                onHover(city);
                onSelect(city);
              },
              mouseover: () => onHover(city),
              mouseout: () => onHover(null),
            }}
          >
            <Tooltip
              direction="top"
              offset={[0, displayTier >= 3 ? -10 : -14]}
              opacity={0.95}
              className="ebh-tooltip"
              sticky
            >
              <strong>{city.name}</strong>
              <br />
              {city.germanyProfile?.mainIndustry ?? city.country}
              {layers.companies && (
                <>
                  <br />
                  {t('tooltip.companies', { count: city.metrics.companies })}
                </>
              )}
              {layers.jobs && (
                <>
                  <br />
                  {t('tooltip.jobs', { count: city.metrics.jobs })}
                </>
              )}
              <>
                <br />
                {t('tooltip.aiScore', { score: city.metrics.aiScore })}
              </>
            </Tooltip>
          </Marker>
        );
      }),
    [visibleCities, selectedCityId, hoveredCityId, layers, onSelect, onHover, t],
  );

  return <>{markers}</>;
});

/** Fly to hub on first load */
export function LeafletHubFocus({ cityId }: { cityId?: string }) {
  const map = useMap();
  useEffect(() => {
    if (cityId === DEFAULT_HUB_ID) {
      map.setView([52.52, 13.405], 5, { animate: false });
    }
  }, [map, cityId]);
  return null;
}

export { HUB } from '../../data/europeGeo';
