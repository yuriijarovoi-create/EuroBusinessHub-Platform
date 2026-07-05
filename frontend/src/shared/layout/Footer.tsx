import { useTranslation } from 'react-i18next';
import styles from './Footer.module.css';

export function Footer() {
  const { t } = useTranslation('common');
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>{t('footer.copyright', { year })}</p>
        <p className={styles.mock}>{t('footer.mockData')}</p>
      </div>
    </footer>
  );
}
