import { createContext, useContext, type ReactNode } from 'react';
import type { Map as LeafletMap } from 'leaflet';

interface LeafletMapContextValue {
  map: LeafletMap | null;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
}

const LeafletMapCtx = createContext<LeafletMapContextValue>({
  map: null,
  zoomIn: () => {},
  zoomOut: () => {},
  resetView: () => {},
});

export function LeafletMapProvider({
  value,
  children,
}: {
  value: LeafletMapContextValue;
  children: ReactNode;
}) {
  return <LeafletMapCtx.Provider value={value}>{children}</LeafletMapCtx.Provider>;
}

export function useLeafletMap(): LeafletMapContextValue {
  return useContext(LeafletMapCtx);
}
