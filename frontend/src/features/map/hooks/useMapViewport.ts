import { useCallback, useRef, useState } from 'react';
import { MAP_VIEWBOX } from '../data/europeGeo';
import { VIEWPORT_LIMITS, EUROPE_DEFAULT_VIEWPORT } from '../utils/projection';
import type { MapViewportState } from '@shared/types';

export type MapViewport = MapViewportState;

const DEFAULT: MapViewport = { ...EUROPE_DEFAULT_VIEWPORT };

export function useMapViewport(initial: MapViewport = DEFAULT) {
  const [viewport, setViewport] = useState<MapViewport>(initial);
  const animRef = useRef<number>(0);

  const clampScale = (s: number) =>
    Math.min(VIEWPORT_LIMITS.maxScale, Math.max(VIEWPORT_LIMITS.minScale, s));

  const animateTo = useCallback((target: MapViewport, duration = 550) => {
    cancelAnimationFrame(animRef.current);
    const start = viewport;
    const startTime = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setViewport({
        scale: clampScale(start.scale + (target.scale - start.scale) * eased),
        translateX: start.translateX + (target.translateX - start.translateX) * eased,
        translateY: start.translateY + (target.translateY - start.translateY) * eased,
      });
      if (t < 1) animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, [viewport]);

  const zoomIn = useCallback(() => {
    setViewport((v) => ({ ...v, scale: clampScale(v.scale * 1.2) }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewport((v) => ({ ...v, scale: clampScale(v.scale / 1.2) }));
  }, []);

  const zoomAt = useCallback((delta: number, originX: number, originY: number) => {
    setViewport((v) => {
      const newScale = clampScale(v.scale * (1 + delta));
      const ratio = newScale / v.scale;
      return {
        scale: newScale,
        translateX: originX - ratio * (originX - v.translateX),
        translateY: originY - ratio * (originY - v.translateY),
      };
    });
  }, []);

  const panBy = useCallback((dx: number, dy: number) => {
    setViewport((v) => ({
      ...v,
      translateX: v.translateX + dx,
      translateY: v.translateY + dy,
    }));
  }, []);

  const reset = useCallback(() => {
    animateTo(DEFAULT);
  }, [animateTo]);

  const setViewportInstant = useCallback((next: MapViewport) => {
    setViewport({
      scale: clampScale(next.scale),
      translateX: next.translateX,
      translateY: next.translateY,
    });
  }, []);

  const transform = `translate(${viewport.translateX}, ${viewport.translateY}) scale(${viewport.scale})`;

  return {
    viewport,
    setViewport: setViewportInstant,
    animateTo,
    zoomIn,
    zoomOut,
    zoomAt,
    panBy,
    reset,
    transform,
    viewBox: MAP_VIEWBOX,
  };
}
