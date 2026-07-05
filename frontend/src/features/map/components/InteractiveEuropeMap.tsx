import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapProvider, useMapContext } from '../context/MapContext';
import { getMapCityById } from '../data/mapData';
import { EuropeBusinessMap } from './EuropeBusinessMap';
import { MapNavigationBar } from './MapNavigationBar';
import styles from '../InteractiveEuropeMap.module.css';

function InteractiveMapInner({ focusCityId }: { focusCityId?: string }) {
  const { t } = useTranslation('map');
  const containerRef = useRef<HTMLDivElement>(null);
  const { countries, selectCountry, selectCity, navigation } = useMapContext();

  useEffect(() => {
    if (!focusCityId) return;
    const city = getMapCityById(focusCityId);
    if (!city) return;
    const country = countries.find((c) => c.code === city.countryCode);
    if (country && navigation.selectedCountryCode !== country.code) {
      selectCountry(country);
    }
  }, [focusCityId, countries, navigation.selectedCountryCode, selectCountry]);

  return (
    <div ref={containerRef} className={styles.interactive} aria-label={t('title')}>
      <MapNavigationBar />

      <div className={styles.canvasWrap}>
        <EuropeBusinessMap
          countries={countries}
          selectedCountryCode={navigation.selectedCountryCode ?? undefined}
          focusCityId={focusCityId}
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
  focusCityId?: string;
}

export function InteractiveEuropeMap({ className = '', focusCityId }: InteractiveEuropeMapProps) {
  return (
    <MapProvider>
      <div className={`${styles.root} ${className}`}>
        <InteractiveMapInner focusCityId={focusCityId} />
      </div>
    </MapProvider>
  );
}
