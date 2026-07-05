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

export const defaultNS = 'common';
export const supportedLanguages = ['de', 'en'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const namespaces = ['common', 'map', 'search', 'modules', 'workspace'] as const;

void i18n.use(initReactI18next).init({
  lng: 'de',
  fallbackLng: 'de',
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
  },
  interpolation: { escapeValue: false },
});

export default i18n;
