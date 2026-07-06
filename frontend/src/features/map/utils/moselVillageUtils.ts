/** Mosel corridor — marker visibility uses tier-4 zoom floor (see cityVisibilityUtils) */
export const MOSEL_VILLAGE_IDS = new Set([
  'cochem',
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
  'kaisersesch',
  'zell_an_der_mosel',
  'bullay',
  'alf',
]);

export function isMoselVillageId(cityId: string): boolean {
  return MOSEL_VILLAGE_IDS.has(cityId);
}
