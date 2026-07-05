import type { MapProviderAdapter, MapAdapterOptions, MapViewportState } from '@shared/types';

/** MapLibre GL adapter stub */
export class MapLibreMapAdapter implements MapProviderAdapter {
  id = 'maplibre' as const;

  async initialize(_container: HTMLElement, _options: MapAdapterOptions): Promise<void> {}

  destroy(): void {}

  setViewport(_viewport: MapViewportState): void {}

  async flyTo(_center: { lat: number; lng: number }, _zoom: number): Promise<void> {}

  on(_event: 'click' | 'move' | 'zoom', _handler: (payload: unknown) => void): void {}
}

export const mapLibreMapAdapter = new MapLibreMapAdapter();
