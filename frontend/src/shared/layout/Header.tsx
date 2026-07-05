import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './Header.module.css';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { t, i18n } = useTranslation('common');

  const toggleLanguage = () => {
    void i18n.changeLanguage(i18n.language === 'de' ? 'en' : 'de');
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <button
          type="button"
          className={styles.menuBtn}
          onClick={onMenuToggle}
          aria-label="Menü"
        >
          ☰
        </button>

        <Link to="/" className={styles.brand}>
          <span className={styles.logo}>EU</span>
          <span className={styles.brandText}>
            <strong>{t('app.name')}</strong>
            <small>{t('app.tagline')}</small>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Hauptnavigation">
          <Link to="/">{t('nav.home')}</Link>
          <Link to="/#map">{t('nav.map')}</Link>
          <Link to="/modules">{t('nav.modules')}</Link>
        </nav>

        <div className={styles.actions}>
          <button type="button" className={styles.langBtn} onClick={toggleLanguage}>
            {i18n.language.toUpperCase()}
          </button>
          <button type="button" className={styles.authBtn} disabled title={t('future.auth')}>
            {t('nav.login')}
          </button>
        </div>
      </div>
    </header>
  );
}
