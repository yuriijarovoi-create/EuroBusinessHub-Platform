import type { MapProviderId, MapProviderAdapter } from '@shared/types';
import { svgMapAdapter } from './SvgMapAdapter';
import { leafletMapAdapter } from './LeafletMapAdapter';
import { mapLibreMapAdapter } from './MapLibreMapAdapter';

const adapters: Record<MapProviderId, MapProviderAdapter> = {
  svg: svgMapAdapter,
  leaflet: leafletMapAdapter,
  maplibre: mapLibreMapAdapter,
  mapbox: mapLibreMapAdapter, // Mapbox GL JS compatible with MapLibre API
  openstreetmap: leafletMapAdapter,
  google: leafletMapAdapter, // Future: @googlemaps/js-api-loader
};

export function getMapAdapter(provider: MapProviderId = 'svg'): MapProviderAdapter {
  return adapters[provider];
}

export { svgMapAdapter, leafletMapAdapter, mapLibreMapAdapter };
