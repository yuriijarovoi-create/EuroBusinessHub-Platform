import type { BusinessLayerId } from '@/features/map/utils/mapLayerContext';

export type CityWorkspaceModuleLayer = 'companies';

const LAYER_MODULE_MAP: Partial<Record<BusinessLayerId, CityWorkspaceModuleLayer>> = {
  companies: 'companies',
};

export function getCityWorkspacePath(params: {
  citySlug: string;
  activeLayer?: BusinessLayerId | null;
}): string {
  const module = params.activeLayer ? LAYER_MODULE_MAP[params.activeLayer] : undefined;
  if (module === 'companies') {
    return `/workspace/${params.citySlug}/companies`;
  }
  return `/workspace/${params.citySlug}`;
}
