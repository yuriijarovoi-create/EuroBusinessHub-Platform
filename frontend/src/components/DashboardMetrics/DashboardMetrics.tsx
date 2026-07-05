import { useTranslation } from 'react-i18next';
import { dashboardMetrics } from '@/data/platformStats';
import { MetricCard } from '@/components/MetricCard';
import styles from './DashboardMetrics.module.css';

export function DashboardMetrics() {
  const { t } = useTranslation('common');

  return (
    <div className={styles.grid}>
      {dashboardMetrics.map((metric) => (
        <MetricCard
          key={metric.id}
          metric={metric}
          label={t(metric.labelKey)}
        />
      ))}
    </div>
  );
}
