import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { normalizeLanguageCode } from './languages';

export function useDocumentLanguage() {
  const { i18n, t } = useTranslation('common');

  useEffect(() => {
    const syncDocument = (lng: string) => {
      const normalized = normalizeLanguageCode(lng) ?? 'de';
      document.documentElement.lang = normalized;
      document.title = t('app.pageTitle');
    };

    syncDocument(i18n.language);
    i18n.on('languageChanged', syncDocument);
    return () => {
      i18n.off('languageChanged', syncDocument);
    };
  }, [i18n, t]);
}
