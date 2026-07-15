export const LANGUAGE_STORAGE_KEY = 'ebh-language';

export const languageOptions = [
  { code: 'de', nativeLabel: 'Deutsch' },
  { code: 'en', nativeLabel: 'English' },
  { code: 'uk', nativeLabel: 'Українська' },
  { code: 'ru', nativeLabel: 'Русский' },
  { code: 'pl', nativeLabel: 'Polski' },
  { code: 'cs', nativeLabel: 'Čeština' },
  { code: 'sk', nativeLabel: 'Slovenčina' },
  { code: 'lt', nativeLabel: 'Lietuvių' },
  { code: 'fr', nativeLabel: 'Français' },
  { code: 'nl', nativeLabel: 'Nederlands' },
  { code: 'it', nativeLabel: 'Italiano' },
  { code: 'ro', nativeLabel: 'Română' },
  { code: 'sv', nativeLabel: 'Svenska' },
] as const;

export const supportedLanguages = languageOptions.map((option) => option.code);
export type SupportedLanguage = (typeof languageOptions)[number]['code'];

export function normalizeLanguageCode(code: string | undefined | null): SupportedLanguage | null {
  if (!code) return null;
  const base = code.split('-')[0]?.toLowerCase();
  if (!base) return null;
  return supportedLanguages.includes(base as SupportedLanguage) ? (base as SupportedLanguage) : null;
}

export function resolveInitialLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'de';
  const stored = normalizeLanguageCode(localStorage.getItem(LANGUAGE_STORAGE_KEY));
  return stored ?? 'de';
}

export function getLanguageNativeLabel(code: string): string {
  const normalized = normalizeLanguageCode(code);
  const match = languageOptions.find((option) => option.code === normalized);
  return match?.nativeLabel ?? languageOptions[0].nativeLabel;
}
