/** Main logistics hubs — stronger route-node glow in reference style */
export const PREMIUM_REFERENCE_HUB_IDS = new Set([
  'berlin',
  'frankfurt',
  'paris',
  'amsterdam',
  'rotterdam',
  'hamburg',
  'munich',
  'warsaw',
  'kyiv',
  'izium',
  'istanbul',
  'vienna',
  'milan',
  'prague',
]);

export function isPremiumReferenceHub(cityId: string): boolean {
  return PREMIUM_REFERENCE_HUB_IDS.has(cityId);
}
