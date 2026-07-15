import { useTranslation } from 'react-i18next';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import type { MapCountry } from '@shared/types';
import type { BusinessRouteDef, MapCityRecord } from '../types/mapTypes';
import { getCityHubProfile } from '../data/cityHubEnrichment';
import { getMapCityById } from '../data/mapData';
import {
  getBusinessLayerLabel,
  getLogisticsLayerLabel,
  isEuropeOverview,
  type ActiveMapContext,
} from '../utils/mapLayerContext';
import { resolvePrimaryVisualMode } from '../utils/mapVisualModes';
import { useMapVisualModeCopy } from '../hooks/useMapVisualModeCopy';
import styles from './BusinessOperatingMap.module.css';

interface StatisticsPanelProps {
  country: MapCountry | null;
  city: MapCityRecord | null;
  route: BusinessRouteDef | null;
  stats: {
    activeUsers: number;
    openJobs: number;
    marketplaceOffers: number;
    transportOffers: number;
    warehouses: number;
  };
  activeMapContext: ActiveMapContext;
  collapsed?: boolean;
  onToggle?: () => void;
}

export function StatisticsPanel({
  country,
  city,
  route,
  stats,
  activeMapContext,
  collapsed = false,
  onToggle,
}: StatisticsPanelProps) {
  const { t } = useTranslation('map');
  const m = city?.metrics;
  const hubProfile = city ? getCityHubProfile(city.id) : undefined;
  const showEuropeOverview = isEuropeOverview(activeMapContext);
  const visualMode = resolvePrimaryVisualMode(activeMapContext);
  const visualCopy = useMapVisualModeCopy(visualMode);

  return (
    <aside
      className={`${styles.sidebar} ${styles.sidebarRight} ${collapsed ? styles.sidebarCollapsed : ''}`}
      aria-label={t('operating.context')}
    >
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarTitle}>{t('operating.insights')}</span>
        {onToggle && (
          <button type="button" className={styles.sidebarToggle} onClick={onToggle} aria-label={t('a11y.togglePanel')}>
            ›
          </button>
        )}
      </div>

      <div className={styles.statBlock}>
        <span className={styles.statEyebrow}>
          {t('operating.activeMapMode')}
        </span>
        <h3 className={styles.statTitle}>{visualCopy.panelTitle}</h3>
        <p className={styles.statMeta}>{visualCopy.recommendation}</p>
        {!showEuropeOverview && (
          <>
            {activeMapContext.logisticsLayer && (
              <p className={styles.statMeta}>
                {t('operating.logisticsLayer')}:{' '}
                {getLogisticsLayerLabel(activeMapContext.logisticsLayer, t)}
              </p>
            )}
            {activeMapContext.businessLayer && (
              <p className={styles.statMeta}>
                {t('operating.businessLayer')}:{' '}
                {getBusinessLayerLabel(activeMapContext.businessLayer, t)}
              </p>
            )}
          </>
        )}
      </div>

      {country && (
        <div className={styles.statBlock}>
          <span className={styles.statEyebrow}>{t('operating.country')}</span>
          <h3 className={styles.statTitle}>{country.name}</h3>
        </div>
      )}

      {city && (
        <div className={styles.statBlock}>
          <span className={styles.statEyebrow}>{t('operating.city')}</span>
          <h3 className={styles.statTitle}>{city.name}</h3>
          <p className={styles.statMeta}>{hubProfile?.businessCategory ?? city.country}</p>
          {m && (
            <div className={styles.statGrid}>
              <div className={styles.statItem}>
                <AnimatedCounter value={m.companies} className={styles.statValue} />
                <span className={styles.statLabel}>{t('panel.companies')}</span>
              </div>
              <div className={styles.statItem}>
                <AnimatedCounter value={m.jobs} className={styles.statValue} />
                <span className={styles.statLabel}>{t('panel.jobs')}</span>
              </div>
              <div className={styles.statItem}>
                <AnimatedCounter value={m.transport} className={styles.statValue} />
                <span className={styles.statLabel}>{t('panel.transportOffers')}</span>
              </div>
              <div className={styles.statItem}>
                <AnimatedCounter value={m.warehouses} className={styles.statValue} />
                <span className={styles.statLabel}>{t('panel.warehouses')}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{m.aiScore}</span>
                <span className={styles.statLabel}>{t('panel.aiScore')}</span>
              </div>
            </div>
          )}
          {hubProfile?.topRoutePairs && (
            <div className={styles.statRoutes}>
              <span className={styles.statEyebrow}>{t('panel.tabs.routes')}</span>
              <ul className={styles.statRouteList}>
                {hubProfile.topRoutePairs.map(([fromId, toId]) => (
                  <li key={`${fromId}-${toId}`}>
                    {getMapCityById(fromId)?.name ?? fromId} → {getMapCityById(toId)?.name ?? toId}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {route && (
        <div className={styles.statBlock}>
          <span className={styles.statEyebrow}>{t('operating.corridor')}</span>
          <p className={styles.statRoute}>
            {getMapCityById(route.fromCityId)?.name ?? route.fromCityId} →{' '}
            {getMapCityById(route.toCityId)?.name ?? route.toCityId}
          </p>
          <span className={styles.statMeta}>{route.mode.toUpperCase()}</span>
        </div>
      )}

      <div className={styles.statBlock}>
        <span className={styles.statEyebrow}>{t('operating.platform')}</span>
        <div className={styles.statGrid}>
          <div className={styles.statItem}>
            <AnimatedCounter value={stats.activeUsers} className={styles.statValue} />
            <span className={styles.statLabel}>{t('operating.activeUsers')}</span>
          </div>
          <div className={styles.statItem}>
            <AnimatedCounter value={stats.openJobs} className={styles.statValue} />
            <span className={styles.statLabel}>{t('panel.jobs')}</span>
          </div>
          <div className={styles.statItem}>
            <AnimatedCounter value={stats.marketplaceOffers} className={styles.statValue} />
            <span className={styles.statLabel}>{t('operating.marketplace')}</span>
          </div>
          <div className={styles.statItem}>
            <AnimatedCounter value={stats.transportOffers} className={styles.statValue} />
            <span className={styles.statLabel}>{t('panel.transportOffers')}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
