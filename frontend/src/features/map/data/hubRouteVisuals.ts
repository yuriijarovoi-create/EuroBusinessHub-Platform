import { PRIMARY_LOGISTICS_HUBS, isSecondaryLogisticsHub } from './logisticsHubNetwork';

/** Primary command-center hubs — strongest route-node glow */
export const PREMIUM_REFERENCE_HUB_IDS = new Set<string>(PRIMARY_LOGISTICS_HUBS);

export function isPremiumReferenceHub(cityId: string): boolean {
  return PREMIUM_REFERENCE_HUB_IDS.has(cityId);
}

export function isSecondaryLogisticsHubNode(cityId: string): boolean {
  return isSecondaryLogisticsHub(cityId);
}
