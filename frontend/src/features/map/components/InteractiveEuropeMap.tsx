import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapProvider, useMapContext } from '../context/MapContext';
import { EuropeBusinessMap } from './EuropeBusinessMap';
import { MapNavigationBar } from './MapNavigationBar';
import styles from '../InteractiveEuropeMap.module.css';

function InteractiveMapInner() {
  const { t } = useTranslation('map');
  const containerRef = useRef<HTMLDivElement>(null);
  const { countries, selectCountry, selectCity, navigation } = useMapContext();

  return (
    <div ref={containerRef} className={styles.interactive} aria-label={t('title')}>
      <MapNavigationBar />

      <div className={styles.canvasWrap}>
        <EuropeBusinessMap
          countries={countries}
          selectedCountryCode={navigation.selectedCountryCode ?? undefined}
          onCountrySelect={selectCountry}
          onOpenWorkspace={selectCity}
        />
      </div>

      <p className={styles.hint}>{t('interactionHint')}</p>
    </div>
  );
}

interface InteractiveEuropeMapProps {
  className?: string;
}

export function InteractiveEuropeMap({ className = '' }: InteractiveEuropeMapProps) {
  return (
    <MapProvider>
      <div className={`${styles.root} ${className}`}>
        <InteractiveMapInner />
      </div>
    </MapProvider>
  );
}
