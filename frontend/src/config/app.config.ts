export const appConfig = {
  name: 'EuroBusinessHub',
  tagline: 'Eine Plattform. Unbegrenzte Geschäftschancen.',
  description: 'Das KI Business Operating System für Europa',
  defaultLocale: 'de' as const,
  supportedLocales: ['de', 'en'] as const,
  hubCityId: 'frankfurt',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
} as const;

export type AppLocale = (typeof appConfig.supportedLocales)[number];
