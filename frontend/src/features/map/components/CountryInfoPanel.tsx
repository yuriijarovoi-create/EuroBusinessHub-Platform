import { useTranslation } from 'react-i18next';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import type { MapCountry } from '@shared/types';
import { getCountryStatsForMap } from '../data/countryStats';
import { BUNDESLAENDER } from '../data/germany/bundeslandData';
import styles from './EuropeBusinessMap.module.css';

interface CountryInfoPanelProps {
  country: MapCountry | null;
  open?: boolean;
  onClose: () => void;
  onBundeslandSelect?: (bundeslandId: string) => void;
  selectedBundeslandId?: string;
}

export function CountryInfoPanel({
  country,
  open = true,
  onClose,
  onBundeslandSelect,
  selectedBundeslandId,
}: CountryInfoPanelProps) {
  const { t, i18n } = useTranslation('map');
  if (!country || !open) return null;

  const stats = getCountryStatsForMap(country);
  if (!stats) return null;

  const isGermany = country.code === 'DE';

  return (
    <aside className={styles.countryPanel} aria-label={t('country.title', { country: country.name })}>
      <button type="button" className={styles.panelClose} onClick={onClose} aria-label={t('panel.close')}>
        ×
      </button>
      <header className={styles.countryHeader}>
        <h3>{country.name}</h3>
        <p>{t('country.cities', { count: stats.cityCount })}</p>
      </header>
      <div className={styles.countryAiScore}>
        <span className={styles.countryAiLabel}>{t('country.aiScore')}</span>
        <span className={styles.countryAiValue}>{stats.aiScore}</span>
        <div className={styles.countryAiBar}>
          <div className={styles.countryAiFill} style={{ width: `${stats.aiScore}%` }} />
        </div>
      </div>
      <div className={styles.panelMetrics}>
        {(
          [
            ['companies', stats.companies],
            ['jobs', stats.jobs],
            ['warehouses', stats.warehouses],
            ['transport', stats.transport],
            ['marketplace', stats.marketplace],
            ['partners', stats.partners],
          ] as const
        ).map(([key, value]) => (
          <div key={key} className={styles.panelMetric}>
            <AnimatedCounter value={value} className={styles.panelMetricValue} />
            <span className={styles.panelMetricLabel}>{t(`panel.${key}`)}</span>
          </div>
        ))}
      </div>
      {isGermany && onBundeslandSelect && (
        <>
          <p className={styles.germanySectionLabel}>{t('germany.bundeslandPicker')}</p>
          <div className={styles.bundeslandGrid}>
            {BUNDESLAENDER.map((bl) => {
              const label = i18n.language === 'en' ? bl.nameEn : bl.name;
              return (
                <button
                  key={bl.id}
                  type="button"
                  className={`${styles.bundeslandChip} ${selectedBundeslandId === bl.id ? styles.bundeslandChipActive : ''}`}
                  onClick={() => onBundeslandSelect(bl.id)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </>
      )}
      <p className={styles.countryHint}>{t('country.selectCity')}</p>
    </aside>
  );
}
