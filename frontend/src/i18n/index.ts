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

import csCommon from './locales/cs/common.json';
import csMap from './locales/cs/map.json';
import csSearch from './locales/cs/search.json';
import csModules from './locales/cs/modules.json';
import csWorkspace from './locales/cs/workspace.json';

import skCommon from './locales/sk/common.json';
import skMap from './locales/sk/map.json';
import skSearch from './locales/sk/search.json';
import skModules from './locales/sk/modules.json';
import skWorkspace from './locales/sk/workspace.json';

import ltCommon from './locales/lt/common.json';
import ltMap from './locales/lt/map.json';
import ltSearch from './locales/lt/search.json';
import ltModules from './locales/lt/modules.json';
import ltWorkspace from './locales/lt/workspace.json';

import frCommon from './locales/fr/common.json';
import frMap from './locales/fr/map.json';
import frSearch from './locales/fr/search.json';
import frModules from './locales/fr/modules.json';
import frWorkspace from './locales/fr/workspace.json';

import nlCommon from './locales/nl/common.json';
import nlMap from './locales/nl/map.json';
import nlSearch from './locales/nl/search.json';
import nlModules from './locales/nl/modules.json';
import nlWorkspace from './locales/nl/workspace.json';

import itCommon from './locales/it/common.json';
import itMap from './locales/it/map.json';
import itSearch from './locales/it/search.json';
import itModules from './locales/it/modules.json';
import itWorkspace from './locales/it/workspace.json';

import roCommon from './locales/ro/common.json';
import roMap from './locales/ro/map.json';
import roSearch from './locales/ro/search.json';
import roModules from './locales/ro/modules.json';
import roWorkspace from './locales/ro/workspace.json';

import svCommon from './locales/sv/common.json';
import svMap from './locales/sv/map.json';
import svSearch from './locales/sv/search.json';
import svModules from './locales/sv/modules.json';
import svWorkspace from './locales/sv/workspace.json';

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
    cs: {
      common: csCommon,
      map: csMap,
      search: csSearch,
      modules: csModules,
      workspace: csWorkspace,
    },
    sk: {
      common: skCommon,
      map: skMap,
      search: skSearch,
      modules: skModules,
      workspace: skWorkspace,
    },
    lt: {
      common: ltCommon,
      map: ltMap,
      search: ltSearch,
      modules: ltModules,
      workspace: ltWorkspace,
    },
    fr: {
      common: frCommon,
      map: frMap,
      search: frSearch,
      modules: frModules,
      workspace: frWorkspace,
    },
    nl: {
      common: nlCommon,
      map: nlMap,
      search: nlSearch,
      modules: nlModules,
      workspace: nlWorkspace,
    },
    it: {
      common: itCommon,
      map: itMap,
      search: itSearch,
      modules: itModules,
      workspace: itWorkspace,
    },
    ro: {
      common: roCommon,
      map: roMap,
      search: roSearch,
      modules: roModules,
      workspace: roWorkspace,
    },
    sv: {
      common: svCommon,
      map: svMap,
      search: svSearch,
      modules: svModules,
      workspace: svWorkspace,
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
