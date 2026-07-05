import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { getRoutesForCity } from '../data/routeData';
import { getMapCityById } from '../data/mapData';
import { getNearbyInfrastructureForCity } from '../data/germany/germanyInfrastructureUtils';
import type { GermanyInfrastructureHub, GermanyLocalServiceNode } from '../types/germanyTypes';
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

function InfrastructureHubList({
  hubs,
  t,
}: {
  hubs: GermanyInfrastructureHub[];
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  if (hubs.length === 0) return null;
  return (
    <ul className={styles.germanyInfraList}>
      {hubs.map((hub) => (
        <li key={hub.id} className={styles.germanyInfraItem}>
          <span className={styles.germanyInfraName}>{hub.name}</span>
          <span className={styles.germanyInfraMeta}>
            {t('germany.infrastructure.importance', { score: hub.importanceScore })}
            {' · '}
            {t('panel.transportOffers')}: {hub.transportOffers}
          </span>
          <span className={styles.germanyInfraDesc}>{hub.description}</span>
        </li>
      ))}
    </ul>
  );
}

function LocalServiceNodeSection({
  local,
  t,
}: {
  local: GermanyLocalServiceNode;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  return (
    <div className={styles.germanyLocalSection}>
      <h4 className={styles.germanyInfraTitle}>{t('germany.localNode.title')}</h4>
      <p className={styles.germanyLocalRegion}>
        {local.region} · {local.federalState}
      </p>
      <div className={styles.germanyMetaGrid}>
        <div>
          <span className={styles.germanyMetaLabel}>{t('germany.localNode.nearestHub')}</span>
          <span className={styles.germanyMetaValue}>{local.nearestMajorCity}</span>
        </div>
        <div>
          <span className={styles.germanyMetaLabel}>{t('germany.localNode.hubRoute')}</span>
          <span className={styles.germanyMetaValue}>{local.recommendedHubRoute}</span>
        </div>
      </div>
      <span className={styles.germanyInfraGroupLabel}>{t('germany.localNode.useCases')}</span>
      <ul className={styles.germanyList}>
        {local.mainUseCases.map((uc) => (
          <li key={uc}>{t(`germany.localNode.useCase.${uc}`)}</li>
        ))}
      </ul>
      <span className={styles.germanyInfraGroupLabel}>{t('germany.localNode.transport')}</span>
      <ul className={styles.germanyList}>
        {local.smallTransport.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <span className={styles.germanyInfraGroupLabel}>{t('germany.localNode.warehouses')}</span>
      <ul className={styles.germanyList}>
        {local.storageOptions.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <span className={styles.germanyInfraGroupLabel}>{t('germany.localNode.services')}</span>
      <ul className={styles.germanyList}>
        {local.localServices.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <span className={styles.germanyInfraGroupLabel}>{t('germany.localNode.craft')}</span>
      <ul className={styles.germanyList}>
        {local.craftServices.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </div>
  );
}

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
  const localNode = city.localServiceNode;
  const m = city.metrics;
  const cityRoutes = getRoutesForCity(city.id).slice(0, 8);
  const population = profile?.population ?? m.population;
  const nearbyInfra = useMemo(() => getNearbyInfrastructureForCity(city.id), [city.id]);
  const hasNearbyInfra =
    nearbyInfra.seaports.length > 0 ||
    nearbyInfra.inlandPorts.length > 0 ||
    nearbyInfra.airCargo.length > 0 ||
    nearbyInfra.industrialZones.length > 0;

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
              {localNode && <LocalServiceNodeSection local={localNode} t={t} />}
              {hasNearbyInfra && (
                <div className={styles.germanyInfraSection}>
                  <h4 className={styles.germanyInfraTitle}>{t('germany.infrastructure.nearbyTitle')}</h4>
                  {nearbyInfra.seaports.length > 0 && (
                    <>
                      <span className={styles.germanyInfraGroupLabel}>{t('germany.infrastructure.seaports')}</span>
                      <InfrastructureHubList hubs={nearbyInfra.seaports} t={t} />
                    </>
                  )}
                  {nearbyInfra.inlandPorts.length > 0 && (
                    <>
                      <span className={styles.germanyInfraGroupLabel}>{t('germany.infrastructure.inlandPorts')}</span>
                      <InfrastructureHubList hubs={nearbyInfra.inlandPorts} t={t} />
                    </>
                  )}
                  {nearbyInfra.airCargo.length > 0 && (
                    <>
                      <span className={styles.germanyInfraGroupLabel}>{t('germany.infrastructure.airCargo')}</span>
                      <InfrastructureHubList hubs={nearbyInfra.airCargo} t={t} />
                    </>
                  )}
                  {nearbyInfra.industrialZones.length > 0 && (
                    <>
                      <span className={styles.germanyInfraGroupLabel}>{t('germany.infrastructure.industrialZones')}</span>
                      <InfrastructureHubList hubs={nearbyInfra.industrialZones} t={t} />
                    </>
                  )}
                </div>
              )}
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
              <AnimatedCounter value={localNode?.jobs ?? m.jobs} className={styles.panelBigStat} />
              <p>{t('germany.localNode.jobsDesc')}</p>
              {localNode && (
                <p className={styles.germanyLocalRoute}>
                  {t('germany.localNode.jobsViaHub', { hub: localNode.nearestMajorCity })}
                </p>
              )}
            </div>
          )}

          {tab === 'transport' && profile && (
            <>
              {localNode ? (
                <>
                  <ul className={styles.germanyList}>
                    {localNode.smallTransport.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                    {localNode.movingServices.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <p className={styles.germanyLocalRoute}>{localNode.recommendedHubRoute}</p>
                </>
              ) : (
                <ul className={styles.germanyList}>
                  {profile.infrastructure.motorwayConnections.map((mwy) => (
                    <li key={mwy}>{mwy}</li>
                  ))}
                  <li>{profile.infrastructure.railwayCargoTerminal}</li>
                  {profile.infrastructure.inlandPort && <li>{profile.infrastructure.inlandPort}</li>}
                  {profile.infrastructure.airports.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              )}
              {hasNearbyInfra && (
                <div className={styles.germanyInfraSection}>
                  <h4 className={styles.germanyInfraTitle}>{t('germany.infrastructure.nearbyTitle')}</h4>
                  {nearbyInfra.seaports.length > 0 && (
                    <>
                      <span className={styles.germanyInfraGroupLabel}>{t('germany.infrastructure.seaports')}</span>
                      <InfrastructureHubList hubs={nearbyInfra.seaports} t={t} />
                    </>
                  )}
                  {nearbyInfra.inlandPorts.length > 0 && (
                    <>
                      <span className={styles.germanyInfraGroupLabel}>{t('germany.infrastructure.inlandPorts')}</span>
                      <InfrastructureHubList hubs={nearbyInfra.inlandPorts} t={t} />
                    </>
                  )}
                  {nearbyInfra.airCargo.length > 0 && (
                    <>
                      <span className={styles.germanyInfraGroupLabel}>{t('germany.infrastructure.airCargo')}</span>
                      <InfrastructureHubList hubs={nearbyInfra.airCargo} t={t} />
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {tab === 'warehouses' && (
            <div className={styles.panelStatBlock}>
              <AnimatedCounter value={m.warehouses} className={styles.panelBigStat} />
              <p>{t('panel.warehousesDesc')}</p>
              {localNode ? (
                <ul className={styles.germanyList}>
                  {localNode.storageOptions.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              ) : profile && (
                <ul className={styles.germanyList}>
                  {profile.infrastructure.logisticsHubs.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              )}
              {nearbyInfra.industrialZones.length > 0 && (
                <div className={styles.germanyInfraSection}>
                  <span className={styles.germanyInfraGroupLabel}>{t('germany.infrastructure.industrialZones')}</span>
                  <InfrastructureHubList hubs={nearbyInfra.industrialZones} t={t} />
                </div>
              )}
            </div>
          )}

          {tab === 'marketplace' && (
            <div className={styles.panelStatBlock}>
              <AnimatedCounter
                value={localNode?.marketplaceOffers ?? m.marketplace}
                className={styles.panelBigStat}
              />
              <p>{t('germany.localNode.marketplaceDesc')}</p>
            </div>
          )}

          {tab === 'services' && (
            <>
              {localNode ? (
                <>
                  <ul className={styles.germanyList}>
                    {localNode.localServices.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                    {localNode.craftServices.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <span className={styles.germanyInfraGroupLabel}>{t('germany.localNode.nearbyHubs')}</span>
                  <ul className={styles.germanyList}>
                    {localNode.nearbyHubs.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <ul className={styles.germanyList}>
                    {profile?.infrastructure.industrialZones.map((z) => (
                      <li key={z}>{z}</li>
                    ))}
                    {profile?.infrastructure.airports.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                  {nearbyInfra.industrialZones.length > 0 && (
                    <div className={styles.germanyInfraSection}>
                      <span className={styles.germanyInfraGroupLabel}>{t('germany.infrastructure.industrialZones')}</span>
                      <InfrastructureHubList hubs={nearbyInfra.industrialZones} t={t} />
                    </div>
                  )}
                </>
              )}
            </>
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
              {profile.sustainabilityScore != null && (
                <div className={styles.germanyAnalyticsBar}>
                  <span>{t('germany.sustainability')}</span>
                  <div className={styles.countryAiBar}>
                    <div className={styles.countryAiFill} style={{ width: `${profile.sustainabilityScore}%` }} />
                  </div>
                </div>
              )}
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
