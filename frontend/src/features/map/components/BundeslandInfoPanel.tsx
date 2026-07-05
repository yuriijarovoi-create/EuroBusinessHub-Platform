import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { getBundeslandById, CITY_BUNDESLAND_MAP } from '../data/germany/bundeslandData';
import { getBundeslandStats } from '../data/germany/germanyCityProfiles';
import type { MapCityRecord } from '../types/mapTypes';
import styles from './EuropeBusinessMap.module.css';

interface BundeslandInfoPanelProps {
  bundeslandId: string;
  cities: MapCityRecord[];
  open?: boolean;
  onClose: () => void;
}

export function BundeslandInfoPanel({
  bundeslandId,
  cities,
  open = true,
  onClose,
}: BundeslandInfoPanelProps) {
  const { t, i18n } = useTranslation('map');
  const bl = getBundeslandById(bundeslandId);

  const cityIds = useMemo(
    () =>
      cities
        .filter((c) => CITY_BUNDESLAND_MAP[c.id] === bundeslandId)
        .map((c) => c.id),
    [cities, bundeslandId],
  );

  const businessesSum = useMemo(
    () => cities.filter((c) => cityIds.includes(c.id)).reduce((s, c) => s + c.businesses, 0),
    [cities, cityIds],
  );

  const stats = useMemo(
    () => getBundeslandStats(bundeslandId, cityIds, businessesSum),
    [bundeslandId, cityIds, businessesSum],
  );

  if (!open || !bl) return null;

  const displayName = i18n.language === 'en' ? bl.nameEn : bl.name;

  return (
    <aside
      className={styles.bundeslandPanel}
      aria-label={t('germany.bundeslandTitle', { name: displayName })}
    >
      <button type="button" className={styles.panelClose} onClick={onClose} aria-label={t('panel.close')}>
        ×
      </button>
      <header className={styles.countryHeader}>
        <h3>{displayName}</h3>
        <p>{t('germany.bundeslandSubtitle')}</p>
      </header>
      <div className={styles.panelMetrics}>
        {(
          [
            ['cities', stats.cityCount],
            ['gdp', stats.gdpEstimateBillionEur],
            ['logistics', stats.logisticsScore],
            ['businesses', stats.totalBusinesses],
          ] as const
        ).map(([key, value]) => (
          <div key={key} className={styles.panelMetric}>
            {key === 'gdp' ? (
              <span className={styles.panelMetricValue}>{value} Mrd. €</span>
            ) : (
              <AnimatedCounter value={value} className={styles.panelMetricValue} />
            )}
            <span className={styles.panelMetricLabel}>{t(`germany.stats.${key}`)}</span>
          </div>
        ))}
      </div>
      <p className={styles.countryHint}>{t('germany.selectCityInState')}</p>
    </aside>
  );
}
