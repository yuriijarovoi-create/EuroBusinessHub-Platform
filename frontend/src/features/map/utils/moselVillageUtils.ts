/** Mosel corridor — true villages only; towns use population-based tiers */
export const MOSEL_VILLAGE_IDS = new Set([
  'klotten',
  'ernst',
  'valwig',
  'bruttig_fankel',
  'beilstein',
  'ellenz_poltersdorf',
  'senheim',
  'bremm',
  'ediger_eller',
  'treis_karden',
  'mueden',
  'pommern',
  'moselkern',
  'bullay',
  'alf',
]);

export function isMoselVillageId(cityId: string): boolean {
  return MOSEL_VILLAGE_IDS.has(cityId);
}
