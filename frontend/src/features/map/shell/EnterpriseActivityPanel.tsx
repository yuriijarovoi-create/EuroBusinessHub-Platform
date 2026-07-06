import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { futureMapAPI } from '../engine/FutureAPIAdapter';
import styles from './BusinessOperatingMap.module.css';

export function EnterpriseActivityPanel() {
  const { t } = useTranslation('map');
  const [trending, setTrending] = useState<Array<{ id: string; name: string; growth: number }>>([]);
  const [aiTips, setAiTips] = useState<string[]>([]);

  useEffect(() => {
    futureMapAPI.fetchTrendingCities().then(setTrending);
    futureMapAPI.fetchAiRecommendations().then(setAiTips);
  }, []);

  return (
    <footer className={styles.activityDock} aria-label={t('activity.liveActivity')}>
      <div className={styles.activitySection}>
        <span className={styles.activityEyebrow}>{t('operating.trending', { defaultValue: 'Trending cities' })}</span>
        <div className={styles.activityRow}>
          {trending.map((c) => (
            <span key={c.id} className={styles.activityPill}>
              {c.name}
              <em>+{c.growth}%</em>
            </span>
          ))}
        </div>
      </div>

      <div className={styles.activitySection}>
        <span className={styles.activityEyebrow}>{t('operating.ai', { defaultValue: 'AI recommendations' })}</span>
        <div className={styles.activityRow}>
          {aiTips.map((tip) => (
            <span key={tip} className={styles.activityTip}>
              {tip}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.activitySection}>
        <span className={styles.activityEyebrow}>{t('activity.liveActivity')}</span>
        <AnimatedCounter value={12840} className={styles.activityLiveValue} />
      </div>
    </footer>
  );
}
