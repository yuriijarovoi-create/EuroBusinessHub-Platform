import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LeafletMouseEvent } from 'leaflet';
import { isMapAlive } from '../../utils/mapLayerLifecycle';

interface CountryFocusExitBridgeProps {
  active: boolean;
  onExit: () => void;
}

/** True when the click landed on a city, country, route, or map UI — not empty background/ocean. */
function isInteractiveMapTarget(target: Element | null): boolean {
  if (!target) return false;
  return Boolean(
    target.closest(
      [
        '.leaflet-marker-icon',
        '.leaflet-div-icon',
        '.ebh-marker-wrap',
        '.ebh-marker-interactive',
        '.ebh-marker',
        '.ebh-country-interactive',
        'path.ebh-route',
        '.ebh-route',
        '.leaflet-popup',
        '.leaflet-tooltip',
        '.leaflet-control',
      ].join(', '),
    ),
  );
}

function isBackgroundMapClick(e: LeafletMouseEvent): boolean {
  const source = e.propagatedFrom;
  if (source instanceof L.Marker || source instanceof L.Path) return false;
  return !isInteractiveMapTarget(e.originalEvent.target as Element);
}

/**
 * Exits country focus on empty map / ocean click and double-click.
 * Uses Leaflet map events so layer stopPropagation (city/country markers) is respected.
 */
export function CountryFocusExitBridge({ active, onExit }: CountryFocusExitBridgeProps) {
  const map = useMap();

  useEffect(() => {
    if (!active) return;

    const onMapClick = (e: LeafletMouseEvent) => {
      if (!isBackgroundMapClick(e)) return;
      onExit();
    };

    const onDblClick = (e: LeafletMouseEvent) => {
      if (!isBackgroundMapClick(e)) return;
      onExit();
    };

    map.on('click', onMapClick);
    map.on('dblclick', onDblClick);

    return () => {
      if (!isMapAlive(map)) return;
      map.off('click', onMapClick);
      map.off('dblclick', onDblClick);
    };
  }, [map, active, onExit]);

  return null;
}
