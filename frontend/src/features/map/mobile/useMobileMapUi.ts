import { useSyncExternalStore } from 'react';

/** Phase 1 mobile map UI — active below desktop breakpoint (desktop is >=1024px). */
export const MOBILE_MAP_UI_MAX_WIDTH = 1023;

function subscribe(listener: () => void): () => void {
  window.addEventListener('resize', listener);
  return () => window.removeEventListener('resize', listener);
}

function getSnapshot(): boolean {
  return window.innerWidth <= MOBILE_MAP_UI_MAX_WIDTH;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useMobileMapUi(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
