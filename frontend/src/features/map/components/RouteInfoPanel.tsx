import { useTranslation } from 'react-i18next';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import type { BusinessRouteDef, MapCityRecord } from '../types/mapTypes';
import {
  formatEstimatedTime,
  getRouteArrowName,
} from '../data/routeMetadata';
import styles from './EuropeBusinessMap.module.css';

interface RouteInfoPanelProps {
  route: BusinessRouteDef;
  cityMap: Map<string, MapCityRecord>;
  open?: boolean;
  onClose: () => void;
  onToggle?: () => void;
}

export function RouteInfoPanel({
  route,
  cityMap,
  open = true,
  onClose,
  onToggle,
}: RouteInfoPanelProps) {
  const { t } = useTranslation('map');
  const from = cityMap.get(route.fromCityId);
  const to = cityMap.get(route.toCityId);
  const title = getRouteArrowName(route, cityMap);
  const mode = route.transportMode ?? route.mode;
  const lastActivity = route.lastActivity
    ? new Date(route.lastActivity).toLocaleString()
    : '—';

  return (
    <>
      <button
        type="button"
        className={`${styles.panelSheetHandle} ${open ? styles.panelSheetHandleOpen : ''}`}
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className={styles.panelSheetBar} />
        <span className={styles.panelSheetTitle}>{title}</span>
      </button>
      <aside
        className={`${styles.infoPanel} ${styles.routeInfoPanel} ${open ? styles.infoPanelOpen : styles.infoPanelCollapsed}`}
        aria-label={t('routePanel.title', { route: title })}
      >
        <button type="button" className={styles.panelClose} onClick={onClose} aria-label={t('panel.close')}>
          ×
        </button>

        <header className={styles.panelHeader}>
          <h3>{title}</h3>
          <p>
            {t(`routePanel.modes.${mode}`)} · {t(`routePanel.status.${route.status ?? 'active'}`)}
          </p>
        </header>

        <div className={styles.panelBody}>
          <div className={styles.routeEndpoints}>
            <div>
              <span className={styles.routeEndpointLabel}>{t('routePanel.from')}</span>
              <strong>{from?.name ?? route.fromCityId}</strong>
            </div>
            <span className={styles.routeEndpointArrow}>→</span>
            <div>
              <span className={styles.routeEndpointLabel}>{t('routePanel.to')}</span>
              <strong>{to?.name ?? route.toCityId}</strong>
            </div>
          </div>

          <div className={styles.panelMetrics}>
            {[
              { key: 'distance', value: route.distanceKm ?? route.distance ?? 0, suffix: ' km' },
              { key: 'time', value: route.estimatedTime ?? 0, suffix: ` ${t('routePanel.hours')}` },
              { key: 'volume', value: route.monthlyVolumeTons ?? route.volume ?? 0, suffix: '' },
              { key: 'offers', value: route.activeOffers ?? 0, suffix: '' },
              { key: 'orders', value: route.activeOrders ?? 0, suffix: '' },
              { key: 'companies', value: route.companiesCount ?? 0, suffix: '' },
              { key: 'price', value: route.averagePriceIndex ?? 0, suffix: '' },
              { key: 'reliability', value: route.reliabilityScore ?? 0, suffix: '%' },
              { key: 'co2', value: route.co2Estimate ?? 0, suffix: ' kg' },
            ].map(({ key, value, suffix }) => (
              <div key={key} className={styles.panelMetric}>
                <div className={styles.panelMetricValue}>
                  <AnimatedCounter value={value} />
                  {suffix}
                </div>
                <div className={styles.panelMetricLabel}>{t(`routePanel.stats.${key}`)}</div>
              </div>
            ))}
          </div>

          {route.estimatedTime != null && (
            <p className={styles.routeDeliveryNote}>
              {t('routePanel.delivery', { time: formatEstimatedTime(route.estimatedTime) })}
            </p>
          )}

          <p className={styles.routeMetaLine}>
            {t('routePanel.lastActivity', { time: lastActivity })}
          </p>

          {(route.mainIndustries ?? route.industries) && (
            <div className={styles.routeIndustries}>
              <span className={styles.routeEndpointLabel}>{t('routePanel.industries')}</span>
              <div className={styles.routeIndustryTags}>
                {(route.mainIndustries ?? route.industries)!.map((ind) => (
                  <span key={ind} className={styles.routeIndustryTag}>
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className={styles.routeWarehousesNote}>{t('routePanel.warehousesHint')}</p>

          <div className={styles.routeActions}>
            <button type="button" className={styles.routeActionPrimary}>
              {t('routePanel.actions.open')}
            </button>
            <button type="button" className={styles.routeActionSecondary}>
              {t('routePanel.actions.search')}
            </button>
            <button type="button" className={styles.routeActionSecondary}>
              {t('routePanel.actions.create')}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
