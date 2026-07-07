import { memo, useEffect, useRef, useState } from 'react';
import { Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import type { MapCityRecord, MapLayerState } from '../../types/mapTypes';
import { getCityDisplayTier } from '../../utils/cityVisibilityUtils';
import { countCityNetworkConnections, computeBusinessScore } from '../../utils/cityNetworkUtils';
import { getCityHubProfile } from '../../data/cityHubEnrichment';
import {
  resolveSmartTooltipDirection,
  tooltipOffsetForDirection,
  type TooltipDirection,
} from '../../utils/mapInfoCardUtils';

const CARD_ANCHOR_ICON = L.divIcon({
  className: 'ebh-tooltip-anchor',
  iconSize: [1, 1],
  iconAnchor: [0, 0],
});

const CARD_TRANSITION_MS = 175;

interface LeafletCityInfoCardProps {
  infoCardCityId: string | null;
  cityMap: Map<string, MapCityRecord>;
  layers: MapLayerState;
  onOpenWorkspace?: (city: MapCityRecord) => void;
}

export const LeafletCityInfoCard = memo(function LeafletCityInfoCard({
  infoCardCityId,
  cityMap,
  layers,
  onOpenWorkspace,
}: LeafletCityInfoCardProps) {
  const { t } = useTranslation('map');
  const map = useMap();
  const [displayId, setDisplayId] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);
  const [entering, setEntering] = useState(false);
  const [direction, setDirection] = useState<TooltipDirection>('top');
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const displayIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (infoCardCityId) {
      const fromHidden = displayIdRef.current === null;
      displayIdRef.current = infoCardCityId;
      setDisplayId(infoCardCityId);
      setExiting(false);
      setEntering(fromHidden);
      return;
    }

    if (displayIdRef.current) {
      setExiting(true);
      hideTimerRef.current = setTimeout(() => {
        displayIdRef.current = null;
        setDisplayId(null);
        setExiting(false);
        hideTimerRef.current = null;
      }, CARD_TRANSITION_MS);
    }
  }, [infoCardCityId]);

  useEffect(() => {
    if (!entering) return;
    if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
    enterTimerRef.current = setTimeout(() => {
      setEntering(false);
      enterTimerRef.current = null;
    }, CARD_TRANSITION_MS);
    return () => {
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
    };
  }, [entering]);

  useEffect(
    () => () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
    },
    [],
  );

  const city = displayId ? cityMap.get(displayId) : undefined;

  useEffect(() => {
    if (!city) return;
    const updateDirection = () => {
      setDirection(resolveSmartTooltipDirection(map, city.lat, city.lng));
    };
    updateDirection();
    map.on('moveend zoomend', updateDirection);
    return () => {
      map.off('moveend zoomend', updateDirection);
    };
  }, [map, city?.lat, city?.lng, city]);

  if (!city) return null;

  const displayTier = getCityDisplayTier(city);
  const businessScore = computeBusinessScore(city.metrics);
  const networkConnections = countCityNetworkConnections(displayId!);
  const hubProfile = getCityHubProfile(displayId!);
  const markerOffset = displayTier >= 5 ? 8 : displayTier >= 3 ? 10 : 14;
  const tooltipClass = [
    'ebh-tooltip',
    'ebh-info-card',
    onOpenWorkspace ? 'ebh-info-card-interactive' : '',
    entering ? 'ebh-tooltip-enter' : '',
    exiting ? 'ebh-tooltip-exit' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Marker
      key={displayId}
      position={[city.lat, city.lng]}
      icon={CARD_ANCHOR_ICON}
      interactive={false}
      zIndexOffset={3000}
    >
      <Tooltip
        permanent
        direction={direction}
        offset={tooltipOffsetForDirection(direction, markerOffset)}
        opacity={0.95}
        className={tooltipClass}
      >
        <strong>{city.name}</strong>
        <br />
        <span className="ebh-tooltip-country">{city.country}</span>
        {hubProfile?.businessCategory && (
          <>
            <br />
            <span className="ebh-tooltip-category">{hubProfile.businessCategory}</span>
          </>
        )}
        {layers.companies && (
          <>
            <br />
            {t('tooltip.companies', { count: city.metrics.companies })}
          </>
        )}
        {layers.routes && city.metrics.transport > 0 && (
          <>
            <br />
            {t('tooltip.transport', { count: city.metrics.transport })}
          </>
        )}
        {layers.warehouses && city.metrics.warehouses > 0 && (
          <>
            <br />
            {t('tooltip.warehouses', { count: city.metrics.warehouses })}
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
          {t('tooltip.businessScore', { score: businessScore })}
        </>
        <>
          <br />
          {t('tooltip.aiScore', { score: city.metrics.aiScore })}
        </>
        {networkConnections > 0 && (
          <>
            <br />
            {t('tooltip.networkConnections', { count: networkConnections })}
          </>
        )}
        {onOpenWorkspace && (
          <>
            <br />
            <button
              type="button"
              className="ebh-info-card-cta"
              onClick={(event) => {
                event.stopPropagation();
                onOpenWorkspace(city);
              }}
            >
              {t('panel.openWorkspace')}
            </button>
          </>
        )}
      </Tooltip>
    </Marker>
  );
});

export function LeafletCityTooltipLayer({
  infoCardCityId,
  cityMap,
  layers,
  onOpenWorkspace,
}: {
  infoCardCityId: string | null;
  cityMap: Map<string, MapCityRecord>;
  layers: MapLayerState;
  onOpenWorkspace?: (city: MapCityRecord) => void;
}) {
  return (
    <LeafletCityInfoCard
      infoCardCityId={infoCardCityId}
      cityMap={cityMap}
      layers={layers}
      onOpenWorkspace={onOpenWorkspace}
    />
  );
}
