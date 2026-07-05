import type { MapProviderAdapter, MapAdapterOptions, MapViewportState } from '@shared/types';

/** Leaflet adapter stub — wire in Phase 4 with leaflet package */
export class LeafletMapAdapter implements MapProviderAdapter {
  id = 'leaflet' as const;

  async initialize(_container: HTMLElement, _options: MapAdapterOptions): Promise<void> {
    // Future: L.map(container, options)
  }

  destroy(): void {}

  setViewport(_viewport: MapViewportState): void {}

  async flyTo(_center: { lat: number; lng: number }, _zoom: number): Promise<void> {}

  on(_event: 'click' | 'move' | 'zoom', _handler: (payload: unknown) => void): void {}
}

export const leafletMapAdapter = new LeafletMapAdapter();
