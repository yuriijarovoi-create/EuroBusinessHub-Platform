import { useMapViewportStore } from '../store/mapViewportStore';

/**
 * Shared map viewport (zoom, center, padded bounds, mobile).
 * Backed by a single Leaflet subscription in `LeafletMapViewportSync`.
 */
export function useLeafletMapViewport() {
  return useMapViewportStore();
}
