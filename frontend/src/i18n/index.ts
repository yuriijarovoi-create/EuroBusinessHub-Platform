import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import deCommon from './locales/de/common.json';
import deMap from './locales/de/map.json';
import deSearch from './locales/de/search.json';
import deModules from './locales/de/modules.json';
import deWorkspace from './locales/de/workspace.json';

import enCommon from './locales/en/common.json';
import enMap from './locales/en/map.json';
import enSearch from './locales/en/search.json';
import enModules from './locales/en/modules.json';
import enWorkspace from './locales/en/workspace.json';

import ukCommon from './locales/uk/common.json';
import ukMap from './locales/uk/map.json';
import ukSearch from './locales/uk/search.json';
import ukModules from './locales/uk/modules.json';
import ukWorkspace from './locales/uk/workspace.json';

import ruCommon from './locales/ru/common.json';
import ruMap from './locales/ru/map.json';
import ruSearch from './locales/ru/search.json';
import ruModules from './locales/ru/modules.json';
import ruWorkspace from './locales/ru/workspace.json';

import plCommon from './locales/pl/common.json';
import plMap from './locales/pl/map.json';
import plSearch from './locales/pl/search.json';
import plModules from './locales/pl/modules.json';
import plWorkspace from './locales/pl/workspace.json';

import {
  LANGUAGE_STORAGE_KEY,
  normalizeLanguageCode,
  resolveInitialLanguage,
  supportedLanguages,
  type SupportedLanguage,
} from './languages';

export { LANGUAGE_STORAGE_KEY, supportedLanguages, type SupportedLanguage };
export const defaultNS = 'common';
export const namespaces = ['common', 'map', 'search', 'modules', 'workspace'] as const;

const initialLanguage = resolveInitialLanguage();

void i18n.use(initReactI18next).init({
  lng: initialLanguage,
  fallbackLng: 'en',
  defaultNS,
  ns: [...namespaces],
  resources: {
    de: {
      common: deCommon,
      map: deMap,
      search: deSearch,
      modules: deModules,
      workspace: deWorkspace,
    },
    en: {
      common: enCommon,
      map: enMap,
      search: enSearch,
      modules: enModules,
      workspace: enWorkspace,
    },
    uk: {
      common: ukCommon,
      map: ukMap,
      search: ukSearch,
      modules: ukModules,
      workspace: ukWorkspace,
    },
    ru: {
      common: ruCommon,
      map: ruMap,
      search: ruSearch,
      modules: ruModules,
      workspace: ruWorkspace,
    },
    pl: {
      common: plCommon,
      map: plMap,
      search: plSearch,
      modules: plModules,
      workspace: plWorkspace,
    },
  },
  interpolation: { escapeValue: false },
});

if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLanguage;
}

i18n.on('languageChanged', (lng) => {
  const normalized = normalizeLanguageCode(lng);
  if (!normalized) {
    void i18n.changeLanguage('de');
    return;
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = normalized;
  }
});

export default i18n;
