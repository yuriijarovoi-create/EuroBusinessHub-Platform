import { useTranslation } from 'react-i18next';
import { EuropeMap } from '@/features/map/EuropeMap';
import styles from './MapPage.module.css';

export function MapPage() {
  const { t } = useTranslation('map');

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>{t('title')}</h1>
        <p>{t('subtitle')}</p>
      </header>
      <EuropeMap variant="interactive" />
    </div>
  );
}
