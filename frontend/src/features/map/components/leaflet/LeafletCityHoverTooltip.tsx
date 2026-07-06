import { memo, useEffect, useRef, useState } from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import type { MapCityRecord, MapLayerState } from '../../types/mapTypes';
import { getCityDisplayTier } from '../../utils/cityVisibilityUtils';
import { useLeafletMapViewport } from '../../hooks/useLeafletMapViewport';
import { countCityNetworkConnections, computeBusinessScore } from '../../utils/cityNetworkUtils';
import { getCityHubProfile } from '../../data/cityHubEnrichment';

const TOOLTIP_ANCHOR_ICON = L.divIcon({
  className: 'ebh-tooltip-anchor',
  iconSize: [1, 1],
  iconAnchor: [0, 0],
});

interface LeafletCityHoverTooltipProps {
  activeTooltipId: string | null;
  cityMap: Map<string, MapCityRecord>;
  layers: MapLayerState;
  isMobile: boolean;
  tooltipEligibleIds?: ReadonlySet<string>;
  tooltipPositionOverrides?: ReadonlyMap<string, { lat: number; lng: number }>;
}

export const LeafletCityHoverTooltip = memo(function LeafletCityHoverTooltip({
  activeTooltipId,
  cityMap,
  layers,
  isMobile,
  tooltipEligibleIds,
  tooltipPositionOverrides,
}: LeafletCityHoverTooltipProps) {
  const { t } = useTranslation('map');
  const [displayId, setDisplayId] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);
  const [entering, setEntering] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const displayIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (activeTooltipId) {
      const eligible =
        !tooltipEligibleIds ||
        tooltipEligibleIds.size === 0 ||
        tooltipEligibleIds.has(activeTooltipId);
      if (!eligible) {
        if (displayIdRef.current) {
          setExiting(true);
          hideTimerRef.current = setTimeout(() => {
            displayIdRef.current = null;
            setDisplayId(null);
            setExiting(false);
            hideTimerRef.current = null;
          }, 150);
        }
        return;
      }

      const fromHidden = displayIdRef.current === null;
      displayIdRef.current = activeTooltipId;
      setDisplayId(activeTooltipId);
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
      }, 150);
    }
  }, [activeTooltipId, tooltipEligibleIds]);

  useEffect(() => {
    if (!entering) return;
    if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
    enterTimerRef.current = setTimeout(() => {
      setEntering(false);
      enterTimerRef.current = null;
    }, 150);
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
  if (!city || isMobile) return null;
  if (tooltipEligibleIds && tooltipEligibleIds.size > 0 && !tooltipEligibleIds.has(displayId!)) {
    return null;
  }

  const displayTier = getCityDisplayTier(city);
  const override = displayId ? tooltipPositionOverrides?.get(displayId) : undefined;
  const businessScore = computeBusinessScore(city.metrics);
  const networkConnections = countCityNetworkConnections(displayId!);
  const hubProfile = getCityHubProfile(displayId!);
  const tooltipClass = [
    'ebh-tooltip',
    entering ? 'ebh-tooltip-enter' : '',
    exiting ? 'ebh-tooltip-exit' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Marker
      key={displayId}
      position={[override?.lat ?? city.lat, override?.lng ?? city.lng]}
      icon={TOOLTIP_ANCHOR_ICON}
      interactive={false}
      zIndexOffset={3000}
    >
      <Tooltip
        permanent
        sticky
        direction="top"
        offset={[0, displayTier >= 5 ? -8 : displayTier >= 3 ? -10 : -14]}
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
      </Tooltip>
    </Marker>
  );
});

export function LeafletCityTooltipLayer({
  activeTooltipId,
  cityMap,
  layers,
  tooltipEligibleIds,
  tooltipPositionOverrides,
}: {
  activeTooltipId: string | null;
  cityMap: Map<string, MapCityRecord>;
  layers: MapLayerState;
  tooltipEligibleIds?: ReadonlySet<string>;
  tooltipPositionOverrides?: ReadonlyMap<string, { lat: number; lng: number }>;
}) {
  const { isMobile } = useLeafletMapViewport();
  return (
    <LeafletCityHoverTooltip
      activeTooltipId={activeTooltipId}
      cityMap={cityMap}
      layers={layers}
      isMobile={isMobile}
      tooltipEligibleIds={tooltipEligibleIds}
      tooltipPositionOverrides={tooltipPositionOverrides}
    />
  );
}
