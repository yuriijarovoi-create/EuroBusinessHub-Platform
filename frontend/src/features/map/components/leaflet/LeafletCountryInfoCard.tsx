import { memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { MapCountry } from '@shared/types';
import { getCountryBusinessStats } from '../../data/countryStats';
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

interface LeafletCountryInfoCardProps {
  infoCardCountryCode: string | null;
  countries: MapCountry[];
}

export const LeafletCountryInfoCard = memo(function LeafletCountryInfoCard({
  infoCardCountryCode,
  countries,
}: LeafletCountryInfoCardProps) {
  const { t } = useTranslation('map');
  const map = useMap();
  const [displayCode, setDisplayCode] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);
  const [entering, setEntering] = useState(false);
  const [direction, setDirection] = useState<TooltipDirection>('top');
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const displayCodeRef = useRef<string | null>(null);

  const country = displayCode
    ? countries.find((c) => c.code === displayCode)
    : undefined;

  useEffect(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (infoCardCountryCode) {
      const fromHidden = displayCodeRef.current === null;
      displayCodeRef.current = infoCardCountryCode;
      setDisplayCode(infoCardCountryCode);
      setExiting(false);
      setEntering(fromHidden);
      return;
    }

    if (displayCodeRef.current) {
      setExiting(true);
      hideTimerRef.current = setTimeout(() => {
        displayCodeRef.current = null;
        setDisplayCode(null);
        setExiting(false);
        hideTimerRef.current = null;
      }, CARD_TRANSITION_MS);
    }
  }, [infoCardCountryCode]);

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

  useEffect(() => {
    if (!country?.lat || !country?.lng) return;
    const updateDirection = () => {
      setDirection(resolveSmartTooltipDirection(map, country.lat!, country.lng!));
    };
    updateDirection();
    map.on('moveend zoomend', updateDirection);
    return () => {
      map.off('moveend zoomend', updateDirection);
    };
  }, [map, country?.lat, country?.lng, country]);

  if (!country || country.lat == null || country.lng == null) return null;

  const stats = getCountryBusinessStats(country.code);
  const tooltipClass = [
    'ebh-country-leaflet-tooltip',
    'ebh-info-card',
    entering ? 'ebh-tooltip-enter' : '',
    exiting ? 'ebh-tooltip-exit' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Marker
      key={displayCode}
      position={[country.lat, country.lng]}
      icon={CARD_ANCHOR_ICON}
      interactive={false}
      zIndexOffset={2900}
    >
      <Tooltip
        permanent
        direction={direction}
        offset={tooltipOffsetForDirection(direction, 16)}
        opacity={1}
        className={tooltipClass}
      >
        <div className="ebh-country-tooltip-card">
          <div className="ebh-country-tooltip-title">{country.name}</div>
          <div className="ebh-country-tooltip-row">
            <span>{t('tooltips.companies')}</span>
            <strong>{stats.companies.toLocaleString()}</strong>
          </div>
          <div className="ebh-country-tooltip-row">
            <span>{t('tooltips.jobs')}</span>
            <strong>{stats.jobs.toLocaleString()}</strong>
          </div>
          <div className="ebh-country-tooltip-row">
            <span>{t('tooltips.warehouses')}</span>
            <strong>{stats.warehouses}</strong>
          </div>
          <div className="ebh-country-tooltip-row">
            <span>{t('tooltips.transport')}</span>
            <strong>{stats.transport}</strong>
          </div>
          <div className="ebh-country-tooltip-row">
            <span>{t('tooltips.aiScore')}</span>
            <strong className="ebh-country-tooltip-ai">{stats.aiScore}</strong>
          </div>
        </div>
      </Tooltip>
    </Marker>
  );
});
