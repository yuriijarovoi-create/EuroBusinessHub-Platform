import L from 'leaflet';

/** Suppress map background handlers briefly after a city marker tap (mobile ghost clicks). */

const TAP_DEBOUNCE_MS = 450;
const SUPPRESS_BACKGROUND_MS = 550;

let suppressBackgroundUntil = 0;
let lastMarkerTap: { cityId: string; at: number } | null = null;

/** Returns false when the same city was tapped twice within the debounce window. */
export function registerCityMarkerTap(cityId: string): boolean {
  const now = Date.now();
  if (lastMarkerTap?.cityId === cityId && now - lastMarkerTap.at < TAP_DEBOUNCE_MS) {
    return false;
  }
  lastMarkerTap = { cityId, at: now };
  suppressBackgroundUntil = now + SUPPRESS_BACKGROUND_MS;
  return true;
}

export function shouldSuppressMapBackgroundAction(): boolean {
  return Date.now() < suppressBackgroundUntil;
}

export function stopLeafletEvent(e: L.LeafletEvent): void {
  L.DomEvent.stop(e);
  const native =
    'originalEvent' in e && e.originalEvent instanceof Event ? e.originalEvent : undefined;
  if (native) {
    L.DomEvent.preventDefault(native);
    native.stopPropagation();
  }
}
