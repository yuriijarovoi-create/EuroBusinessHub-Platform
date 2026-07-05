import { createContext, useContext, type ReactNode } from 'react';
import type { CityWorkspace } from '@shared/types';
import { getFullCityWorkspace } from '../services/mapService';

interface CityContextValue {
  workspace: CityWorkspace | null;
  cityId: string | null;
}

const CityCtx = createContext<CityContextValue>({ workspace: null, cityId: null });

export function CityProvider({
  cityId,
  children,
}: {
  cityId: string | null;
  children: ReactNode;
}) {
  const workspace = cityId ? getFullCityWorkspace(cityId) : null;
  return (
    <CityCtx.Provider value={{ workspace, cityId }}>{children}</CityCtx.Provider>
  );
}

export function useCityContext(): CityContextValue {
  return useContext(CityCtx);
}
