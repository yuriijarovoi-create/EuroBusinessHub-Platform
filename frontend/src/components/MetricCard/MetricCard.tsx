import { Link } from 'react-router-dom';
import { GlassPanel } from '@/components/GlassPanel';
import type { DashboardMetric } from '@shared/types';
import styles from './MetricCard.module.css';

interface MetricCardProps {
  metric: DashboardMetric;
  label: string;
}

export function MetricCard({ metric, label }: MetricCardProps) {
  return (
    <Link to={metric.route} className={styles.link}>
      <GlassPanel padding="md" className={styles.card}>
        <span className={styles.icon} aria-hidden>{metric.icon}</span>
        <div className={styles.body}>
          <span className={styles.label}>{label}</span>
          <strong className={styles.value}>{metric.value}</strong>
          {metric.change !== undefined && (
            <span className={`${styles.change} ${metric.change >= 0 ? styles.up : styles.down}`}>
              {metric.change >= 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
            </span>
          )}
        </div>
      </GlassPanel>
    </Link>
  );
}
