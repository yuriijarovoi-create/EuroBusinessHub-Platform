/** Shared constants across frontend and backend */

export const APP_NAME = 'EuroBusinessHub';

export const DEFAULT_LOCALE = 'de';

export const SUPPORTED_LOCALES = ['de', 'en'] as const;

export const API_VERSION = 'v1';

export const USER_ROLES = [
  'private',
  'company',
  'transport-provider',
  'warehouse-provider',
  'seller',
  'service-provider',
  'partner',
  'admin',
] as const;

export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  BUSINESS: 'business',
  ENTERPRISE: 'enterprise',
} as const;
