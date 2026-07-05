import type { MapProviderAdapter, MapAdapterOptions, MapViewportState } from '@shared/types';

/** SVG adapter — current default implementation (in-DOM, no external lib) */
export class SvgMapAdapter implements MapProviderAdapter {
  id = 'svg' as const;

  async initialize(_container: HTMLElement, _options: MapAdapterOptions): Promise<void> {
    // SVG rendering is managed by React components
  }

  destroy(): void {
    // No external resources to release
  }

  setViewport(_viewport: MapViewportState): void {
    // Viewport managed by React SVG transform in SvgMapAdapter mode
  }

  async flyTo(_center: { lat: number; lng: number }, _zoom: number): Promise<void> {
    // Smooth fly handled by useMapViewport.animateTo
  }

  on(_event: 'click' | 'move' | 'zoom', _handler: (payload: unknown) => void): void {
    // Events handled by React components
  }
}

export const svgMapAdapter = new SvgMapAdapter();
