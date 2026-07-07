import L from 'leaflet';

const DEFAULT_GUARD_MS = 300;

let cityMarkerTouchHandledUntil = 0;

/** Suppress map background clicks briefly after a city marker touch activation. */
export function markCityMarkerTouchHandled(durationMs = DEFAULT_GUARD_MS): void {
  cityMarkerTouchHandledUntil = Date.now() + durationMs;
}

export function isCityMarkerTouchGuardActive(): boolean {
  return Date.now() < cityMarkerTouchHandledUntil;
}

export function stopLeafletPropagation(e: L.LeafletEvent): void {
  L.DomEvent.stop(e);
  const original = (e as L.LeafletMouseEvent).originalEvent;
  if (original?.cancelable) {
    original.preventDefault();
  }
}
