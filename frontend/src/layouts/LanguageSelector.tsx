import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '@/i18n';
import styles from './LanguageSelector.module.css';

export function LanguageSelector() {
  const { i18n, t } = useTranslation('common');

  return (
    <div className={styles.wrapper}>
      <label htmlFor="lang-select" className="sr-only">{t('nav.language')}</label>
      <select
        id="lang-select"
        className={styles.select}
        value={i18n.language}
        onChange={(e) => void i18n.changeLanguage(e.target.value)}
        aria-label={t('nav.language')}
      >
        {supportedLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {lang === 'de' ? 'Deutsch' : 'English'}
          </option>
        ))}
      </select>
    </div>
  );
}
