import { useTranslation } from 'react-i18next';
import { GlobalSearch } from '@/features/search/GlobalSearch';
import { EuropeMap } from '@/features/map/EuropeMap';
import { ModuleGrid } from '@/features/modules/ModuleGrid';
import styles from './HomePage.module.css';

export function HomePage() {
  const { t } = useTranslation('common');

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>{t('app.name')}</h1>
        <p className={styles.tagline}>{t('app.tagline')}</p>
        <p className={styles.description}>{t('app.description')}</p>
      </section>

      <GlobalSearch />
      <EuropeMap />
      <ModuleGrid />
    </div>
  );
}
