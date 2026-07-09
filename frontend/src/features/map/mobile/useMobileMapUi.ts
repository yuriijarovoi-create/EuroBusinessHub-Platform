import { useSyncExternalStore } from 'react';

/** Mobile map control UI — phones only (desktop is >=769px). */
export const MOBILE_MAP_UI_MAX_WIDTH = 768;

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

export function isMobileMapUiViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= MOBILE_MAP_UI_MAX_WIDTH;
}
