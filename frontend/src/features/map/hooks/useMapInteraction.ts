import { useCallback, useEffect, useRef } from 'react';
import type { MapViewportState } from '@shared/types';

interface UseMapInteractionOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  viewport: MapViewportState;
  zoomAt: (delta: number, originX: number, originY: number) => void;
  panBy: (dx: number, dy: number) => void;
  enabled?: boolean;
}

export function useMapInteraction({
  containerRef,
  zoomAt,
  panBy,
  enabled = true,
}: UseMapInteractionOptions) {
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef<number | null>(null);

  const getSvgPoint = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return { x: 50, y: 35 };
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 70;
    return { x, y };
  }, [containerRef]);

  const onWheel = useCallback(
    (e: WheelEvent) => {
      if (!enabled) return;
      e.preventDefault();
      const pt = getSvgPoint(e.clientX, e.clientY);
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      zoomAt(delta, pt.x, pt.y);
    },
    [enabled, getSvgPoint, zoomAt],
  );

  const onPointerDown = useCallback((e: PointerEvent) => {
    if (!enabled || e.button !== 0) return;
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [enabled]);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!enabled || !dragging.current) return;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = ((e.clientX - lastPos.current.x) / rect.width) * 100;
      const dy = ((e.clientY - lastPos.current.y) / rect.height) * 70;
      panBy(dx, dy);
      lastPos.current = { x: e.clientX, y: e.clientY };
    },
    [enabled, containerRef, panBy],
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const onTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.hypot(dx, dy);
    } else if (e.touches.length === 1) {
      dragging.current = true;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, [enabled]);

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return;
      if (e.touches.length === 2 && lastPinchDist.current !== null) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const delta = (dist - lastPinchDist.current) * 0.002;
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const pt = getSvgPoint(midX, midY);
        zoomAt(delta, pt.x, pt.y);
        lastPinchDist.current = dist;
      } else if (e.touches.length === 1 && dragging.current) {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const t = e.touches[0];
        const dx = ((t.clientX - lastPos.current.x) / rect.width) * 100;
        const dy = ((t.clientY - lastPos.current.y) / rect.height) * 70;
        panBy(dx, dy);
        lastPos.current = { x: t.clientX, y: t.clientY };
      }
    },
    [enabled, containerRef, getSvgPoint, zoomAt, panBy],
  );

  const onTouchEnd = useCallback(() => {
    dragging.current = false;
    lastPinchDist.current = null;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [
    containerRef,
    enabled,
    onWheel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  ]);
}
