import { useTranslation } from 'react-i18next';
import { platformStats } from '@/data/platformStats';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { GlassPanel } from '@/components/GlassPanel';
import styles from './PlatformStats.module.css';

export function PlatformStats() {
  const { t } = useTranslation('common');

  return (
    <div className={styles.grid}>
      {platformStats.map((stat, i) => (
        <GlassPanel
          key={stat.id}
          padding="md"
          className={styles.card}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <AnimatedCounter value={stat.value} className={styles.value} />
          <span className={styles.label}>{t(stat.labelKey)}</span>
          {stat.trend !== undefined && (
            <span className={styles.trend}>↑ {stat.trend}%</span>
          )}
        </GlassPanel>
      ))}
    </div>
  );
}
