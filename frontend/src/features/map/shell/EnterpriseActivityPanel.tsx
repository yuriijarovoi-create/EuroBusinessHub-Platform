import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { futureMapAPI } from '../engine/FutureAPIAdapter';
import type { ActiveMapContext } from '../utils/mapLayerContext';
import { DEFAULT_ACTIVE_MAP_CONTEXT } from '../utils/mapLayerContext';
import { resolvePrimaryVisualMode } from '../utils/mapVisualModes';
import { MapCommandWheel } from './MapCommandWheel';
import styles from './BusinessOperatingMap.module.css';

interface EnterpriseActivityPanelProps {
  activeMapContext?: ActiveMapContext;
}

export function EnterpriseActivityPanel({
  activeMapContext = DEFAULT_ACTIVE_MAP_CONTEXT,
}: EnterpriseActivityPanelProps) {
  const { t } = useTranslation('map');
  const [trending, setTrending] = useState<Array<{ id: string; name: string; growth: number }>>([]);

  const visualMode = useMemo(
    () => resolvePrimaryVisualMode(activeMapContext),
    [activeMapContext],
  );

  useEffect(() => {
    futureMapAPI.fetchTrendingCities().then(setTrending);
  }, []);

  return (
    <footer className={styles.activityDock} aria-label={t('activity.liveActivity')}>
      <MapCommandWheel />

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
        <span className={styles.activityEyebrow}>{visualMode.tickerEyebrow}</span>
        <div className={styles.activityRow}>
          {visualMode.tickerMessages.map((tip) => (
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
