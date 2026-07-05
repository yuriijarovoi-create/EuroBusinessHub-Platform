import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { getRoutesForCity } from '../data/routeData';
import { getMapCityById } from '../data/mapData';
import type { MapCityRecord, CityPanelTab } from '../types/mapTypes';
import styles from './EuropeBusinessMap.module.css';

interface CityInfoPanelProps {
  city: MapCityRecord | null;
  open?: boolean;
  onClose: () => void;
  onToggle?: () => void;
  onOpenWorkspace: (city: MapCityRecord) => void;
}

const TABS: CityPanelTab[] = ['overview', 'companies', 'jobs', 'warehouses', 'routes'];

export function CityInfoPanel({ city, open = true, onClose, onToggle, onOpenWorkspace }: CityInfoPanelProps) {
  const { t } = useTranslation('map');
  const [tab, setTab] = useState<CityPanelTab>('overview');

  if (!city) return null;

  const cityRoutes = getRoutesForCity(city.id).slice(0, 6);
  const m = city.metrics;

  return (
    <>
      <button
        type="button"
        className={`${styles.panelSheetHandle} ${open ? styles.panelSheetHandleOpen : ''}`}
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className={styles.panelSheetBar} />
        <span className={styles.panelSheetTitle}>{city.name}</span>
      </button>
      <aside
        className={`${styles.infoPanel} ${open ? styles.infoPanelOpen : styles.infoPanelCollapsed}`}
        aria-label={t('panel.title', { city: city.name })}
      >
      <button type="button" className={styles.panelClose} onClick={onClose} aria-label={t('panel.close')}>×</button>

      <div className={styles.panelPreview} aria-hidden>
        <div className={styles.panelPreviewGradient} />
        <span className={styles.panelPreviewCity}>{city.name}</span>
      </div>

      <header className={styles.panelHeader}>
        <h3>{city.name}</h3>
        <p>{city.country}</p>
      </header>

      <nav className={styles.panelTabs}>
        {TABS.map((id) => (
          <button
            key={id}
            type="button"
            className={`${styles.panelTab} ${tab === id ? styles.panelTabActive : ''}`}
            onClick={() => setTab(id)}
          >
            {t(`panel.tabs.${id}`)}
          </button>
        ))}
      </nav>

      <div className={styles.panelBody}>
        {tab === 'overview' && (
          <div className={styles.panelMetrics}>
            {[
              { key: 'companies', value: m.companies },
              { key: 'jobs', value: m.jobs },
              { key: 'warehouses', value: m.warehouses },
              { key: 'transport', value: m.transport },
              { key: 'marketplace', value: m.marketplace },
              { key: 'partners', value: m.partners },
              { key: 'aiScore', value: m.aiScore, suffix: '' },
            ].map(({ key, value, suffix }) => (
              <div key={key} className={`${styles.panelMetric} ${key === 'aiScore' ? styles.panelMetricAi : ''}`}>
                {key === 'aiScore' ? (
                  <span className={styles.panelMetricValue}>{value}</span>
                ) : (
                  <AnimatedCounter value={value} className={styles.panelMetricValue} suffix={suffix ?? ''} />
                )}
                <span className={styles.panelMetricLabel}>{t(`panel.${key}`)}</span>
              </div>
            ))}
          </div>
        )}
        {tab === 'companies' && (
          <div className={styles.panelStatBlock}>
            <AnimatedCounter value={m.companies} className={styles.panelBigStat} />
            <p>{t('panel.companiesDesc')}</p>
            <AnimatedCounter value={m.digitalProducts} className={styles.panelSubStat} />
            <span>{t('panel.digitalProducts')}</span>
          </div>
        )}
        {tab === 'jobs' && (
          <div className={styles.panelStatBlock}>
            <AnimatedCounter value={m.jobs} className={styles.panelBigStat} />
            <p>{t('panel.jobsDesc')}</p>
          </div>
        )}
        {tab === 'warehouses' && (
          <div className={styles.panelStatBlock}>
            <AnimatedCounter value={m.warehouses} className={styles.panelBigStat} />
            <p>{t('panel.warehousesDesc')}</p>
            <AnimatedCounter value={m.transport} className={styles.panelSubStat} />
            <span>{t('panel.transportOffers')}</span>
          </div>
        )}
        {tab === 'routes' && (
          <ul className={styles.routeList}>
            {cityRoutes.map((route) => {
              const destId = route.fromCityId === city.id ? route.toCityId : route.fromCityId;
              const destName = getMapCityById(destId)?.name ?? destId;
              return (
                <li key={route.id} className={styles.routeListItem}>
                  <span className={`${styles.routeMode} ${styles[`routeMode${route.mode}`]}`}>
                    {t(`layers.${route.mode}`)}
                  </span>
                  <span>{destName}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <button type="button" className={styles.panelAction} onClick={() => onOpenWorkspace(city)}>
        {tab === 'routes' ? t('panel.allRoutes') : t('panel.openWorkspace')}
      </button>
    </aside>
    </>
  );
}
