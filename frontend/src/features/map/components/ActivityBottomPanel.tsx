import { useTranslation } from 'react-i18next';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { ACTIVITY_STATS } from '../data/activityData';
import styles from './EuropeBusinessMap.module.css';

export function ActivityBottomPanel() {
  const { t } = useTranslation('map');
  const stats = ACTIVITY_STATS;

  const cards = [
    { key: 'liveActivity' as const, value: stats.liveActivity },
    { key: 'freightVolume' as const, value: stats.freightVolume24h, suffix: ' t' },
    { key: 'transportOffers' as const, value: stats.openTransportOffers },
    { key: 'deliveryTime' as const, value: stats.avgDeliveryHours, isDecimal: true },
    { key: 'co2Saving' as const, value: stats.co2SavingTons, suffix: ' t' },
  ];

  return (
    <div className={styles.activityPanel}>
      {cards.map(({ key, value, suffix, isDecimal }) => (
        <div key={key} className={styles.activityCard}>
          {isDecimal ? (
            <span className={styles.activityValue}>{value.toFixed(1)} h</span>
          ) : (
            <AnimatedCounter value={value} className={styles.activityValue} suffix={suffix ?? ''} />
          )}
          {!isDecimal && null}
          <span className={styles.activityLabel}>{t(`activity.${key}`)}</span>
        </div>
      ))}
    </div>
  );
}
