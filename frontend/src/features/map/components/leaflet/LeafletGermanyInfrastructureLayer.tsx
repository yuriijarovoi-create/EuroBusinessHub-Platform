import { memo, useEffect, useMemo, useState } from 'react';
import { Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import type { MapCityRecord, MapLayerState } from '../../types/mapTypes';
import type { GermanyInfrastructureHub } from '../../types/germanyTypes';
import { getVisibleInfrastructureHubs } from '../../data/germany/germanyInfrastructureUtils';
import { getMapCityById } from '../../data/mapData';

interface LeafletGermanyInfrastructureLayerProps {
  active: boolean;
  layers: MapLayerState;
  onCitySelect: (city: MapCityRecord) => void;
}

const TYPE_CLASS: Record<GermanyInfrastructureHub['type'], string> = {
  seaport: 'ebh-infra-seaport',
  inland_port: 'ebh-infra-inland',
  air_cargo: 'ebh-infra-air',
  industrial_zone: 'ebh-infra-industrial',
};

function createInfraIcon(hub: GermanyInfrastructureHub) {
  const size = hub.importanceScore >= 90 ? 18 : hub.importanceScore >= 80 ? 16 : 14;
  const anchor = size / 2;
  return L.divIcon({
    className: 'ebh-infra-wrap',
    html: `<div class="ebh-infra ${TYPE_CLASS[hub.type]}"><span class="ebh-infra-core"></span></div>`,
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
  });
}

export const LeafletGermanyInfrastructureLayer = memo(function LeafletGermanyInfrastructureLayer({
  active,
  layers,
  onCitySelect,
}: LeafletGermanyInfrastructureLayerProps) {
  const { t } = useTranslation('map');
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());

  useEffect(() => {
    const sync = () => setZoom(map.getZoom());
    map.on('zoomend', sync);
    return () => {
      map.off('zoomend', sync);
    };
  }, [map]);

  const hubs = useMemo(() => {
    if (!active) return [];
    return getVisibleInfrastructureHubs(layers, zoom);
  }, [active, layers, zoom]);

  if (!active || hubs.length === 0) return null;

  return (
    <>
      {hubs.map((hub) => {
        const icon = createInfraIcon(hub);
        return (
          <Marker
            key={hub.id}
            position={[hub.lat, hub.lng]}
            icon={icon}
            zIndexOffset={40 + Math.round(hub.importanceScore / 10)}
            eventHandlers={{
              click: (e) => {
                L.DomEvent.stopPropagation(e);
                const city = getMapCityById(hub.cityId);
                if (city) onCitySelect(city);
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.95} className="ebh-tooltip" sticky>
              <strong>{hub.name}</strong>
              <br />
              {t(`germany.infrastructure.types.${hub.type}`)}
              <br />
              {t('germany.infrastructure.importance', { score: hub.importanceScore })}
              <br />
              {t('panel.transportOffers')}: {hub.transportOffers}
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
});
