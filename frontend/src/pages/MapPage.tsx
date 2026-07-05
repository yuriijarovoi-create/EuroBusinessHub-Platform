import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { EuropeMap } from '@/features/map/EuropeMap';
import styles from './MapPage.module.css';

export function MapPage() {
  const { t } = useTranslation('map');
  const [searchParams] = useSearchParams();
  const focusCityId = searchParams.get('city') ?? undefined;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>{t('title')}</h1>
        <p>{t('subtitle')}</p>
      </header>
      <EuropeMap variant="interactive" focusCityId={focusCityId} />
    </div>
  );
}
