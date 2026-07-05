import { memo, useEffect, useMemo } from 'react';
import { Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import type { MapCityRecord, MapLayerState } from '../../types/mapTypes';
import { DEFAULT_HUB_ID } from '../../data/mapData';

interface LeafletCityMarkersProps {
  cities: MapCityRecord[];
  selectedCityId?: string;
  hoveredCityId?: string;
  layers: MapLayerState;
  onSelect: (city: MapCityRecord) => void;
  onHover: (city: MapCityRecord | null) => void;
}

function getTier(city: MapCityRecord): 1 | 2 | 3 {
  return city.mapTier ?? (city.isMajorHub ? 1 : 3);
}

function createCityIcon(city: MapCityRecord, isSelected: boolean, isHub: boolean) {
  const tier = getTier(city);
  const size = isHub ? 32 : tier === 1 ? 28 : tier === 2 ? 22 : 16;
  const anchor = size / 2;

  const cls = [
    'ebh-marker',
    isHub ? 'ebh-marker-hub' : '',
    tier === 1 ? 'ebh-marker-tier1' : '',
    tier === 2 ? 'ebh-marker-tier2' : '',
    tier === 3 ? 'ebh-marker-tier3' : '',
    isSelected ? 'ebh-marker-selected' : '',
    tier === 3 && !isHub ? 'ebh-marker-small' : '',
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
  layers,
  onSelect,
  onHover,
}: LeafletCityMarkersProps) {
  const { t } = useTranslation('map');
  const map = useMap();

  useEffect(() => {
    const handler = () => onHover(null);
    map.on('click', handler);
    return () => {
      map.off('click', handler);
    };
  }, [map, onHover]);

  const markers = useMemo(
    () =>
      cities.map((city) => {
        const isHub = city.id === DEFAULT_HUB_ID;
        const isSelected = city.id === selectedCityId || city.id === hoveredCityId;
        const tier = getTier(city);
        const icon = createCityIcon(city, isSelected, isHub);

        return (
          <Marker
            key={city.id}
            position={[city.lat, city.lng]}
            icon={icon}
            zIndexOffset={
              isHub ? 1000 : isSelected ? 500 : tier === 1 ? 250 : tier === 2 ? 120 : 0
            }
            eventHandlers={{
              click: (e) => {
                L.DomEvent.stopPropagation(e);
                onSelect(city);
              },
              mouseover: () => onHover(city),
              mouseout: () => onHover(null),
            }}
          >
            <Tooltip
              direction="top"
              offset={[0, tier === 3 ? -10 : -14]}
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
    [cities, selectedCityId, hoveredCityId, layers, onSelect, onHover, t],
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
