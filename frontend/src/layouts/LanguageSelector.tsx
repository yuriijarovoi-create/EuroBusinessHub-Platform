import { useTranslation } from 'react-i18next';
import { languageOptions, normalizeLanguageCode } from '@/i18n/languages';
import styles from './LanguageSelector.module.css';

export function LanguageSelector() {
  const { i18n, t } = useTranslation('common');
  const activeLanguage = normalizeLanguageCode(i18n.language) ?? 'de';

  return (
    <div className={styles.wrapper}>
      <label htmlFor="lang-select" className="sr-only">{t('nav.language')}</label>
      <select
        id="lang-select"
        className={styles.select}
        value={activeLanguage}
        onChange={(e) => void i18n.changeLanguage(e.target.value)}
        aria-label={t('nav.language')}
      >
        {languageOptions.map(({ code, nativeLabel }) => (
          <option key={code} value={code}>
            {nativeLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
