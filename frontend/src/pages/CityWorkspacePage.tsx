import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCityById } from '@/data/cities';
import { CityProvider, useCityContext } from '@/features/map/context/CityContext';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { GlassPanel } from '@/components/GlassPanel';
import { routes } from '@/config';
import styles from './CityWorkspacePage.module.css';

function CityWorkspaceContent() {
  const { cityId } = useParams<{ cityId: string }>();
  const { t } = useTranslation(['workspace', 'modules']);
  const { workspace } = useCityContext();
  const city = cityId ? getCityById(cityId) : undefined;

  if (!city || !workspace) {
    return (
      <div className={styles.notFound}>
        <h1>Stadt nicht gefunden</h1>
        <Link to={routes.map}>{t('workspace:backToMap')}</Link>
      </div>
    );
  }

  const metricEntries = [
    { key: 'companies', value: workspace.metrics.companies },
    { key: 'jobs', value: workspace.metrics.jobs },
    { key: 'transport', value: workspace.metrics.transport },
    { key: 'warehouses', value: workspace.metrics.warehouses },
    { key: 'marketplace', value: workspace.metrics.marketplace },
    { key: 'partners', value: workspace.metrics.partners },
    { key: 'digitalProducts', value: workspace.metrics.digitalProducts },
    { key: 'services', value: workspace.metrics.services },
  ] as const;

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to={routes.map}>{t('workspace:backToMap')}</Link>
      </nav>

      <header className={styles.header}>
        <h1>{t('workspace:title', { city: city.name })}</h1>
        <p>
          {t('workspace:subtitle', { country: city.country, count: city.businesses })}
        </p>
      </header>

      <div className={styles.stats}>
        {(['activeUsers', 'openOrders', 'listings'] as const).map((key) => (
          <GlassPanel key={key} padding="md" className={styles.stat}>
            <span className={styles.statValue}>{workspace.stats[key]}</span>
            <span className={styles.statLabel}>{t(`workspace:stats.${key}`)}</span>
          </GlassPanel>
        ))}
      </div>

      <section className={styles.section}>
        <h2>{t('workspace:ecosystemMetrics')}</h2>
        <div className={styles.metricsGrid}>
          {metricEntries.map(({ key, value }) => (
            <GlassPanel key={key} padding="sm" className={styles.metricCard}>
              <AnimatedCounter value={value} className={styles.metricValue} />
              <span className={styles.metricLabel}>{t(`workspace:metrics.${key}`)}</span>
            </GlassPanel>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('workspace:activeModules')}</h2>
        <div className={styles.moduleGrid}>
          {workspace.modules
            .filter((mod) => mod.enabled)
            .map((mod) => (
              <Link key={mod.moduleId} to={mod.route} className={styles.moduleLink}>
                <GlassPanel padding="md" className={styles.moduleCard}>
                  <span className={styles.moduleName}>
                    {t(`modules:${mod.moduleId}.name`)}
                  </span>
                  <span className={styles.moduleDesc}>
                    {t(`modules:${mod.moduleId}.description`)}
                  </span>
                </GlassPanel>
              </Link>
            ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('workspace:quickActions')}</h2>
        <div className={styles.actions}>
          <Link to={routes.map} className={styles.actionBtn}>{t('workspace:actions.search')}</Link>
          <Link to={routes.module('marketplace')} className={styles.actionBtn}>{t('workspace:actions.marketplace')}</Link>
          <Link to={routes.module('ki')} className={styles.actionBtn}>{t('workspace:actions.ki')}</Link>
        </div>
      </section>
    </div>
  );
}

export function CityWorkspacePage() {
  const { cityId } = useParams<{ cityId: string }>();

  return (
    <CityProvider cityId={cityId ?? null}>
      <CityWorkspaceContent />
    </CityProvider>
  );
}
