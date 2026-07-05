import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from '@/components/SectionHeader';
import { DashboardMetrics } from '@/components/DashboardMetrics';
import { routes } from '@/config';
import styles from './HomeDashboardSection.module.css';

export function HomeDashboardSection() {
  const { t } = useTranslation('common');

  return (
    <section className={styles.section}>
      <SectionHeader
        eyebrow="Dashboard"
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
        action={
          <Link to={routes.dashboard} className={styles.viewAll}>
            {t('dashboard.viewAll')} →
          </Link>
        }
      />
      <DashboardMetrics />
    </section>
  );
}
