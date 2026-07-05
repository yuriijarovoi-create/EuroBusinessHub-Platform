import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCityById, getWorkspaceStats } from '@/data/cities';
import { ModuleGrid } from '@/features/modules/ModuleGrid';
import styles from './CityWorkspacePage.module.css';

export function CityWorkspacePage() {
  const { cityId } = useParams<{ cityId: string }>();
  const { t } = useTranslation('workspace');
  const city = cityId ? getCityById(cityId) : undefined;

  if (!city) {
    return (
      <div className={styles.notFound}>
        <h1>Stadt nicht gefunden</h1>
        <Link to="/">{t('backToMap')}</Link>
      </div>
    );
  }

  const stats = getWorkspaceStats(city.id);

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/">{t('backToMap')}</Link>
      </nav>

      <header className={styles.header}>
        <h1>{t('title', { city: city.name })}</h1>
        <p>
          {t('subtitle', {
            country: city.country,
            count: city.businesses,
          })}
        </p>
      </header>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.activeUsers}</span>
          <span className={styles.statLabel}>{t('stats.activeUsers')}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.openOrders}</span>
          <span className={styles.statLabel}>{t('stats.openOrders')}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.listings}</span>
          <span className={styles.statLabel}>{t('stats.listings')}</span>
        </div>
      </div>

      <section className={styles.section}>
        <h2>{t('activeModules')}</h2>
        <ModuleGrid compact filterIds={city.activeModules} />
      </section>

      <section className={styles.section}>
        <h2>{t('quickActions')}</h2>
        <div className={styles.actions}>
          <Link to="/" className={styles.actionBtn}>
            {t('actions.search')}
          </Link>
          <Link to="/module/marketplace" className={styles.actionBtn}>
            {t('actions.marketplace')}
          </Link>
          <Link to="/module/ki" className={styles.actionBtn}>
            {t('actions.ki')}
          </Link>
        </div>
      </section>
    </div>
  );
}
