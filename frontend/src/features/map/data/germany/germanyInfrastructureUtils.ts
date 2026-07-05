import type { MapLayerState } from '../../types/mapTypes';
import type { GermanyInfrastructureHub, GermanyInfrastructureType } from '../../types/germanyTypes';
import { GERMANY_INFRASTRUCTURE_HUBS } from './germanyInfrastructureHubs';

const LAYER_BY_TYPE: Record<GermanyInfrastructureType, keyof MapLayerState> = {
  seaport: 'sea',
  inland_port: 'river',
  air_cargo: 'air',
  industrial_zone: 'companies',
};

export function isInfrastructureHubVisible(
  hub: GermanyInfrastructureHub,
  layers: MapLayerState,
): boolean {
  return layers[LAYER_BY_TYPE[hub.type]];
}

/** Reduce clutter at low zoom — higher importance hubs shown first */
export function minImportanceForZoom(zoom: number): number {
  if (zoom < 6) return 90;
  if (zoom < 7) return 78;
  if (zoom < 8) return 65;
  return 0;
}

export function getVisibleInfrastructureHubs(
  layers: MapLayerState,
  zoom: number,
): GermanyInfrastructureHub[] {
  const minScore = minImportanceForZoom(zoom);
  return GERMANY_INFRASTRUCTURE_HUBS.filter(
    (hub) => isInfrastructureHubVisible(hub, layers) && hub.importanceScore >= minScore,
  );
}

export interface NearbyInfrastructure {
  seaports: GermanyInfrastructureHub[];
  inlandPorts: GermanyInfrastructureHub[];
  airCargo: GermanyInfrastructureHub[];
  industrialZones: GermanyInfrastructureHub[];
}

function isHubRelatedToCity(hub: GermanyInfrastructureHub, cityId: string): boolean {
  return hub.cityId === cityId || hub.connectedCityIds.includes(cityId);
}

function sortByImportance(hubs: GermanyInfrastructureHub[]): GermanyInfrastructureHub[] {
  return [...hubs].sort((a, b) => b.importanceScore - a.importanceScore);
}

export function getNearbyInfrastructureForCity(cityId: string, limitPerType = 4): NearbyInfrastructure {
  const related = GERMANY_INFRASTRUCTURE_HUBS.filter((h) => isHubRelatedToCity(h, cityId));

  return {
    seaports: sortByImportance(related.filter((h) => h.type === 'seaport')).slice(0, limitPerType),
    inlandPorts: sortByImportance(related.filter((h) => h.type === 'inland_port')).slice(0, limitPerType),
    airCargo: sortByImportance(related.filter((h) => h.type === 'air_cargo')).slice(0, limitPerType),
    industrialZones: sortByImportance(related.filter((h) => h.type === 'industrial_zone')).slice(
      0,
      limitPerType,
    ),
  };
}

export function getInfrastructureLayerKey(type: GermanyInfrastructureType): keyof MapLayerState {
  return LAYER_BY_TYPE[type];
}
