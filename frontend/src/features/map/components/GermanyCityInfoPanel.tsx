import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { getRoutesForCity } from '../data/routeData';
import { getMapCityById } from '../data/mapData';
import type { MapCityRecord, CityPanelTab } from '../types/mapTypes';
import styles from './EuropeBusinessMap.module.css';

interface GermanyCityInfoPanelProps {
  city: MapCityRecord;
  open?: boolean;
  onClose: () => void;
  onToggle?: () => void;
  onOpenWorkspace: (city: MapCityRecord) => void;
}

const TABS: CityPanelTab[] = [
  'overview',
  'companies',
  'jobs',
  'transport',
  'warehouses',
  'marketplace',
  'services',
  'analytics',
  'partners',
  'routes',
  'activity',
];

export function GermanyCityInfoPanel({
  city,
  open = true,
  onClose,
  onToggle,
  onOpenWorkspace,
}: GermanyCityInfoPanelProps) {
  const { t } = useTranslation('map');
  const [tab, setTab] = useState<CityPanelTab>('overview');

  const profile = city.germanyProfile;
  const m = city.metrics;
  const cityRoutes = getRoutesForCity(city.id).slice(0, 8);
  const population = profile?.population ?? m.population;

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
        className={`${styles.infoPanel} ${styles.infoPanelGermany} ${open ? styles.infoPanelOpen : styles.infoPanelCollapsed}`}
        aria-label={t('panel.title', { city: city.name })}
      >
        <button type="button" className={styles.panelClose} onClick={onClose} aria-label={t('panel.close')}>
          ×
        </button>

        <div className={styles.panelPreview} aria-hidden>
          <div className={styles.panelPreviewGradient} />
          <span className={styles.panelPreviewCity}>{city.name}</span>
        </div>

        <header className={styles.panelHeader}>
          <h3>{city.name}</h3>
          <p>
            {profile?.bundeslandName ?? city.country}
            {profile ? ` · ${t('germany.gdpShort', { value: profile.gdpEstimateBillionEur })}` : ''}
          </p>
        </header>

        <nav className={`${styles.panelTabs} ${styles.panelTabsScroll}`}>
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
            <>
              <div className={styles.germanyScoreRow}>
                {profile?.financeScore != null && (
                  <span className={styles.germanyScoreChip}>{t('germany.finance')} {profile.financeScore}</span>
                )}
                {profile?.techScore != null && (
                  <span className={styles.germanyScoreChip}>{t('germany.tech')} {profile.techScore}</span>
                )}
                {profile?.logisticsScore != null && (
                  <span className={styles.germanyScoreChip}>{t('germany.logistics')} {profile.logisticsScore}</span>
                )}
                {profile?.innovationScore != null && (
                  <span className={styles.germanyScoreChip}>{t('germany.innovation')} {profile.innovationScore}</span>
                )}
              </div>
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
              <div className={styles.germanyMetaGrid}>
                <div>
                  <span className={styles.germanyMetaLabel}>{t('germany.population')}</span>
                  <span className={styles.germanyMetaValue}>{population.toLocaleString()}</span>
                </div>
                <div>
                  <span className={styles.germanyMetaLabel}>{t('germany.federalState')}</span>
                  <span className={styles.germanyMetaValue}>{profile?.bundeslandName ?? '—'}</span>
                </div>
                <div>
                  <span className={styles.germanyMetaLabel}>{t('germany.mainIndustry')}</span>
                  <span className={styles.germanyMetaValue}>{profile?.mainIndustry ?? '—'}</span>
                </div>
                <div>
                  <span className={styles.germanyMetaLabel}>{t('germany.transportRole')}</span>
                  <span className={styles.germanyMetaValue}>{profile?.transportRole ?? '—'}</span>
                </div>
              </div>
            </>
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

          {tab === 'transport' && profile && (
            <ul className={styles.germanyList}>
              {profile.infrastructure.motorwayConnections.map((mwy) => (
                <li key={mwy}>{mwy}</li>
              ))}
              <li>{profile.infrastructure.railwayCargoTerminal}</li>
              {profile.infrastructure.inlandPort && <li>{profile.infrastructure.inlandPort}</li>}
            </ul>
          )}

          {tab === 'warehouses' && (
            <div className={styles.panelStatBlock}>
              <AnimatedCounter value={m.warehouses} className={styles.panelBigStat} />
              <p>{t('panel.warehousesDesc')}</p>
              {profile && (
                <ul className={styles.germanyList}>
                  {profile.infrastructure.logisticsHubs.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === 'marketplace' && (
            <div className={styles.panelStatBlock}>
              <AnimatedCounter value={m.marketplace} className={styles.panelBigStat} />
              <p>{t('germany.marketplaceDesc')}</p>
            </div>
          )}

          {tab === 'services' && (
            <ul className={styles.germanyList}>
              {profile?.infrastructure.industrialZones.map((z) => (
                <li key={z}>{z}</li>
              ))}
              {profile?.infrastructure.airports.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          )}

          {tab === 'analytics' && profile && (
            <div className={styles.germanyAnalytics}>
              <div className={styles.germanyAnalyticsBar}>
                <span>{t('germany.logistics')}</span>
                <div className={styles.countryAiBar}>
                  <div className={styles.countryAiFill} style={{ width: `${profile.logisticsScore ?? 50}%` }} />
                </div>
              </div>
              <div className={styles.germanyAnalyticsBar}>
                <span>{t('panel.aiScore')}</span>
                <div className={styles.countryAiBar}>
                  <div className={styles.countryAiFill} style={{ width: `${m.aiScore}%` }} />
                </div>
              </div>
              <p className={styles.germanyGdpLine}>
                {t('germany.gdpEstimate', { value: profile.gdpEstimateBillionEur })}
              </p>
            </div>
          )}

          {tab === 'partners' && profile && (
            <ul className={styles.germanyPartnerList}>
              {profile.topTradePartners.map((p) => (
                <li key={p.countryCode}>
                  <span>{p.partner}</span>
                  <span>{p.volumeMillionEur} Mio. €</span>
                </li>
              ))}
            </ul>
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

          {tab === 'activity' && profile && (
            <ul className={styles.germanyActivityList}>
              {profile.recentActivity.map((a) => (
                <li key={a.id}>
                  <span className={styles.germanyActivityType}>{a.type}</span>
                  <span>{a.label}</span>
                  <span className={styles.germanyActivityTime}>{a.timestamp}</span>
                </li>
              ))}
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
