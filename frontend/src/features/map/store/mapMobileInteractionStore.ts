import { useSyncExternalStore } from 'react';

const MOBILE_INTERACTION_RESTORE_MS = 300;

export interface MapMobileInteractionState {
  interacting: boolean;
}

let state: MapMobileInteractionState = { interacting: false };
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

export const mapMobileInteractionStore = {
  getState(): MapMobileInteractionState {
    return state;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  setInteracting(interacting: boolean): void {
    if (state.interacting === interacting) return;
    state = { interacting };
    emit();
  },

  restoreDelayMs: MOBILE_INTERACTION_RESTORE_MS,
};

export function useMapMobileInteraction(): MapMobileInteractionState {
  return useSyncExternalStore(
    mapMobileInteractionStore.subscribe,
    mapMobileInteractionStore.getState,
    mapMobileInteractionStore.getState,
  );
}

export function useMapMobileInteractionSelector<T>(
  selector: (value: MapMobileInteractionState) => T,
): T {
  return useSyncExternalStore(
    mapMobileInteractionStore.subscribe,
    () => selector(mapMobileInteractionStore.getState()),
    () => selector(mapMobileInteractionStore.getState()),
  );
}

export function isMapMobileInteractionActive(): boolean {
  return mapMobileInteractionStore.getState().interacting;
}
